"use server";

import connectDB from "@/lib/db/connect";
import School from "@/lib/db/models/School";
import SubscriptionPlan from "@/lib/db/models/SubscriptionPlan";
import User from "@/lib/db/models/User";
import { revalidatePath } from "next/cache";

// --- Metrics ---

export async function getSaaSMetrics() {
    try {
        await connectDB();
        const totalSchools = await School.countDocuments();
        const activeSchools = await School.countDocuments({ status: "Active" });
        const totalUsers = await User.countDocuments(); // All users across all schools

        // Mock revenue logic
        // In real app, sum up invoices or plan values
        const revenue = totalSchools * 1000; // Mock avg revenue

        return {
            success: true,
            data: {
                totalSchools,
                activeSchools,
                totalUsers,
                revenue
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- School Management ---

export async function getAllSchools() {
    try {
        await connectDB();
        // Fetch all schools with their counts
        // Need to aggregate user count per school for the table
        // This is expensive if we have 1000s of schools. Paging is needed.
        // For prototype, fetching all.

        const schools = await School.find({}).sort({ createdAt: -1 });

        // Enrich with user counts (mock or actual count query per school)
        const enriched = await Promise.all(schools.map(async (school) => {
            const userCount = await User.countDocuments({ school: school._id });
            return {
                ...school.toObject(),
                userCount
            };
        }));

        return { success: true, data: JSON.parse(JSON.stringify(enriched)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSchoolStatus(schoolId: string, status: "Active" | "Suspended") {
    try {
        await connectDB();
        await School.findByIdAndUpdate(schoolId, { status, isActive: status === "Active" });
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSchoolPlan(schoolId: string, planData: { planName: string, limits: any, features: string[] }) {
    try {
        await connectDB();
        await School.findByIdAndUpdate(schoolId, {
            plan: planData.planName,
            limits: planData.limits,
            features: planData.features
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Plan Management ---

export async function getPlans() {
    try {
        await connectDB();
        const plans = await SubscriptionPlan.find({ isActive: true });
        return { success: true, data: JSON.parse(JSON.stringify(plans)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createPlan(data: any) {
    try {
        await connectDB();
        await SubscriptionPlan.create(data);
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
