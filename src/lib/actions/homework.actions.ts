"use server";

import Homework from "@/lib/db/models/Homework";
import Student from "@/lib/db/models/Student";
import connectDB from "@/lib/db/connect";
import mongoose from "mongoose";

export async function getStudentHomework(studentId: string, schoolId: string, limit?: number) {
    console.log("STUDENT PORTAL QUERY: getStudentHomework", { schoolId, studentId, limit });
    await connectDB();

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(schoolId)) {
        console.error("Invalid IDs provided to getStudentHomework", { studentId, schoolId });
        return [];
    }

    const student = await Student.findById(studentId).select("class section").lean();
    if (!student) {
        console.error("Student profile not found", { studentId });
        return [];
    }

    const query: any = {
        school: schoolId,
        class: student.class,
    };

    // Filter by section if student has one. If homework section is null, it's for whole class.
    if (student.section) {
        query.$or = [
            { section: student.section },
            { section: null }, // Global class homework
            { section: { $exists: false } }
        ];
    } else {
        // If student has no section (unlikely but possible), show class-wide
        query.$or = [
            { section: null },
            { section: { $exists: false } }
        ];
    }

    let queryBuilder = Homework.find(query)
        .populate("teacher", "name")
        .sort({ dueDate: 1, createdAt: -1 });

    if (limit) {
        queryBuilder = queryBuilder.limit(limit);
    }

    const homework = await queryBuilder.lean();

    return JSON.parse(JSON.stringify(homework));
}
