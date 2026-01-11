"use server";

import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit.actions";
import { auth } from "@/auth";

export async function softDeleteUser(targetUserId: string) {
    const session = await auth();
    try {
        await connectDB();
        await User.findByIdAndUpdate(targetUserId, {
            isDeleted: true,
            deletedAt: new Date()
        });

        if (session?.user) {
            await logAction(session.user.id, "SOFT_DELETE", "User", { target: targetUserId }, session.user.schoolId);
        }

        revalidatePath("/school/hr"); // Revalidate all list paths ideally
        revalidatePath("/school/students");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function restoreUser(targetUserId: string) {
    const session = await auth();
    try {
        await connectDB();
        await User.findByIdAndUpdate(targetUserId, {
            isDeleted: false,
            $unset: { deletedAt: 1 }
        });

        if (session?.user) {
            await logAction(session.user.id, "RESTORE", "User", { target: targetUserId }, session.user.schoolId);
        }

        revalidatePath("/school/hr");
        revalidatePath("/school/students");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
