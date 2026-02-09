"use server";

import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import School from "@/lib/db/models/School";
import Attendance from "@/lib/db/models/Attendance";
import RolePermission from "@/lib/db/models/RolePermission";
import { revalidatePath } from "next/cache";

export async function backupData(schoolId: string) {
    try {
        await connectDB();

        // Fetch core collections for this school
        // For prototype, we dump Users and Attendance
        const users = await User.find({ school: schoolId }).lean();
        const attendance = await Attendance.find({ school: schoolId }).lean();

        const backup = {
            metadata: {
                schoolId,
                timestamp: new Date().toISOString(),
                version: "1.0"
            },
            data: {
                users,
                attendance,
            }
        };

        return { success: true, data: JSON.stringify(backup) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePermissions(role: string, permissions: string[], schoolId?: string) {
    try {
        await connectDB();

        await RolePermission.findOneAndUpdate(
            { role, school: schoolId || null }, // Match specific school or system wide if null
            { permissions },
            { upsert: true, new: true }
        );

        revalidatePath("/superadmin/settings");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
