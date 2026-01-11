"use server";

import connectDB from "@/lib/db/connect";
import AuditLog from "@/lib/db/models/AuditLog";
import Attendance from "@/lib/db/models/Attendance";
import FeePayment from "@/lib/db/models/FeePayment";
import Result from "@/lib/db/models/Result";
import User from "@/lib/db/models/User";
import { revalidatePath } from "next/cache";

export async function logAction(
    userId: string,
    action: string,
    entity: string,
    details: any,
    schoolId?: string
) {
    try {
        // Fire and forget, or await if critical. Awaiting for safety.
        await connectDB();
        await AuditLog.create({
            user: userId,
            action,
            entity,
            details,
            school: schoolId
        });
    } catch (e) {
        console.error("Audit Log Error", e);
    }
}

export async function getAuditLogs(schoolId?: string) {
    try {
        await connectDB();
        const query = schoolId ? { school: schoolId } : {};
        const logs = await AuditLog.find(query)
            .populate("user", "name email role")
            .sort({ text: -1, timestamp: -1 })
            .limit(100);

        return { success: true, data: JSON.parse(JSON.stringify(logs)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentActivity(studentId: string) {
    try {
        await connectDB();

        // Parallel fetch for different activity sources
        const [attendance, fees, results] = await Promise.all([
            Attendance.find({ student: studentId }).sort({ date: -1 }).limit(5),
            FeePayment.find({ student: studentId }).sort({ paymentDate: -1 }).limit(5),
            Result.find({ student: studentId }).populate("exam").sort({ createdAt: -1 }).limit(5),
        ]);

        // Normalize into a single timeline stream
        const timeline = [
            ...attendance.map(a => ({
                id: a._id,
                type: "ATTENDANCE",
                title: `Marked ${a.status}`,
                date: a.date,
                details: `Status: ${a.status}`
            })),
            ...fees.map(f => ({
                id: f._id,
                type: "FEE",
                title: `Fee Payment`,
                date: f.paymentDate,
                details: `Paid ₹${f.amount}`
            })),
            ...results.map(r => ({
                id: r._id,
                type: "RESULT",
                title: `Exam Result: ${(r as any).exam?.name}`,
                date: (r as any).createdAt,
                details: `Percentage: ${r.percentage}%`
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { success: true, data: JSON.parse(JSON.stringify(timeline)) };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
