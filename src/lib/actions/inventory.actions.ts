"use server";

import connectDB from "@/lib/db/connect";
import InventoryItem from "@/lib/db/models/InventoryItem";
import InventoryTransaction from "@/lib/db/models/InventoryTransaction";
import { revalidatePath } from "next/cache";

// --- Item Actions ---

export async function createInventoryItem(data: {
    schoolId: string;
    name: string;
    category?: string;
    unit: string;
    minStockThreshold: number;
    description?: string;
}) {
    try {
        await connectDB();
        const newItem = await InventoryItem.create({
            school: data.schoolId,
            ...data,
        });
        revalidatePath("/school/inventory");
        return { success: true, data: JSON.parse(JSON.stringify(newItem)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getInventoryItems(schoolId: string) {
    try {
        await connectDB();
        const items = await InventoryItem.find({ school: schoolId }).sort({ name: 1 });
        return { success: true, data: JSON.parse(JSON.stringify(items)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Transaction Actions ---

export async function adjustStock(data: {
    schoolId: string;
    itemId: string;
    userId: string;
    type: "IN" | "OUT";
    quantity: number;
    reference?: string;
}) {
    try {
        await connectDB();

        const item = await InventoryItem.findById(data.itemId);
        if (!item) return { success: false, error: "Item not found" };

        if (data.type === "OUT") {
            if (item.quantity < data.quantity) {
                return { success: false, error: "Insufficient stock" };
            }
            item.quantity -= data.quantity;
        } else {
            item.quantity += data.quantity;
        }

        await item.save();

        const transaction = await InventoryTransaction.create({
            school: data.schoolId,
            item: data.itemId,
            type: data.type,
            quantity: data.quantity,
            performedBy: data.userId,
            reference: data.reference,
        });

        revalidatePath("/school/inventory");
        return { success: true, data: JSON.parse(JSON.stringify(transaction)) };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getInventoryTransactions(schoolId: string) {
    try {
        await connectDB();
        const transactions = await InventoryTransaction.find({ school: schoolId })
            .populate("item", "name unit")
            .populate("performedBy", "name")
            .sort({ date: -1 })
            .limit(100);
        return { success: true, data: JSON.parse(JSON.stringify(transactions)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
