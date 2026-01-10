"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import Student from "@/lib/db/models/Student";
import { revalidatePath } from "next/cache";

export async function getParentChildren() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const user = await User.findById(session.user.id)
        .populate({
            path: "children",
            populate: [
                { path: "class", select: "name" },
                { path: "section", select: "name" },
            ],
        })
        .lean();

    if (!user) return [];

    return JSON.parse(JSON.stringify(user.children || []));
}

export async function linkChildToParent(admissionNumber: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    // Basic role check - only parents should do this self-service
    // or admins can do it via user management (which is separate)
    // For now, let's assume this is a parent action.

    await connectDB();

    // Find student
    const student = await Student.findOne({
        admissionNumber,
        school: session.user.schoolId // Ensure student belongs to same school tenant
    });

    if (!student) {
        throw new Error("Student not found with this admission number.");
    }

    // Update Parent User
    await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { children: student._id }
    });

    revalidatePath("/parent");
    return { success: true, studentName: student.firstName };
}
