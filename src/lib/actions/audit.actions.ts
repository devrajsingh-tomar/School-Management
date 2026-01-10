"use server";

import AuditLog, { IAuditLog } from "@/lib/db/models/AuditLog";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";

type AuditParams = {
    action: string;
    target?: string;
    details?: any;
    schoolId?: string; // override or if not in session (rare)
};

export async function logAudit(params: AuditParams) {
    try {
        const session = await auth();
        if (!session?.user) return; // Only log authenticated actions

        await connectDB();

        await AuditLog.create({
            school: params.schoolId || session.user.schoolId,
            actor: session.user.id,
            action: params.action,
            target: params.target,
            details: params.details,
            ipAddress: "0.0.0.0", // Can't easily get IP in server action without headers hack, leaving placeholder
        });
    } catch (error) {
        console.error("Audit Log Error:", error);
        // Don't throw, we don't want to break the main action if logging fails
    }
}

export async function getAuditLogs() {
    const session = await auth();
    if (!session) return [];

    await connectDB();

    // SuperAdmin can see all (or maybe filtered?)
    // SchoolAdmin sees only their school

    let query: any = {};
    if (session.user.role !== "SUPER_ADMIN" && session.user.schoolId) {
        query.school = session.user.schoolId;
    } else if (session.user.role === "SUPER_ADMIN") {
        // Super admin sees all, or maybe we want to filter by school if passed?
        // For now return all limits
    } else {
        return [];
    }

    const logs = await AuditLog.find(query)
        .populate("actor", "name email role")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    return JSON.parse(JSON.stringify(logs));
}
