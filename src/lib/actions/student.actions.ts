"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Student, { IStudent } from "@/lib/db/models/Student";
import Guardian from "@/lib/db/models/Guardian";
import AuditLog from "@/lib/db/models/AuditLog";
import { studentSchema, studentUpdateSchema } from "@/lib/validators/student";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";

export async function createStudent(data: z.infer<typeof studentSchema>) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    const validated = studentSchema.parse(data);

    await connectDB();

    // Check admission number uniqueness
    const existing = await Student.findOne({
        school: session.user.schoolId,
        admissionNumber: validated.admissionNumber,
    });
    if (existing) {
        throw new Error("Admission number already exists");
    }

    const student = await Student.create({
        ...validated,
        school: session.user.schoolId,
    });

    await AuditLog.create({
        school: session.user.schoolId,
        actor: session.user.id,
        action: "CREATE_STUDENT",
        target: student._id.toString(),
        details: { name: `${student.firstName} ${student.lastName}` },
    });

    revalidatePath("/school/students");
    return JSON.parse(JSON.stringify(student));
}

export async function updateStudent(id: string, data: z.infer<typeof studentUpdateSchema>) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    const validated = studentUpdateSchema.parse(data);
    await connectDB();

    const student = await Student.findOne({ _id: id, school: session.user.schoolId });
    if (!student) throw new Error("Student not found");

    const updated = await Student.findByIdAndUpdate(id, validated, { new: true });

    await AuditLog.create({
        school: session.user.schoolId,
        actor: session.user.id,
        action: "UPDATE_STUDENT",
        target: id,
        details: { changes: validated },
    });

    revalidatePath("/school/students");
    revalidatePath(`/school/students/${id}`);
    return JSON.parse(JSON.stringify(updated));
}

export async function getStudents(query: {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
    status?: string;
}) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { school: session.user.schoolId };

    if (query.search) {
        const searchRegex = new RegExp(query.search, "i");
        filter.$or = [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { admissionNumber: searchRegex },
            { email: searchRegex },
        ];
    }

    if (query.classId) {
        filter.class = query.classId;
    }

    if (query.status) {
        filter.status = query.status;
    }

    const students = await Student.find(filter)
        .populate("class", "name")
        .populate("section", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Student.countDocuments(filter);

    return {
        students: JSON.parse(JSON.stringify(students)),
        total,
        pages: Math.ceil(total / limit),
    };
}

export async function getStudentById(id: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const student = await Student.findOne({ _id: id, school: session.user.schoolId })
        .populate("class")
        .populate("section")
        .populate("guardians")
        .populate("house")
        .populate("category")
        .lean();

    if (!student) return null;

    return JSON.parse(JSON.stringify(student));
}

export async function deleteStudent(id: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const student = await Student.findOneAndDelete({ _id: id, school: session.user.schoolId });
    if (!student) throw new Error("Student not found");

    await AuditLog.create({
        school: session.user.schoolId,
        actor: session.user.id,
        action: "DELETE_STUDENT",
        target: id,
        details: { name: `${student.firstName} ${student.lastName}` },
    });

    revalidatePath("/school/students");
    return { success: true };
}

export async function addGuardianToStudent(studentId: string, guardianId: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) throw new Error("Unauthorized");

    await connectDB();

    // Update Student to add Guardian ID
    await Student.findByIdAndUpdate(studentId, {
        $addToSet: { guardians: guardianId }
    });

    await AuditLog.create({
        school: session.user.schoolId,
        actor: session.user.id,
        action: "LINK_GUARDIAN",
        target: studentId,
        details: { guardianId },
    });

    revalidatePath(`/school/students/${studentId}`);
    return { success: true };
}

export async function removeGuardianFromStudent(studentId: string, guardianId: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) throw new Error("Unauthorized");

    await connectDB();

    await Student.findByIdAndUpdate(studentId, {
        $pull: { guardians: guardianId }
    });

    await AuditLog.create({
        school: session.user.schoolId,
        actor: session.user.id,
        action: "UNLINK_GUARDIAN",
        target: studentId,
        details: { guardianId },
    });

    revalidatePath(`/school/students/${studentId}`);
    return { success: true };
}
