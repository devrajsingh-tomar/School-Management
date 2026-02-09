"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import StudentDocument from "@/lib/db/models/StudentDocument";
import { logAction } from "@/lib/actions/audit.actions";
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

    await logAction(
        session.user.id,
        "UPLOAD_DOCUMENT",
        "DOCUMENT",
        { fileName: data.name, studentId: data.studentId, docId: doc._id },
        session.user.schoolId
    );

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

    await logAction(
        session.user.id,
        "DELETE_DOCUMENT",
        "DOCUMENT",
        { id, fileName: doc.name },
        session.user.schoolId
    );

    if (doc.student) {
        revalidatePath(`/school/students/${doc.student.toString()}`);
    }

    return { success: true };
}
