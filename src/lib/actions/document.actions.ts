"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import StudentDocument from "@/lib/db/models/StudentDocument";
import AuditLog from "@/lib/db/models/AuditLog";
import { revalidatePath } from "next/cache";

export async function createDocumentRecord(data: {
    studentId: string;
    name: string;
    url: string;
    type?: string;
}) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    const doc = await StudentDocument.create({
        school: session.user.schoolId,
        student: data.studentId,
        name: data.name,
        url: data.url,
        type: data.type,
        uploadedBy: session.user.id,
    });

    await AuditLog.create({
        school: session.user.schoolId,
        actor: session.user.id,
        action: "UPLOAD_DOCUMENT",
        target: doc._id.toString(),
        details: { fileName: data.name, studentId: data.studentId },
    });

    revalidatePath(`/school/students/${data.studentId}`);
    return JSON.parse(JSON.stringify(doc));
}

export async function getStudentDocuments(studentId: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const docs = await StudentDocument.find({
        school: session.user.schoolId,
        student: studentId,
    }).sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(docs));
}

export async function deleteDocument(id: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const doc = await StudentDocument.findOneAndDelete({
        _id: id,
        school: session.user.schoolId,
    });

    if (!doc) throw new Error("Document not found");

    await AuditLog.create({
        school: session.user.schoolId,
        actor: session.user.id,
        action: "DELETE_DOCUMENT",
        target: id,
        details: { fileName: doc.name },
    });

    if (doc.student) {
        revalidatePath(`/school/students/${doc.student.toString()}`);
    }

    return { success: true };
}
