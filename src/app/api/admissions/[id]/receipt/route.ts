import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Enquiry from "@/lib/db/models/Enquiry";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();
    const enquiry = await Enquiry.findOne({
        _id: id,
        school: session.user.schoolId
    }).populate("classAppliedFor").lean();

    if (!enquiry) {
        return new Response("Enquiry not found", { status: 404 });
    }

    if (enquiry.status !== "Admitted") {
        return new Response("Admission not confirmed yet.", { status: 400 });
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Title
    const title = "ADMISSION RECEIPT";
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

    const drawLine = (text: string) => {
        page.drawText(text, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
        y -= lineHeight;
    };

    drawLine(`Receipt No: ${enquiry._id.toString().substring(0, 8).toUpperCase()}`);
    drawLine(`Date: ${format(new Date(), "dd MMMM yyyy")}`);
    y -= 10;

    drawLine(`Received with thanks from: ${enquiry.parentName}`);
    drawLine(`For Student: ${enquiry.studentName}`);
    drawLine(`Class: ${(enquiry.classAppliedFor as any)?.name}`);

    y -= 10;
    drawLine(`Admission Status: CONFIRMED`);

    if (enquiry.assignedStudent) {
        drawLine(`Assigned Student ID: ${enquiry.assignedStudent}`);
    }

    y -= 30;
    drawLine("Authorized Signatory");

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes as any, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${enquiry.studentName}_Receipt.pdf"`,
        },
    });
}
