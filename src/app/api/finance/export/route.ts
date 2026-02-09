import { auth } from "@/auth";
import { format } from "date-fns";
import connectDB from "@/lib/db/connect";
import FeePayment from "@/lib/db/models/FeePayment";
import mongoose from "mongoose";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.schoolId) return new Response("Unauthorized", { status: 401 });

    await connectDB();

    const transactions = await FeePayment.find({ school: session.user.schoolId })
        .populate("student", "firstName lastName admissionNumber")
        .sort({ date: -1 })
        .lean();

    // CSV Header
    const header = [
        "Date",
        "Receipt Number",
        "Student Name",
        "Admission No",
        "Amount Paid",
        "Method",
        "Paid By",
        "Status",
        "Remarks"
    ].join(",");

    // CSV Rows
    const rows = transactions.map((t: any) => {
        const studentName = t.student ? `${t.student.firstName} ${t.student.lastName}` : "Unknown";
        const admissionNo = t.student?.admissionNumber || "N/A";

        return [
            format(new Date(t.date), "dd/MM/yyyy"),
            `"${t.receiptNumber}"`,
            `"${studentName}"`,
            `"${admissionNo}"`,
            t.amountPaid,
            `"${t.method}"`,
            `"${t.paidBy || ""}"`,
            `"${t.status}"`,
            `"${(t.remarks || "").replace(/"/g, '""')}"`
        ].join(",");
    });

    const csvContent = [header, ...rows].join("\n");

    return new Response(csvContent, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="transactions_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
    });
}
