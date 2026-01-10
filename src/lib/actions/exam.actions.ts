"use server";

import { z } from "zod";
import Exam, { IExamSubject } from "@/lib/db/models/Exam";
import Result from "@/lib/db/models/Result";
import Student from "@/lib/db/models/Student";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// --- EXAM MANAGEMENT ---

export async function createExam(formData: FormData) {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const classId = formData.get("classId") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    // Parse subjects from JSON string (client side will stringify table rows)
    const subjectsStr = formData.get("subjects") as string;
    const subjects: IExamSubject[] = JSON.parse(subjectsStr);

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
    return { message: "Exam Created" };
}

export async function getExams(classId?: string) {
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

// --- MARKS ENTRY ---

export async function getExamById(id: string) {
    await connectDB();
    const exam = await Exam.findById(id).populate("class", "name").lean();
    return JSON.parse(JSON.stringify(exam));
}

export async function getMarksForExam(examId: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    // Return all results for this exam, populated with student details
    const results = await Result.find({ exam: examId })
        .populate("student", "firstName lastName admissionNumber")
        .sort({ "student.rollNumber": 1 }) // Assuming rollNumber exists or sort by admission
        .lean();

    return JSON.parse(JSON.stringify(results));
}

export async function updateStudentMarks(data: {
    examId: string;
    studentId: string;
    classId: string;
    subjectScores: { subject: string; marksObtained: number }[];
}) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();
    const exam = await Exam.findById(data.examId);
    if (!exam) throw new Error("Exam not found");

    // Calculate totals on fly
    let totalObtained = 0;
    let totalMax = 0;
    let hasFailed = false;

    data.subjectScores.forEach(s => {
        const subDef = exam.subjects.find((def: any) => def.name === s.subject);
        if (subDef) {
            totalObtained += s.marksObtained;
            totalMax += subDef.maxMarks;
            if (s.marksObtained < subDef.passingMarks) hasFailed = true;
        }
    });

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    // Logic for Grade
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
        { exam: data.examId, student: data.studentId },
        {
            school: session.user.schoolId,
            exam: data.examId,
            student: data.studentId,
            class: data.classId,
            subjectScores: data.subjectScores,
            totalObtained,
            totalMax,
            percentage,
            grade,
            status: hasFailed ? "FAIL" : "PASS"
        },
        { upsert: true, new: true }
    );

    revalidatePath(`/school/exams`);
}

// --- RESULT PROCESSING ---

export async function publishExamResults(examId: string) {
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
