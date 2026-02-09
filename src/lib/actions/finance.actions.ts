"use server";

import { z } from "zod";
import FeeStructure from "@/lib/db/models/FeeStructure";
import FeePayment from "@/lib/db/models/FeePayment";
import Student from "@/lib/db/models/Student";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/actions/audit.actions";
import mongoose from "mongoose";
import { ActionState } from "@/lib/types/actions";

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

export async function createFeeStructure(prevStateOrFormData: any, formData?: FormData): Promise<ActionState<null>> {
    const data = (prevStateOrFormData instanceof FormData) ? prevStateOrFormData : formData;
    if (!data) return { success: false, data: null, message: "Invalid Data" };

    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    const validated = createFeeSchema.safeParse({
        name: data.get("name"),
        classId: data.get("classId"),
        amount: data.get("amount"),
        type: data.get("type"),
        frequency: data.get("frequency"),
        dueDate: data.get("dueDate"),
    });

    if (!validated.success) {
        return {
            success: false,
            data: null,
            message: "Validation Failed",
            errors: validated.error.flatten().fieldErrors
        };
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
        return { success: true, data: null, message: "Fee Structure created successfully!" };
    } catch (error) {
        console.error(error);
        return { success: false, data: null, message: "Database Error" };
    }
}

export async function getFeeStructures(classId?: string): Promise<any[]> {
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

export async function deleteFeeStructure(id: string): Promise<void> {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();
    await FeeStructure.findByIdAndDelete(id);
    revalidatePath("/school/finance/structure");
}

// --- CORE LOGIC: DUE CALCULATION ---

export async function calculateStudentDues(studentId: string): Promise<any> {
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

    // 2. Check Sibling Discount
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
            siblingDiscount = 10;
        }
    }

    // 3. Calculate Total Payable
    let totalFees = 0;
    let totalDiscount = 0;

    const feeBreakdown = fees.map((fee: any) => {
        let payable = fee.amount;
        let discount = 0;

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
        const TransportRouteModel = mongoose.models.TransportRoute;
        if (TransportRouteModel) {
            const route = await TransportRouteModel.findById(student.transportRoute);
            if (route) {
                const transportFee = {
                    _id: "transport_" + route._id,
                    name: `Transport: ${route.name}`,
                    type: "Transport",
                    amount: route.monthlyCost,
                    frequency: "Monthly",
                    dueDate: new Date(),
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

export async function getStudentFees(studentId: string, schoolId: string): Promise<any> {
    console.log("STUDENT PORTAL QUERY: getStudentFees", { schoolId, studentId });
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(schoolId)) {
        console.error("Invalid IDs provided to getStudentFees", { studentId, schoolId });
        return {
            student: {},
            breakdown: [],
            summary: { netPayable: 0, totalPaid: 0, balanceDue: 0 },
            history: []
        };
    }

    try {
        // Reuse the complex calculation logic
        // Verify session schoolId matches provided schoolId if needed, but calculateStudentDues uses session schoolId
        // We assume session.user.schoolId is correct for the logged in student
        const data = await calculateStudentDues(studentId);
        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.error("Error calculating student fees:", error);
        return {
            student: {},
            breakdown: [],
            summary: { netPayable: 0, totalPaid: 0, balanceDue: 0 },
            history: []
        };
    }
}

// --- PAYMENT COLLECTION ---

export async function collectFee(data: {
    studentId: string;
    amount: number;
    method: string;
    remarks?: string;
    paidBy?: string;
}): Promise<any> {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

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

    await logAction(
        session.user.id,
        "COLLECT_FEE",
        "FEE_PAYMENT",
        { amount: data.amount, receipt: receiptNumber, paymentId: payment._id.toString() },
        session.user.schoolId
    );

    revalidatePath("/school/finance");
    return JSON.parse(JSON.stringify(payment));
}

export async function getFinanceStats(): Promise<any> {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayCollection = await FeePayment.aggregate([
        { $match: { school: new mongoose.Types.ObjectId(session.user.schoolId), date: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);

    const monthCollection = await FeePayment.aggregate([
        { $match: { school: new mongoose.Types.ObjectId(session.user.schoolId), date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);

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

export async function waiveFee(data: {
    studentId: string;
    amount: number;
    reason: string;
}): Promise<any> {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    if (session.user.role !== "SCHOOL_ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Permission Denied: Only School Admin can waive fees.");
    }

    await connectDB();

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

    await logAction(
        session.user.id,
        "WAIVE_FEE",
        "FEE_PAYMENT",
        { amount: data.amount, receipt: receiptNumber, reason: data.reason, paymentId: payment._id.toString() },
        session.user.schoolId
    );

    revalidatePath("/school/finance");
    return JSON.parse(JSON.stringify(payment));
}

// --- WRAPPER FOR FORM ACTIONS ---

export async function recordPayment(_prevState: any, formData: FormData): Promise<ActionState<null>> {
    const session = await auth();
    if (!session?.user?.schoolId) return { success: false, data: null, message: "Unauthorized" };

    const studentId = formData.get("studentId") as string;
    const feeId = formData.get("feeId") as string;
    const amountStr = formData.get("amount") as string;

    if (!studentId || !amountStr) {
        return { success: false, data: null, message: "Missing required fields" };
    }

    try {
        await collectFee({
            studentId,
            amount: parseFloat(amountStr),
            method: "Cash",
            remarks: `Fee Payment for ID: ${feeId || "General"}`
        });
        return { success: true, data: null, message: "Payment Recorded Successfully" };
    } catch (error: any) {
        console.error("Payment Error:", error);
        return { success: false, data: null, message: error.message || "Failed to record payment" };
    }
}
