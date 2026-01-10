"use server";

import { z } from "zod";
import FeeStructure, { IFeeStructure } from "@/lib/db/models/FeeStructure";
import FeePayment from "@/lib/db/models/FeePayment";
import Student from "@/lib/db/models/Student";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/actions/audit.actions";
import mongoose from "mongoose";

// --- VALIDATORS ---

const createFeeSchema = z.object({
    name: z.string().min(2),
    classId: z.string().min(1),
    amount: z.coerce.number().min(0),
    type: z.enum(["Tuition", "Transport", "Exam", "Admission", "Misc"]),
    frequency: z.enum(["One-Time", "Monthly", "Quarterly", "Yearly"]),
    dueDate: z.string(),
});

// --- ACTIONS ---

export async function createFeeStructure(formData: FormData) {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const validated = createFeeSchema.safeParse({
        name: formData.get("name"),
        classId: formData.get("classId"),
        amount: formData.get("amount"),
        type: formData.get("type"),
        frequency: formData.get("frequency"),
        dueDate: formData.get("dueDate"),
    });

    if (!validated.success) {
        return { message: "Validation Failed: " + JSON.stringify(validated.error.flatten()) };
    }

    await connectDB();

    try {
        await FeeStructure.create({
            school: session.user.schoolId,
            class: validated.data.classId,
            ...validated.data,
            dueDate: new Date(validated.data.dueDate),
        });

        revalidatePath("/school/finance/structure");
        return { message: "Fee Structure created successfully!" };
    } catch (error) {
        console.error(error);
        return { message: "Database Error" };
    }
}

export async function getFeeStructures(classId?: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const query: any = { school: session.user.schoolId };
    if (classId) query.class = classId;

    const fees = await FeeStructure.find(query)
        .populate("class", "name")
        .sort({ class: 1, dueDate: 1 })
        .lean();

    return JSON.parse(JSON.stringify(fees));
}

export async function deleteFeeStructure(id: string) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();
    await FeeStructure.findByIdAndDelete(id);
    revalidatePath("/school/finance/structure");
}

// --- CORE LOGIC: DUE CALCULATION ---

export async function calculateStudentDues(studentId: string) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

    const student = await Student.findById(studentId).populate("guardians").lean();
    if (!student) throw new Error("Student not found");

    // 1. Get Class Fees
    const fees = await FeeStructure.find({
        school: session.user.schoolId,
        class: student.class
    }).lean();

    // 2. Check Sibling Discount (Logic: If same guardian has > 1 child approx)
    let siblingDiscount = 0;
    if (student.guardians && student.guardians.length > 0) {
        // Find other students with same FIRST guardian
        const siblings = await Student.countDocuments({
            school: session.user.schoolId,
            guardians: student.guardians[0],
            _id: { $ne: student._id },
            status: "Admitted"
        });

        if (siblings > 0) {
            siblingDiscount = 10; // 10% Flat for now. Could be dynamic.
        }
    }

    // 3. Calculate Total Payable
    let totalFees = 0;
    let totalDiscount = 0;

    const feeBreakdown = fees.map((fee: any) => {
        let payable = fee.amount;
        let discount = 0;

        // Apply discount only on TUITION fees?
        if (fee.type === "Tuition" && siblingDiscount > 0) {
            discount = (payable * siblingDiscount) / 100;
            payable -= discount;
        }

        totalFees += fee.amount;
        totalDiscount += discount;

        return {
            ...fee,
            discountApplied: discount,
            finalAmount: payable
        };
    });

    // --- TRANSPORT FEE INTEGRATION ---
    if (student.transportRoute) {
        // Need to populate or fetch separately since lean() on student didn't include it fully if it was just ObjectId
        // But Populate in findById is easiest.
        // Re-fetching or assuming I update the findById above.
        // Let's do a quick separate fetch if not populated to avoid breaking existing signatures if I changed it.
        // Actually, I can just fetch the Route.
        const TransportRouteModel = mongoose.models.TransportRoute; // Lazy require to avoid circular diffs if any
        if (TransportRouteModel) {
            const route = await TransportRouteModel.findById(student.transportRoute);
            if (route) {
                const transportFee = {
                    _id: "transport_" + route._id,
                    name: `Transport: ${route.name}`,
                    type: "Transport",
                    amount: route.monthlyCost,
                    frequency: "Monthly",
                    dueDate: new Date(), // Current due
                    discountApplied: 0,
                    finalAmount: route.monthlyCost
                };

                feeBreakdown.push(transportFee);
                totalFees += route.monthlyCost;
            }
        }
    }

    const netPayable = totalFees - totalDiscount;

    // 4. Get Total Paid
    const payments = await FeePayment.find({
        school: session.user.schoolId,
        student: studentId
    }).sort({ date: -1 }).lean();

    const totalPaid = payments.reduce((acc, p) => acc + p.amountPaid, 0);
    const balanceDue = netPayable - totalPaid;

    return {
        student: { firstName: student.firstName, lastName: student.lastName, admissionNumber: student.admissionNumber },
        breakdown: JSON.parse(JSON.stringify(feeBreakdown)),
        summary: {
            totalFees,
            totalDiscount,
            netPayable,
            totalPaid,
            balanceDue,
            siblingDiscountPercent: siblingDiscount
        },
        history: JSON.parse(JSON.stringify(payments))
    };
}

