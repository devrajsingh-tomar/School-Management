"use server";

import { z } from "zod";
import House from "@/lib/db/models/House";
import StudentCategory from "@/lib/db/models/StudentCategory";
import AcademicSession from "@/lib/db/models/AcademicSession";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit.actions";
import Class from "@/lib/db/models/Class";
import Section from "@/lib/db/models/Section";

export type FormState = {
    message?: string;
    errors?: { [key: string]: string[] };
};

// --- HOUSE ACTIONS ---
const createHouseSchema = z.object({
    name: z.string().min(1),
    color: z.string().optional(),
});

export async function createHouse(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const validated = createHouseSchema.safeParse({
        name: formData.get("name"),
        color: formData.get("color"),
    });

    if (!validated.success) return { message: "Validation Failed" };

    await connectDB();
    try {
        await House.create({
            school: session.user.schoolId,
            name: validated.data.name,
            color: validated.data.color
        });
        await logAction(session.user.id, "CREATE_HOUSE", "HOUSE", validated.data, session.user.schoolId);
    } catch { return { message: "Error or Duplicate House" }; }

    revalidatePath("/school/setup");
    return { message: "House Created" };
}

export async function getHouses() {
    const session = await auth();
    if (!session?.user?.schoolId) return [];
    await connectDB();
    return JSON.parse(JSON.stringify(await House.find({ school: session.user.schoolId }).lean()));
}

// --- CATEGORY ACTIONS ---
const createCategorySchema = z.object({ name: z.string().min(1) });

export async function createCategory(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const validated = createCategorySchema.safeParse({ name: formData.get("name") });
    if (!validated.success) return { message: "Validation Failed" };

    await connectDB();
    try {
        await StudentCategory.create({
            school: session.user.schoolId,
            name: validated.data.name
        });
        await logAction(session.user.id, "CREATE_CATEGORY", "CATEGORY", { name: validated.data.name }, session.user.schoolId);
    } catch { return { message: "Error or Duplicate Category" }; }

    revalidatePath("/school/setup");
    return { message: "Category Created" };
}

export async function getCategories() {
    const session = await auth();
    if (!session?.user?.schoolId) return [];
    await connectDB();
    return JSON.parse(JSON.stringify(await StudentCategory.find({ school: session.user.schoolId }).lean()));
}

// --- SESSION ACTIONS ---
const createSessionSchema = z.object({
    name: z.string().min(1),
    startDate: z.string(),
    endDate: z.string(),
    isCurrent: z.coerce.boolean(),
});

export async function createSession(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const validated = createSessionSchema.safeParse({
        name: formData.get("name"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        isCurrent: formData.get("isCurrent"),
    });

    if (!validated.success) return { message: "Validation Failed" };

    await connectDB();

    // If setting as current, unset others
    if (validated.data.isCurrent) {
        await AcademicSession.updateMany(
            { school: session.user.schoolId },
            { $set: { isCurrent: false } }
        );
    }

    try {
        await AcademicSession.create({
            school: session.user.schoolId,
            name: validated.data.name,
            startDate: new Date(validated.data.startDate),
            endDate: new Date(validated.data.endDate),
            isCurrent: validated.data.isCurrent
        });
        await logAction(session.user.id, "CREATE_SESSION", "SESSION", { name: validated.data.name }, session.user.schoolId);
    } catch { return { message: "Database Error" }; }

    revalidatePath("/school/setup");
    return { message: "Academic Session Created" };
}

export async function getSessions() {
    const session = await auth();
    if (!session?.user?.schoolId) return [];
    await connectDB();
    return JSON.parse(JSON.stringify(await AcademicSession.find({ school: session.user.schoolId }).sort({ startDate: -1 }).lean()));
}

export async function seedMasterData() {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, message: "Unauthorized" };

    await connectDB();
    const schoolId = session.user.schoolId;

    // 1. Categories
    const categoriesCount = await StudentCategory.countDocuments({ school: schoolId });
    if (categoriesCount === 0) {
        const categories = ["General", "OBC", "SC", "ST"];
        await StudentCategory.insertMany(categories.map(name => ({ school: schoolId, name })));
    }

    // 2. Classes & Sections
    const classesCount = await Class.countDocuments({ school: schoolId });
    if (classesCount === 0) {
        const classNames = ["1st", "2nd", "3rd", "4th", "5th"];
        for (const name of classNames) {
            const newClass = await Class.create({ school: schoolId, name });

            // Create Sections A and B for each class
            const sections = ["A", "B"];
            for (const sectionName of sections) {
                const newSection = await Section.create({
                    school: schoolId,
                    class: newClass._id,
                    name: sectionName
                });

                await Class.findByIdAndUpdate(newClass._id, {
                    $push: { sections: newSection._id }
                });
            }
        }
    }

    // 3. Houses (Optional but good to have)
    const housesCount = await House.countDocuments({ school: schoolId });
    if (housesCount === 0) {
        const houses = [
            { name: "Red", color: "#EF4444" },
            { name: "Blue", color: "#3B82F6" },
            { name: "Green", color: "#10B981" },
            { name: "Yellow", color: "#F59E0B" }
        ];
        await House.insertMany(houses.map(h => ({ ...h, school: schoolId })));
    }

    revalidatePath("/school/students/new");
    return { success: true, message: "Master data seeded successfully" };
}
