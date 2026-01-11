"use server";

import { z } from "zod";
import Attendance from "@/lib/db/models/Attendance";
import Leave from "@/lib/db/models/Leave";
import Student from "@/lib/db/models/Student";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// --- ATTENDANCE ACTIONS ---

export async function markClassAttendance(data: {
    classId: string;
    date: Date;
    records: { studentId: string; status: string }[];
}) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();
    const dateOnly = new Date(data.date);
    dateOnly.setHours(0, 0, 0, 0);

    const operations = data.records.map(r => ({
        updateOne: {
            filter: {
                school: new mongoose.Types.ObjectId(session.user.schoolId),
                date: dateOnly,
                student: new mongoose.Types.ObjectId(r.studentId)
            },
            update: {
                $set: {
                    userType: "Student" as const,
                    class: new mongoose.Types.ObjectId(data.classId),
                    status: r.status as "Present" | "Absent" | "Late" | "Half-Day" | "Holiday",
                    markedBy: new mongoose.Types.ObjectId(session.user.id)
                }
            },
            upsert: true
        }
    }));

    await Attendance.bulkWrite(operations);
    revalidatePath("/school/attendance");
    return { success: true };
}

export async function getAttendanceByDate(classId: string, dateStr: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return {};

    await connectDB();
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
        school: session.user.schoolId,
        class: classId,
        date: date,
        userType: "Student"
    }).lean();

    // Map to simple key-value for easy frontend consumption: { studentId: status }
    const statusMap: Record<string, string> = {};
    records.forEach((r: any) => {
        statusMap[r.student.toString()] = r.status;
    });

    return statusMap;
}

export async function getDailyAttendanceStats(dateStr: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return null;

    await connectDB();
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const stats = await Attendance.aggregate([
        { $match: { school: new mongoose.Types.ObjectId(session.user.schoolId), date: date } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    return stats;
}

// --- LEAVE ACTIONS ---

export async function applyForLeave(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const reason = formData.get("reason") as string;

    // Determine applicant (Self)
    // If Student acts, use their context (future)
    // If Staff acts:
    const applicantType = session.user.role === "STUDENT" ? "Student" : "Staff";

    await connectDB();

    await Leave.create({
        school: session.user.schoolId,
        applicantType,
        staff: applicantType === "Staff" ? session.user.id : undefined,
        // student: ... if student portal
        startDate,
        endDate,
        reason
    });

    revalidatePath("/school/attendance/leaves");
    return { message: "Leave Applied!" };
}

export async function getLeaves() {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    // Fetch relevant leaves. Admin sees all, Teacher sees pending?, User sees own.
    // For MVP: Admin sees all.

    const leaves = await Leave.find({ school: session.user.schoolId })
        .populate("staff", "name")
        .populate("student", "firstName lastName")
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(leaves));
}

export async function updateLeaveStatus(id: string, status: string) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    // Check perm
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SCHOOL_ADMIN" && session.user.role !== "PRINCIPAL") {
        throw new Error("Permission Denied");
    }

    await connectDB();
    await Leave.findByIdAndUpdate(id, {
        status,
        approvedBy: session.user.id,
        approvalDate: new Date()
    });

    revalidatePath("/school/attendance/leaves");
}

// --- STAFF ATTENDANCE ---

export async function markStaffAttendance(data: {
    date: Date;
    records: { staffId: string; status: string }[];
}) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();
    const dateOnly = new Date(data.date);
    dateOnly.setHours(0, 0, 0, 0);

    const operations = data.records.map(r => ({
        updateOne: {
            filter: {
                school: new mongoose.Types.ObjectId(session.user.schoolId),
                date: dateOnly,
                staff: new mongoose.Types.ObjectId(r.staffId)
            },
            update: {
                $set: {
                    userType: "Staff" as const,
                    status: r.status as "Present" | "Absent" | "Late" | "Half-Day" | "Holiday",
                    markedBy: new mongoose.Types.ObjectId(session.user.id)
                }
            },
            upsert: true
        }
    }));

    await Attendance.bulkWrite(operations);
    revalidatePath("/school/attendance/staff");
    return { success: true };
}

export async function getStaffAttendanceByDate(dateStr: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return {};

    await connectDB();
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
        school: session.user.schoolId,
        date: date,
        userType: "Staff"
    }).lean();

    const statusMap: Record<string, string> = {};
    records.forEach((r: any) => {
        statusMap[r.staff.toString()] = r.status;
    });

    return statusMap;
}

