"use server";

import TimetableSlot from "@/lib/db/models/TimetableSlot";
import Substitution from "@/lib/db/models/Substitution";
import User from "@/lib/db/models/User";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ActionState } from "@/lib/types/actions";

// --- TIMETABLE MANAGEMENT ---

interface PopulatedClass {
    name: string;
}

interface PopulatedSlot {
    class: PopulatedClass;
}

export async function saveTimetableSlot(data: {
    classId: string;
    day: string;
    periodIndex: number;
    subject: string;
    teacherId: string;
    startTime?: string;
    endTime?: string;
}): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    await connectDB();

    const clash = await TimetableSlot.findOne({
        school: session.user.schoolId,
        teacher: data.teacherId,
        day: data.day,
        periodIndex: data.periodIndex,
        class: { $ne: data.classId }
    }).populate("class", "name");

    if (clash) {
        const clashWithClass = clash as unknown as PopulatedSlot;
        return {
            success: false,
            data: null,
            message: `Clash! Teacher is in Class ${clashWithClass.class.name} at this time.`
        };
    }

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
    return { success: true, data: null, message: "Slot Saved" };
}

export async function getTimetableForClass(classId: string): Promise<any[]> {
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

export async function deleteTimetableSlot(slotId: string): Promise<void> {
    const session = await auth();
    if (!session?.user?.schoolId) return;

    await connectDB();
    await TimetableSlot.findByIdAndDelete(slotId);
    revalidatePath("/school/timetable/manage");
}

// --- SUBSTITUTION MANAGEMENT ---

export async function getSubstitutions(date: string): Promise<any[]> {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const subs = await Substitution.find({
        school: session.user.schoolId,
        date: new Date(date)
    })
        .populate({
            path: "originalSlot",
            populate: { path: "class", select: "name" }
        })
        .populate("originalTeacher", "name")
        .populate("substituteTeacher", "name")
        .lean();

    return JSON.parse(JSON.stringify(subs));
}

export async function getAvailableTeachers(date: string, periodIndex: number): Promise<any[]> {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    const dateObj = new Date(date);
    const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dateObj.getDay()];

    await connectDB();

    const allTeachers = await User.find({
        school: session.user.schoolId,
        role: "TEACHER",
        isActive: true
    }).select("name").lean();

    const busySlotTeachers = await TimetableSlot.find({
        school: session.user.schoolId,
        day,
        periodIndex
    }).select("teacher").lean();

    const substitutingTeachers = await Substitution.find({
        school: session.user.schoolId,
        date: dateObj
    }).populate("originalSlot").lean();

    const busyInSubs = substitutingTeachers
        .filter((s: any) => s.originalSlot && (s.originalSlot as any).periodIndex === periodIndex)
        .map((s: any) => s.substituteTeacher.toString());

    const busyTeacherIds = new Set([
        ...busySlotTeachers.map(s => s.teacher.toString()),
        ...busyInSubs
    ]);

    const available = allTeachers.filter(t => !busyTeacherIds.has(t._id.toString()));

    return JSON.parse(JSON.stringify(available));
}

export async function createSubstitution(data: {
    slotId: string;
    date: string;
    substituteTeacherId: string;
    remarks?: string;
}): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    await connectDB();
    const slot = await TimetableSlot.findById(data.slotId);
    if (!slot) return { success: false, data: null, message: "Slot not found" };

    await Substitution.findOneAndUpdate(
        { originalSlot: data.slotId, date: new Date(data.date) },
        {
            school: session.user.schoolId,
            originalSlot: data.slotId,
            date: new Date(data.date),
            originalTeacher: slot.teacher,
            substituteTeacher: data.substituteTeacherId,
            status: "Confirmed",
            remarks: data.remarks
        },
        { upsert: true }
    );

    revalidatePath("/school/timetable/substitution");
    return { success: true, data: null, message: "Substitution assigned" };
}