// --- PAYMENT COLLECTION ---

export async function collectFee(data: {
    studentId: string;
    amount: number;
    method: string;
    remarks?: string;
    paidBy?: string;
}) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

    // Generate Verification or Receipt Code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await FeePayment.countDocuments({
        school: session.user.schoolId,
        date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
    });
    const receiptNumber = `RCP-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

    const payment = await FeePayment.create({
        school: session.user.schoolId,
        student: data.studentId,
        receiptNumber,
        amountPaid: data.amount,
        date: new Date(),
        method: data.method,
        paidBy: data.paidBy || "Guardian",
        status: "PAID",
        remarks: data.remarks
    });

    await logAudit({
        schoolId: session.user.schoolId,
        actor: session.user.id,
        action: "COLLECT_FEE",
        target: payment._id.toString(),
        details: { amount: data.amount, receipt: receiptNumber }
    });

    revalidatePath("/school/finance");
    return JSON.parse(JSON.stringify(payment));
}

// --- STATS ---

export async function getFinanceStats() {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Today's Collection
    const todayCollection = await FeePayment.aggregate([
        { $match: { school: new mongoose.Types.ObjectId(session.user.schoolId), date: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);

    // 2. Month's Collection
    const monthCollection = await FeePayment.aggregate([
        { $match: { school: new mongoose.Types.ObjectId(session.user.schoolId), date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);

    // 3. Recent Transactions
    const recent = await FeePayment.find({ school: session.user.schoolId })
        .populate("student", "firstName lastName admissionNumber")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    return {
        today: todayCollection[0]?.total || 0,
        month: monthCollection[0]?.total || 0,
        recent: JSON.parse(JSON.stringify(recent))
    };
}

// --- WAIVER ---

export async function waiveFee(data: {
    studentId: string;
    amount: number;
    reason: string;
}) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    // Check Permission (Mock: Only SCHOOL_ADMIN can waive for now as per schema roles)
    // Assuming role check logic for "Fee Waive" permission
    if (session.user.role !== "SCHOOL_ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Permission Denied: Only School Admin can waive fees.");
    }

    await connectDB();

    // Generate Waiver Receipt Code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await FeePayment.countDocuments({
        school: session.user.schoolId,
        date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
    });
    const receiptNumber = `WVR-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

    const payment = await FeePayment.create({
        school: session.user.schoolId,
        student: data.studentId,
        receiptNumber,
        amountPaid: data.amount,
        date: new Date(),
        method: "Waiver",
        paidBy: "School Management",
        status: "PAID",
        remarks: `Waiver: ${data.reason} (Granted by ${session.user.name})`
    });

    await logAudit({
        schoolId: session.user.schoolId,
        actor: session.user.id,
        action: "WAIVE_FEE",
        target: payment._id.toString(),
        details: { amount: data.amount, receipt: receiptNumber, reason: data.reason }
    });

    revalidatePath("/school/finance");
    return JSON.parse(JSON.stringify(payment));
}
