"use server";

import { z } from "zod";
import User, { IUser } from "@/lib/db/models/User";
import connectDB from "@/lib/db/connect";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit.actions";

const createUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["TEACHER", "STUDENT", "STAFF", "ACCOUNTANT", "PARENT"]),
    classId: z.optional(z.string()),
    sectionId: z.optional(z.string()),
});

export type CreateUserState = {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
};

export async function createUser(prevState: CreateUserState, formData: FormData): Promise<CreateUserState> {
    const session = await auth();
    if (!session || !session.user.schoolId) {
        return { message: "Unauthorized: No School Context" };
    }

    const validatedFields = createUserSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
        classId: formData.get("classId"),
        sectionId: formData.get("sectionId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create User.",
        };
    }

    const { name, email, password, role, classId, sectionId } = validatedFields.data;

    await connectDB();

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return {
            // In a multi-tenant system, user emails might need to be globally unique if they login at one portal.
            // If they login at subdomain, it could be scoped, but we are using shared login for now.
            message: "Email already exists in the system.",
        };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            role,
            school: session.user.schoolId, // Strict Tenant Isolation
            isActive: true,
            class: classId || undefined,
            section: sectionId || undefined,
        });

        await logAudit({
            action: "CREATE_USER",
            target: email,
            details: { role, schoolId: session.user.schoolId }
        });

    } catch (error) {
        console.error("Create User Error:", error);
        return {
            message: "Database Error: Failed to create user.",
        };
    }

    revalidatePath("/school/users");
    return {
        message: "User created successfully!",
    };
}

export async function getSchoolUsers(role?: string, sectionId?: string) {
    const session = await auth();
    if (!session || !session.user.schoolId) {
        return [];
    }

    await connectDB();

    const query: any = { school: session.user.schoolId };
    if (role) {
        query.role = role;
    }
    if (sectionId) {
        query.section = sectionId;
    }

    // Exclude SUPER_ADMIN from these lists just in case
    const users = await User.find(query).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(users));
}
