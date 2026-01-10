"use server";

import { z } from "zod";
import Homework from "@/lib/db/models/Homework";
import Announcement from "@/lib/db/models/Announcement";
import LessonPlan from "@/lib/db/models/LessonPlan";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- HOMEWORK ---

export async function createHomework(formData: FormData) {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const classId = formData.get("classId") as string;
    const subject = formData.get("subject") as string;
    const dueDate = new Date(formData.get("dueDate") as string);
    const link = formData.get("link") as string; // Single link for now

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
    return { message: "Homework Created!" };
}

export async function getHomework(classId?: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const query: any = { school: session.user.schoolId };

    if (classId) {
        query.class = classId;
    } else if (session.user.role === "STUDENT") {
        // Auto-filter for student's class if not provided
        // Need to fetch student profile to know class. 
        // For now, let's rely on the caller passing classId or if undefined show all (Admin view)
    }

    const homework = await Homework.find(query)
        .populate("class", "name")
        .populate("teacher", "name")
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(homework));
}

// --- ANNOUNCEMENTS ---

export async function createAnnouncement(formData: FormData) {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    await connectDB();
    await Announcement.create({
        school: session.user.schoolId,
        author: session.user.id,
        title: formData.get("title"),
        content: formData.get("content"),
        audience: formData.get("audience"),
        targetClass: formData.get("targetClass") || undefined
    });

    revalidatePath("/school/academics/announcements");
    return { message: "Posted!" };
}

export async function getAnnouncements() {
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

export async function createLessonPlan(formData: FormData) {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    await connectDB();
    await LessonPlan.create({
        school: session.user.schoolId,
        teacher: session.user.id,
        class: formData.get("classId"),
        subject: formData.get("subject"),
        topic: formData.get("topic"),
        startDate: new Date(formData.get("startDate") as string),
        endDate: new Date(formData.get("endDate") as string),
        status: "Planned",
        resources: formData.get("resources")
    });

    revalidatePath("/school/academics/planning");
    return { message: "Plan Saved" };
}

export async function getLessonPlans() {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const plans = await LessonPlan.find({
        school: session.user.schoolId,
        // teacher: session.user.id // Optionally filter by teacher if not Admin
    })
        .populate("class", "name")
        .sort({ startDate: 1 })
        .lean();

    return JSON.parse(JSON.stringify(plans));
}
