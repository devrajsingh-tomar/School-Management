"use server";

import { z } from "zod";
import Class, { IClass } from "@/lib/db/models/Class";
import Section, { ISection } from "@/lib/db/models/Section";
import Subject, { ISubject } from "@/lib/db/models/Subject";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- Types & Schemas ---

const createClassSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

const createSectionSchema = z.object({
    classId: z.string().min(1),
    name: z.string().min(1, "Section Name is required"),
});

const createSubjectSchema = z.object({
    name: z.string().min(1),
    code: z.string().optional(),
});

export type FormState = {
    errors?: { [key: string]: string[] };
    message?: string;
};

// --- Actions ---

export async function createClass(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const validated = createClassSchema.safeParse({
        name: formData.get("name"),
    });

    if (!validated.success) {
        return {
            errors: validated.error.flatten().fieldErrors,
            message: "Validation Error",
        };
    }

    await connectDB();
    const { name } = validated.data;

    try {
        await Class.create({
            school: session.user.schoolId,
            name,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return { message: "Class with this name already exists." };
        }
        return { message: "Database Error" };
    }

    revalidatePath("/school/classes");
    return { message: "Class created successfully!" };
}

export async function createSection(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const validated = createSectionSchema.safeParse({
        classId: formData.get("classId"),
        name: formData.get("name"),
    });

    if (!validated.success) {
        return { message: "Validation Error" };
    }

    await connectDB();
    const { classId, name } = validated.data;

    try {
        const newSection = await Section.create({
            school: session.user.schoolId,
            class: classId,
            name,
        });

        // Add to Class array
        await Class.findByIdAndUpdate(classId, {
            $push: { sections: newSection._id }
        });

    } catch (error: any) {
        if (error.code === 11000) {
            return { message: "Section exists in this class." };
        }
        return { message: "Database Error" };
    }

    revalidatePath("/school/classes");
    return { message: "Section created successfully!" };
}

export async function createSubject(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const validated = createSubjectSchema.safeParse({
        name: formData.get("name"),
        code: formData.get("code"),
    });

    if (!validated.success) return { message: "Validation Failed" };

    await connectDB();

    try {
        await Subject.create({
            school: session.user.schoolId,
            name: validated.data.name,
            code: validated.data.code
        });
    } catch (error: any) {
        return { message: "Subject create failed (Duplicate code?)" };
    }

    revalidatePath("/school/exams");
    return { message: "Subject created!" };
}

export async function getSubjects() {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const subjects = await Subject.find({ school: session.user.schoolId }).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(subjects));
}


export async function getClasses() {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const classes = await Class.find({ school: session.user.schoolId })
        .populate("sections")
        .sort({ name: 1 })
        .lean();

    return JSON.parse(JSON.stringify(classes));
}
