"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import StaffProfile from "@/lib/db/models/StaffProfile";
import { staffSchema, StaffFormData } from "@/lib/validators/staff";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/lib/types/actions";
import { logAction } from "./audit.actions";
import { sendCredentials } from "@/lib/services/credential-service";

export async function createStaffAccount(data: StaffFormData): Promise<ActionState<any>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, message: "Unauthorized", data: null };

    const validated = staffSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, message: "Validation failed", errors: validated.error.flatten().fieldErrors, data: null };
    }

    await connectDB();

    try {
        // 1. Create User
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await User.create({
            school: session.user.schoolId,
            name: data.name,
            email: data.email || undefined,
            phone: data.phone || undefined,
            passwordHash: hashedPassword,
            role: data.role,
            isActive: true
        });

        // 2. Create Staff Profile
        const profile = await StaffProfile.create({
            school: session.user.schoolId,
            user: user._id,
            designation: data.designation,
            department: data.department,
            joiningDate: data.joiningDate || new Date(),
            salaryStructure: {
                basic: data.basicSalary || 0,
                allowances: 0,
                deductions: 0
            }
        });

        await logAction(
            session.user.id,
            "CREATE_STAFF_ACCOUNT",
            "STAFF",
            { userId: user._id, role: data.role, name: data.name },
            session.user.schoolId
        );

        revalidatePath("/school/hr");

        // Send credentials via Email/SMS
        await sendCredentials({
            name: data.name,
            identifier: data.email || data.phone || data.name,
            password: data.password,
            role: data.role,
            email: data.email || undefined,
            phone: data.phone || undefined,
            channel: data.email ? "EMAIL" : "SMS"
        });

        return { success: true, message: "Staff account created successfully" };
    } catch (error: any) {
        if (error.code === 11000) {
            return { success: false, message: "Email or Phone already exists" };
        }
        return { success: false, message: error.message || "Something went wrong" };
    }
}

export async function getTeachers() {
    // This is defined in user.actions.ts but imported here
    const { getSchoolUsers } = require("./user.actions");
    return getSchoolUsers("TEACHER");
}
