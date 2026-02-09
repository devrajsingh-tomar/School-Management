"use server";

import connectDB from "@/lib/db/connect";
import StaffProfile from "@/lib/db/models/StaffProfile";
import LeaveRequest from "@/lib/db/models/LeaveRequest";
import Payroll from "@/lib/db/models/Payroll";
import User from "@/lib/db/models/User";
import { revalidatePath } from "next/cache";
import { startOfMonth, endOfMonth } from "date-fns";

// --- Staff Profile Actions ---

export async function createOrUpdateStaffProfile(data: {
    schoolId: string;
    userId: string;
    designation: string;
    department: string;
    joiningDate: Date;
    salaryStructure: {
        basic: number;
        allowances: number;
        deductions: number;
    };
    bankDetails?: {
        accountNumber: string;
        bankName: string;
        ifsc: string;
    };
}) {
    try {
        await connectDB();

        const profile = await StaffProfile.findOneAndUpdate(
            { school: data.schoolId, user: data.userId },
            { ...data },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        revalidatePath("/school/hr");
        return { success: true, data: JSON.parse(JSON.stringify(profile)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStaffList(schoolId: string) {
    try {
        await connectDB();
        // Fetch all users who are staff (excluding SCHOOL_ADMIN)
        const staffUsers = await User.find({
            school: schoolId,
            role: { $in: ["TEACHER", "ACCOUNTANT", "LIBRARIAN", "TRANSPORT_MANAGER", "STAFF"] }
        }).select("name email role phone");

        // Fetch their profiles
        const profiles = await StaffProfile.find({ school: schoolId });

        // Merge data
        const merged = staffUsers.map(user => {
            const profile = profiles.find(p => p.user.toString() === user._id.toString());
            return {
                ...user.toObject(),
                profile: profile ? profile.toObject() : null
            };
        });

        return { success: true, data: JSON.parse(JSON.stringify(merged)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Leave Actions ---

export async function requestLeave(data: {
    schoolId: string;
    userId: string;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string;
}) {
    try {
        await connectDB();
        const leave = await LeaveRequest.create({
            school: data.schoolId,
            staff: data.userId,
            ...data
        });
        revalidatePath("/school/hr");
        return { success: true, data: JSON.parse(JSON.stringify(leave)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getLeaveRequests(schoolId: string) {
    try {
        await connectDB();
        const requests = await LeaveRequest.find({ school: schoolId })
            .populate("staff", "name role")
            .sort({ createdAt: -1 });
        return { success: true, data: JSON.parse(JSON.stringify(requests)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLeaveStatus(id: string, status: "Approved" | "Rejected", approvedBy: string) {
    try {
        await connectDB();
        await LeaveRequest.findByIdAndUpdate(id, { status, approvedBy });
        revalidatePath("/school/hr");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Payroll Actions ---

export async function generatePayroll(schoolId: string, month: Date) {
    try {
        await connectDB();

        // 1. Get all staff with profiles
        const profiles = await StaffProfile.find({ school: schoolId });

        const payrolls = [];

        for (const profile of profiles) {
            const basic = profile.salaryStructure?.basic || 0;
            const allowances = profile.salaryStructure?.allowances || 0;
            const deductions = profile.salaryStructure?.deductions || 0;
            const netSalary = basic + allowances - deductions;

            if (basic > 0) { // Only generate if salary structure exists
                // Upsert to avoid duplicates
                const p = await Payroll.findOneAndUpdate(
                    { school: schoolId, staff: profile.user, month: startOfMonth(month) },
                    {
                        basic,
                        allowances,
                        deductions,
                        netSalary,
                        status: "Draft"
                    },
                    { upsert: true, new: true }
                );
                payrolls.push(p);
            }
        }

        revalidatePath("/school/hr");
        return { success: true, count: payrolls.length };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPayrolls(schoolId: string, month?: Date) {
    try {
        await connectDB();
        const query: any = { school: schoolId };
        if (month) {
            query.month = {
                $gte: startOfMonth(month),
                $lte: endOfMonth(month)
            };
        }

        const payrolls = await Payroll.find(query)
            .populate("staff", "name role")
            .sort({ month: -1 });

        return { success: true, data: JSON.parse(JSON.stringify(payrolls)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markPayrollPaid(id: string) {
    try {
        await connectDB();
        await Payroll.findByIdAndUpdate(id, { status: "Paid", paymentDate: new Date() });
        revalidatePath("/school/hr");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
