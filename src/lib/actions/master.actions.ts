"use server";

import { z } from "zod";
import House from "@/lib/db/models/House";
import StudentCategory from "@/lib/db/models/StudentCategory";
import AcademicSession from "@/lib/db/models/AcademicSession";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit.actions";

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
        await logAudit({ action: "CREATE_HOUSE", target: validated.data.name, details: validated.data });
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
        await logAudit({ action: "CREATE_CATEGORY", target: validated.data.name });
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
        await logAudit({ action: "CREATE_SESSION", target: validated.data.name });
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
