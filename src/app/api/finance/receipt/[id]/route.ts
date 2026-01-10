import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import FeePayment from "@/lib/db/models/FeePayment";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";
import mongoose from "mongoose";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();
    const payment = await FeePayment.findOne({
        _id: params.id,
        school: session.user.schoolId
    }).populate("student", "firstName lastName admissionNumber class section").lean();

    if (!payment) {
        return new Response("Receipt not found", { status: 404 });
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Title
    const title = payment.method === "Waiver" ? "FEE WAIVER RECEIPT" : "FEE PAYMENT RECEIPT";
    page.drawText(title, {
        x: width / 2 - (title.length * 10) / 2,
        y: height - 50,
        size: 20,
        font: fontBold,
        color: rgb(0, 0, 0),
    });

    // Content
    const fontSize = 12;
    const lineHeight = 20;
    let y = height - 100;

    const drawLine = (text: string, isBold = false) => {
        page.drawText(text, {
            x: 50,
            y,
            size: fontSize,
            font: isBold ? fontBold : font,
            color: rgb(0, 0, 0)
        });
        y -= lineHeight;
    };

    drawLine(`Receipt No: ${payment.receiptNumber}`, true);
    drawLine(`Date: ${format(new Date(payment.date), "dd MMMM yyyy, hh:mm a")}`);
    y -= 10;

    // Student Info
    // @ts-ignore
    const studentName = payment.student ? `${payment.student.firstName} ${payment.student.lastName}` : "Unknown Student";
    // @ts-ignore
    const admNo = payment.student?.admissionNumber || "N/A";

    drawLine(`Student: ${studentName}`, true);
    drawLine(`Admission No: ${admNo}`);

    y -= 10;
    drawLine(`Amount: Rs. ${payment.amountPaid.toLocaleString()}`, true);
    drawLine(`Payment Method: ${payment.method}`);

    if (payment.transactionReference) {
        drawLine(`Ref No: ${payment.transactionReference}`);
    }

    if (payment.remarks) {
        y -= 5;
        drawLine(`Remarks: ${payment.remarks}`);
    }

    y -= 30;
    drawLine(`Status: ${payment.status}`, true);

    y -= 30;
    drawLine("Authorized Signatory");

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes as any, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${payment.receiptNumber}.pdf"`,
        },
    });
}
