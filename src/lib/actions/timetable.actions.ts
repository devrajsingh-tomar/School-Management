"use server";

import { z } from "zod";
import TimetableSlot from "@/lib/db/models/TimetableSlot";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveTimetableSlot(data: {
    classId: string;
    day: string;
    periodIndex: number;
    subject: string;
    teacherId: string;
    startTime?: string;
    endTime?: string;
}) {
    const session = await auth();
    if (!session?.user?.schoolId) return { error: "Unauthorized" };

    await connectDB();

    // 1. Clash Detection
    // Check if Teacher is busy in another class at the same slot
    const clash = await TimetableSlot.findOne({
        school: session.user.schoolId,
        teacher: data.teacherId,
        day: data.day,
        periodIndex: data.periodIndex,
        class: { $ne: data.classId } // Busy in *another* class
    }).populate("class", "name");

    if (clash) {
        return { error: `Clash! Teacher is in Class ${clash.class.name} at this time.` };
    }

    // 2. Upsert Slot
    await TimetableSlot.findOneAndUpdate(
        {
            school: session.user.schoolId,
            class: data.classId,
            day: data.day,
            periodIndex: data.periodIndex
        },
        {
            school: session.user.schoolId,
            class: data.classId,
            day: data.day,
            periodIndex: data.periodIndex,
            subject: data.subject,
            teacher: data.teacherId,
            startTime: data.startTime || "",
            endTime: data.endTime || ""
        },
        { upsert: true, new: true }
    );

    revalidatePath("/school/timetable/manage");
    return { success: true };
}

export async function getTimetableForClass(classId: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const slots = await TimetableSlot.find({
        school: session.user.schoolId,
        class: classId
    })
        .populate("teacher", "name")
        .sort({ day: 1, periodIndex: 1 })
        .lean();

    return JSON.parse(JSON.stringify(slots));
}

export async function deleteTimetableSlot(slotId: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return;

    await connectDB();
    await TimetableSlot.findByIdAndDelete(slotId);
    revalidatePath("/school/timetable/manage");
}
