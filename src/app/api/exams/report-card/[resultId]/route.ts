import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Result from "@/lib/db/models/Result";
import Exam from "@/lib/db/models/Exam";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import mongoose from "mongoose";

export async function GET(
    req: Request,
    { params }: { params: { resultId: string } }
) {
    const session = await auth();
    if (!session?.user?.schoolId) return new Response("Unauthorized", { status: 401 });

    await connectDB();
    const result = await Result.findById(params.resultId)
        .populate("student", "firstName lastName admissionNumber rollNumber dob")
        .populate("class", "name section")
        .populate("exam", "name startDate")
        .lean();

    if (!result) return new Response("Result not found", { status: 404 });
    const exam = result.exam as any;
    const student = result.student as any;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // --- DESIGN ---

    // Header
    page.drawText("SCHOOL MANAGEMENT SYSTEM", { x: 50, y: height - 50, size: 20, font: fontBold });
    page.drawText("REPORT CARD", { x: 50, y: height - 80, size: 16, font: fontBold, color: rgb(0.5, 0.5, 0.5) });

    // Student Details Box
    let y = height - 120;
    const drawLabelVal = (label: string, val: string, x: number) => {
        page.drawText(label, { x, y, size: 10, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(val, { x: x + 80, y, size: 10, font });
    };

    drawLabelVal("Student Name:", `${student.firstName} ${student.lastName}`, 50);
    drawLabelVal("Admission No:", student.admissionNumber, 300);
    y -= 20;
    drawLabelVal("Class:", `${result.class.name}`, 50);
    drawLabelVal("Exam:", exam.name, 300);
    y -= 20;
    drawLabelVal("Result Status:", result.status, 50);

    // Marks Table
    y -= 50;
    const startY = y;

    // Table Header
    page.drawRectangle({ x: 50, y: y - 5, width: width - 100, height: 25, color: rgb(0.95, 0.95, 0.95) });
    page.drawText("Subject", { x: 60, y, size: 12, font: fontBold });
    page.drawText("Max Marks", { x: 250, y, size: 12, font: fontBold });
    page.drawText("Obtained", { x: 350, y, size: 12, font: fontBold });
    page.drawText("Grade", { x: 450, y, size: 12, font: fontBold });
    y -= 30;

    // Rows
    result.subjectScores.forEach((sub: any) => {
        // Find max marks from exam.subjects (Need to re-fetch if not in result, but we stored max in exam)
        // For visual simplicity in prototype, we assume result stores pure score and we look up max in exam def? 
        // Or cleaner: Result model stores scores. Exam stores definitions.
        // We have exam populated.
        const subDef = exam.subjects.find((s: any) => s.name === sub.subject);
        const max = subDef ? subDef.maxMarks : 100;

        page.drawText(sub.subject, { x: 60, y, size: 11, font });
        page.drawText(String(max), { x: 250, y, size: 11, font });
        page.drawText(String(sub.marksObtained), { x: 350, y, size: 11, font });

        // Grade Logic (Simple reuse)
        const percent = (sub.marksObtained / max) * 100;
        let grade = "E";
        if (percent >= 90) grade = "A+";
        else if (percent >= 80) grade = "A";
        else if (percent >= 70) grade = "B";
        else if (percent >= 50) grade = "C";
        else if (percent >= 33) grade = "D";

        page.drawText(grade, { x: 450, y, size: 11, font });

        y -= 25;
    });

    // Summary Line
    y -= 10;
    page.drawLine({ start: { x: 50, y: y + 15 }, end: { x: width - 50, y: y + 15 }, thickness: 1, color: rgb(0, 0, 0) });
    page.drawText("TOTAL", { x: 60, y, size: 12, font: fontBold });
    page.drawText(`${result.totalMax}`, { x: 250, y, size: 12, font: fontBold });
    page.drawText(`${result.totalObtained}`, { x: 350, y, size: 12, font: fontBold });
    page.drawText(`${result.percentage.toFixed(1)}%`, { x: 450, y, size: 12, font: fontBold });

    // Footer
    y -= 80;
    page.drawText(`Rank: ${result.rank || '-'}`, { x: 50, y, size: 12, font: fontBold });

    page.drawText("Class Teacher", { x: 50, y: 100, size: 10, font: fontBold });
    page.drawText("Principal", { x: 450, y: 100, size: 10, font: fontBold });


    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes as any, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="ReportCard-${student.admissionNumber}.pdf"`,
        },
    });
}
