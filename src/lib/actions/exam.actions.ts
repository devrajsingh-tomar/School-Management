"use server";

import { z } from "zod";
import Exam, { IExamSubject } from "@/lib/db/models/Exam";
import Result from "@/lib/db/models/Result";
import Student from "@/lib/db/models/Student";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { ActionState } from "@/lib/types/actions";

// --- EXAM MANAGEMENT ---

export async function createExam(prevStateOrFormData: any, formData?: FormData): Promise<ActionState<null>> {
    const data = (prevStateOrFormData instanceof FormData) ? prevStateOrFormData : formData;
    if (!data) return { success: false, data: null, message: "Invalid Data" };

    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    const name = data.get("name") as string;
    const type = data.get("type") as string;
    const classId = data.get("classId") as string;
    const startDateStr = data.get("startDate") as string;
    const endDateStr = data.get("endDate") as string;

    if (!name || !type || !classId || !startDateStr || !endDateStr) {
        return { success: false, data: null, message: "Missing required fields" };
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Parse subjects
    const subjectsStr = data.get("subjects") as string;
    let subjects: IExamSubject[] = [];
    try {
        subjects = JSON.parse(subjectsStr);
    } catch {
        return { success: false, data: null, message: "Invalid subjects format" };
    }

    await connectDB();
    await Exam.create({
        school: session.user.schoolId,
        name,
        type,
        class: classId,
        startDate,
        endDate,
        subjects,
        isPublished: false,
        isActive: true
    });

    revalidatePath("/school/exams");
    return { success: true, data: null, message: "Exam Created" };
}

export async function getExams(classId?: string): Promise<any[]> {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const query: any = { school: session.user.schoolId };
    if (classId) query.class = classId;

    const exams = await Exam.find(query)
        .populate("class", "name")
        .sort({ startDate: -1 })
        .lean();

    return JSON.parse(JSON.stringify(exams));
}

export async function getExamWithResults(examId: string): Promise<any | null> {
    await connectDB();
    const exam = await Exam.findById(examId).populate("class").populate("subjects").lean();
    if (!exam) return null;

    // Fetch students for this class
    const students = await Student.find({ class: (exam as any).class._id, isActive: true })
        .sort({ firstName: 1 })
        .lean();

    // Fetch existing results
    const results = await Result.find({ exam: examId }).lean();

    return {
        exam: JSON.parse(JSON.stringify(exam)),
        students: JSON.parse(JSON.stringify(students)),
        results: JSON.parse(JSON.stringify(results))
    };
}

// --- MARKS ENTRY ---

export async function getExamById(id: string): Promise<any> {
    await connectDB();
    const exam = await Exam.findById(id).populate("class", "name").lean();
    return JSON.parse(JSON.stringify(exam));
}

export async function getMarksForExam(examId: string): Promise<any[]> {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    // Return all results for this exam, populated with student details
    const results = await Result.find({ exam: examId })
        .populate("student", "firstName lastName admissionNumber")
        .sort({ "student.rollNumber": 1 })
        .lean();

    return JSON.parse(JSON.stringify(results));
}

export async function saveExamResults(arg1: any, arg2?: FormData): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    await connectDB();

    let examId: string;
    let updates: { studentId: string; subjectScores: { subject: string; marksObtained: number }[] }[];

    if (arg2 instanceof FormData) {
        // Form Action: (prevState, formData)
        const formData = arg2;
        examId = formData.get("examId") as string;
        const exam = await Exam.findById(examId);
        if (!exam) return { success: false, data: null, message: "Exam not found" };

        const studentIds = formData.getAll("studentIds") as string[];
        updates = studentIds.map(studentId => {
            const subjectScores: any[] = [];
            exam.subjects.forEach((sub: any) => {
                const marksVal = formData.get(`marks-${studentId}-${sub.name}`);
                const marks = parseFloat(marksVal as string || "0");
                subjectScores.push({ subject: sub.name, marksObtained: marks });
            });
            // Total marks fallback
            if (subjectScores.length === 0 || subjectScores.every(s => s.marksObtained === 0)) {
                const totalMarksVal = formData.get(`marks-${studentId}-Total`);
                const totalMarks = parseFloat(totalMarksVal as string || "0");
                if (totalMarks > 0) {
                    subjectScores.push({ subject: "Total", marksObtained: totalMarks });
                }
            }
            return { studentId, subjectScores };
        });
    } else {
        // Direct Action: (data)
        const data = arg1 as { examId: string; studentId: string; subjectScores: { subject: string; marksObtained: number }[] };
        examId = data.examId;
        updates = [{ studentId: data.studentId, subjectScores: data.subjectScores }];
    }

    const exam = await Exam.findById(examId);
    if (!exam) return { success: false, data: null, message: "Exam not found" };

    for (const update of updates) {
        let totalObtained = 0;
        let totalMax = 0;
        let hasFailed = false;

        update.subjectScores.forEach(s => {
            const subDef = exam.subjects.find((def: any) => def.name === s.subject) || { maxMarks: 100, passingMarks: 33 };
            totalObtained += s.marksObtained;
            totalMax += subDef.maxMarks;
            if (s.marksObtained < subDef.passingMarks) hasFailed = true;
        });

        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
        let grade = "F";
        if (!hasFailed) {
            if (percentage >= 90) grade = "A+";
            else if (percentage >= 80) grade = "A";
            else if (percentage >= 70) grade = "B";
            else if (percentage >= 60) grade = "C";
            else if (percentage >= 50) grade = "D";
            else grade = "E";
        }

        await Result.findOneAndUpdate(
            { exam: examId, student: update.studentId },
            {
                school: session.user.schoolId,
                exam: examId,
                student: update.studentId,
                class: exam.class,
                subjectScores: update.subjectScores,
                totalObtained,
                totalMax,
                percentage,
                grade,
                status: hasFailed ? "FAIL" : "PASS"
            },
            { upsert: true, new: true }
        );
    }

    revalidatePath(`/school/exams`);
    return { success: true, data: null, message: "Results saved successfully" };
}

// --- RESULT PROCESSING ---

export async function publishExamResults(examId: string): Promise<void> {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

    // Calculate Ranks
    const results = await Result.find({ exam: examId }).sort({ totalObtained: -1 });

    const bulkOps = results.map((r, index) => ({
        updateOne: {
            filter: { _id: r._id },
            update: { $set: { rank: index + 1, isLocked: true } }
        }
    }));

    if (bulkOps.length > 0) {
        await Result.bulkWrite(bulkOps);
    }

    await Exam.findByIdAndUpdate(examId, { isPublished: true });

    revalidatePath(`/school/exams/${examId}/results`);
}

export async function getStudentResults(studentId: string, schoolId: string): Promise<any[]> {
    console.log("STUDENT PORTAL QUERY: getStudentResults", { schoolId, studentId });
    await connectDB();

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(schoolId)) {
        console.error("Invalid IDs provided to getStudentResults", { studentId, schoolId });
        return [];
    }

    // Find results for student in school
    const results = await Result.find({
        student: studentId,
        school: schoolId
    })
        .populate({
            path: "exam",
            select: "name type isPublished startDate",
            match: { isPublished: true } // Only return results for published exams
        })
        .populate("class", "name")
        .sort({ createdAt: -1 })
        .lean();

    // Filter out results where exam is null (because matching failed due to isPublished: false)
    const publishedResults = results.filter((r: any) => r.exam !== null);

    return JSON.parse(JSON.stringify(publishedResults));
}
