"use server";

import connectDB from "@/lib/db/connect";
import FeatureFlag from "@/lib/db/models/FeatureFlag";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getFeatureFlags() {
    try {
        await connectDB();
        const flags = await FeatureFlag.find({}).sort({ name: 1 }).lean();
        return JSON.parse(JSON.stringify(flags));
    } catch (error) {
        console.error("Error fetching feature flags:", error);
        return [];
    }
}

export async function toggleFeatureFlag(id: string, isEnabled: boolean) {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" };
    }

    try {
        await connectDB();
        await FeatureFlag.findByIdAndUpdate(id, { isEnabled });
        revalidatePath("/superadmin/features");
        revalidatePath("/school"); // Revalidate school dashboard to reflect changes
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function initializeFeatureFlags() {
    // Seed default flags if they don't exist
    await connectDB();
    const defaults = [
        { key: "hr_payroll", name: "HR & Payroll", description: "Enable human resource management for all schools.", isEnabled: true },
        { key: "transport", name: "Transport Management", description: "Enable vehicle and route tracking.", isEnabled: true },
        { key: "library", name: "Library Management", description: "Enable library book tracking.", isEnabled: true },
        { key: "inventory", name: "Inventory", description: "Enable inventory management.", isEnabled: true },
        { key: "ai_planner", name: "AI Lesson Planner", description: "Experimental AI assistant for teachers.", isEnabled: false },
    ];

    for (const flag of defaults) {
        await FeatureFlag.updateOne(
            { key: flag.key },
            { $setOnInsert: flag },
            { upsert: true }
        );
    }
}
