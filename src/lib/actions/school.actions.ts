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

    revalidatePath("/superadmin/schools");
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

/**
 * Update school website URL
 * Only SCHOOL_ADMIN can update their own school's website URL
 */
export async function updateSchoolWebsite(websiteUrl: string) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // Only SCHOOL_ADMIN can update website URL
    if (session.user.role !== "SCHOOL_ADMIN") {
        throw new Error("Only School Admins can update the website URL");
    }

    if (!session.user.schoolId) {
        throw new Error("School not found");
    }

    // Validate URL format if provided
    if (websiteUrl && websiteUrl.trim()) {
        try {
            const url = new URL(websiteUrl);
            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error("Invalid URL protocol");
            }
        } catch (error) {
            throw new Error("Invalid URL format. Please enter a valid URL (e.g., https://yourschool.com)");
        }
    }

    await connectDB();

    try {
        await School.findByIdAndUpdate(
            session.user.schoolId,
            { websiteUrl: websiteUrl.trim() || null },
            { new: true }
        );

        await logAction(
            session.user.id,
            "UPDATE_SCHOOL_WEBSITE",
            "SCHOOL",
            { websiteUrl },
            session.user.schoolId
        );

        revalidatePath("/school/settings");

        return { success: true, message: "Website URL updated successfully" };
    } catch (error) {
        console.error("Update Error:", error);
        throw new Error("Failed to update website URL");
    }
}

/**
 * Get school website URL
 * Returns the website URL for the current user's school
 */
export async function getSchoolWebsiteUrl() {
    const session = await auth();

    if (!session?.user?.schoolId) {
        return null;
    }

    await connectDB();

    try {
        const school = await School.findById(session.user.schoolId).select('websiteUrl').lean();
        return school?.websiteUrl || null;
    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}

/**
 * Get school details for settings page
 */
export async function getSchoolDetails() {
    const session = await auth();

    if (!session?.user?.schoolId) {
        throw new Error("School not found");
    }

    await connectDB();

    try {
        const school = await School.findById(session.user.schoolId)
            .select('name contactEmail websiteUrl settings subscriptionPlan')
            .lean();

        return JSON.parse(JSON.stringify(school));
    } catch (error) {
        console.error("Fetch Error:", error);
        throw new Error("Failed to fetch school details");
    }
}

/**
 * Update school theme color
 * Only SCHOOL_ADMIN can update their own school's theme color
 */
export async function updateSchoolThemeColor(themeColor: string) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // Only SCHOOL_ADMIN can update theme color
    if (session.user.role !== "SCHOOL_ADMIN") {
        throw new Error("Only School Admins can update the theme color");
    }

    if (!session.user.schoolId) {
        throw new Error("School not found");
    }

    // Validate hex color format
    if (themeColor && !/^#[0-9A-F]{6}$/i.test(themeColor)) {
        throw new Error("Invalid color format. Please use hex format (e.g., #4F46E5)");
    }

    await connectDB();

    try {
        await School.findByIdAndUpdate(
            session.user.schoolId,
            { "settings.themeColor": themeColor },
            { new: true }
        );

        await logAction(
            session.user.id,
            "UPDATE_SCHOOL_THEME",
            "SCHOOL",
            { themeColor },
            session.user.schoolId
        );

        revalidatePath("/school/settings");

        return { success: true, message: "Theme color updated successfully" };
    } catch (error) {
        console.error("Update Error:", error);
        throw new Error("Failed to update theme color");
    }
}
