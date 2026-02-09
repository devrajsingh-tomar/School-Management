import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Student from "@/lib/db/models/Student";
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

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "BONAFIDE"; // BONAFIDE or TC

    await connectDB();
    const student = await Student.findOne({
        _id: id,
        school: session.user.schoolId
    }).populate("class").populate("section").lean();

    if (!student) {
        return new Response("Student not found", { status: 404 });
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Title
    const title = type === "TC" ? "TRANSFER CERTIFICATE" : "BONAFIDE CERTIFICATE";
    page.drawText(title, {
        x: width / 2 - (title.length * 10) / 2, // Centered (approx)
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

    drawLine(`This is to certify that Mr./Ms. ${student.firstName} ${student.lastName}`);
    drawLine(`Admission Number: ${student.admissionNumber}`);
    drawLine(`Date of Birth: ${format(new Date(student.dob), "dd MMMM yyyy")}`);

    if (student.class) {
        let classText = `Class: ${(student.class as any).name}`;
        if (student.section) classText += ` - Section: ${(student.section as any).name}`;
        drawLine(classText);
    }

    drawLine(`Status: ${student.status}`);

    y -= lineHeight; // Extra space
    drawLine(`Date of Issue: ${format(new Date(), "dd MMMM yyyy")}`);

    // Footer
    page.drawText("Principal Signature", {
        x: width - 200,
        y: 50,
        size: 12,
        font: fontBold,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes as any, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${student.firstName}_${type}.pdf"`,
        },
    });
}
