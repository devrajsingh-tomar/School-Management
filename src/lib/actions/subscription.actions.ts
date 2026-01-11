"use server";

import connectDB from "@/lib/db/connect";
import SubscriptionPlan from "@/lib/db/models/SubscriptionPlan";
import School from "@/lib/db/models/School";
import { checkSubscriptionStatus } from "@/lib/subscription.utils";

const DEFAULT_PLANS = [
    {
        name: "Starter",
        price: 0,
        currency: "INR",
        limits: { users: 50, storage: 1 },
        features: ["CORE", "ATTENDANCE", "FEES"],
        isActive: true
    },
    {
        name: "Growth",
        price: 2999,
        currency: "INR",
        limits: { users: 500, storage: 10 },
        features: ["CORE", "ATTENDANCE", "FEES", "LIBRARY", "TRANSPORT", "REPORTS"],
        isActive: true
    },
    {
        name: "Enterprise",
        price: 9999,
        currency: "INR",
        limits: { users: 10000, storage: 100 },
        features: ["CORE", "ATTENDANCE", "FEES", "LIBRARY", "TRANSPORT", "REPORTS", "HR", "INVENTORY", "API_ACCESS"],
        isActive: true
    }
];

export async function seedPlans() {
    try {
        await connectDB();

        for (const plan of DEFAULT_PLANS) {
            await SubscriptionPlan.findOneAndUpdate(
                { name: plan.name },
                plan,
                { upsert: true, new: true }
            );
        }

        return { success: true, message: "Plans seeded successfully" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function checkAndRotateStatus(schoolId: string) {
    try {
        await connectDB();
        const school = await School.findById(schoolId);
        if (!school) return { success: false, error: "School not found" };

        const status = checkSubscriptionStatus(school);
        const schoolStatus = status === "EXPIRED" ? "Suspended" : "Active";

        // Update DB status to reflect subscription state
        if (school.status !== schoolStatus) {
            school.status = schoolStatus;
            await school.save();
        }

        return { success: true, status };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
