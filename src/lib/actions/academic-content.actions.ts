"use server";

import { z } from "zod";
import Homework from "@/lib/db/models/Homework";
import Announcement from "@/lib/db/models/Announcement";
import LessonPlan from "@/lib/db/models/LessonPlan";
import Syllabus from "@/lib/db/models/Syllabus";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/lib/types/actions";

// --- HOMEWORK ---

export async function createHomework(formData: FormData): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const classId = formData.get("classId") as string;
    const subject = formData.get("subject") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const link = formData.get("link") as string;

    if (!title || !description || !classId || !subject || !dueDateStr) {
        return { success: false, data: null, message: "Missing required fields" };
    }

    const dueDate = new Date(dueDateStr);

    await connectDB();

    await Homework.create({
        school: session.user.schoolId,
        teacher: session.user.id,
        class: classId,
        subject,
        title,
        description,
        type: "Homework",
        dueDate,
        attachments: link ? [link] : []
    });

    revalidatePath("/school/academics/homework");
    return { success: true, data: null, message: "Homework Created!" };
}

export async function getHomework(classId?: string): Promise<any[]> {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const query: any = { school: session.user.schoolId };

    if (classId) {
        query.class = classId;
    }

    const homework = await Homework.find(query)
        .populate("class", "name")
        .populate("teacher", "name")
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(homework));
}

// --- ANNOUNCEMENTS ---

export async function createAnnouncement(formData: FormData): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const audience = formData.get("audience") as string;
    const targetClass = formData.get("targetClass") as string || undefined;

    if (!title || !content || !audience) {
        return { success: false, data: null, message: "Missing required fields" };
    }

    await connectDB();
    await Announcement.create({
        school: session.user.schoolId,
        author: session.user.id,
        title,
        content,
        audience,
        targetClass
    });

    revalidatePath("/school/academics/announcements");
    return { success: true, data: null, message: "Posted!" };
}

export async function getAnnouncements(): Promise<any[]> {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const announcements = await Announcement.find({ school: session.user.schoolId })
        .populate("author", "name")
        .populate("targetClass", "name")
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(announcements));
}

// --- LESSON PLANS ---

export async function createLessonPlan(formData: FormData): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    const classId = formData.get("classId") as string;
    const subject = formData.get("subject") as string;
    const topic = formData.get("topic") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const resources = formData.get("resources") as string;

    if (!classId || !subject || !topic || !startDateStr || !endDateStr) {
        return { success: false, data: null, message: "Missing required fields" };
    }

    await connectDB();
    await LessonPlan.create({
        school: session.user.schoolId,
        teacher: session.user.id,
        class: classId,
        subject,
        topic,
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
        status: "Planned",
        resources
    });

    revalidatePath("/school/academics/planning");
    return { success: true, data: null, message: "Plan Saved" };
}

export async function getLessonPlans(): Promise<any[]> {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const plans = await LessonPlan.find({
        school: session.user.schoolId,
    })
        .populate("class", "name")
        .sort({ startDate: 1 })
        .lean();

    return JSON.parse(JSON.stringify(plans));
}

export async function deleteLessonPlan(id: string): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    await connectDB();
    await LessonPlan.findByIdAndDelete(id);

    revalidatePath("/school/academics/planning");
    return { success: true, data: null, message: "Plan Deleted" };
}

// --- SYLLABUS ---

export async function getSyllabus(classId: string, subject: string): Promise<ActionState<any | null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    await connectDB();
    const syllabus = await Syllabus.findOne({
        school: session.user.schoolId,
        class: classId,
        subject: subject
    }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(syllabus)) };
}

export async function createSyllabus(classId: string, subject: string, topics: any[]): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    await connectDB();
    await Syllabus.create({
        school: session.user.schoolId,
        class: classId,
        subject,
        topics
    });

    revalidatePath("/school/academics/planning");
    return { success: true, data: null, message: "Syllabus Initialized" };
}

export async function updateSyllabusTopicStatus(syllabusId: string, topicId: string, status: "Pending" | "Completed"): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    await connectDB();
    const completedAt = status === "Completed" ? new Date() : undefined;

    await Syllabus.updateOne(
        { _id: syllabusId, "topics._id": topicId },
        {
            $set: {
                "topics.$.status": status,
                "topics.$.completedAt": completedAt
            }
        }
    );

    revalidatePath("/school/academics/planning");
    return { success: true, data: null, message: "Progress Updated" };
}
