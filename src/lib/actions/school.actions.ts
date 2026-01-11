"use server";

import { z } from "zod";
import School, { ISchool } from "@/lib/db/models/School";
import User, { IUser } from "@/lib/db/models/User";
import connectDB from "@/lib/db/connect";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/actions/audit.actions";

// Input validation schemas
const createSchoolSchema = z.object({
    name: z.string().min(3),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    contactEmail: z.string().email(),
    adminName: z.string().min(2),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(6),
    subscriptionPlan: z.enum(["FREE", "BASIC", "PREMIUM"]),
});

export type CreateSchoolState = {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
};

export async function createSchool(prevState: CreateSchoolState, formData: FormData): Promise<CreateSchoolState> {
    await connectDB();

    const validatedFields = createSchoolSchema.safeParse({
        name: formData.get("name"),
        slug: formData.get("slug"),
        contactEmail: formData.get("contactEmail"),
        adminName: formData.get("adminName"),
        adminEmail: formData.get("adminEmail"),
        adminPassword: formData.get("adminPassword"),
        subscriptionPlan: formData.get("subscriptionPlan"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create School.",
        };
    }

    const { name, slug, contactEmail, adminName, adminEmail, adminPassword, subscriptionPlan } = validatedFields.data;

    // 1. Check uniqueness
    const existingSchool = await School.findOne({ slug });
    if (existingSchool) {
        return {
            message: "School URL (slug) already exists.",
        };
    }

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
        return {
            message: "Admin email already exists.",
        };
    }

    try {
        // 2. Create School
        const newSchool = await School.create({
            name,
            slug,
            contactEmail,
            subscriptionPlan,
            settings: {
                themeColor: "#4F46E5" // Default
            }
        });

        // 3. Create School Admin
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await User.create({
            name: adminName,
            email: adminEmail,
            passwordHash: hashedPassword,
            role: "SCHOOL_ADMIN",
            school: newSchool._id,
            isActive: true
        });

        const session = await auth();
        await logAction(
            session?.user?.id || "SYSTEM",
            "CREATE_SCHOOL",
            "SCHOOL",
            { name, slug, schoolId: newSchool._id.toString() },
            newSchool._id.toString()
        );

    } catch (error) {
        console.error("Creation Error:", error);
        return {
            message: "Database Error: Failed to create school.",
        };
    }

    revalidatePath("/admin/schools");
    return {
        message: "School created successfully!",
    };
}

export async function getSchools() {
    await connectDB();
    // Plain object for client components
    const schools = await School.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(schools));
}
