"use server";

import { auth, signOut } from "@/auth";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import bcrypt from "bcryptjs";
import { ActionState } from "@/lib/types/actions";

export async function changePassword(data: any): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user) return { success: false, data: null, message: "Unauthorized" };

    const { currentPassword, newPassword } = data;

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) return { success: false, data: null, message: "User not found" };

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash || "");
    if (!isValid) return { success: false, data: null, message: "Incorrect current password" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    return { success: true, data: null, message: "Password updated successfully" };
}

export async function logout() {
    await signOut({ redirectTo: "/login" });
}
