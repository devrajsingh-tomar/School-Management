"use client";

import { Button } from "@/components/ui/button";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ReportDownloader({ schoolName, type }: { schoolName: string; type: "Students" | "Finance" | "Attendance" }) {
    const [generating, setGenerating] = useState(false);

    async function generateReport() {
        setGenerating(true);
        try {
            // Create a new PDFDocument
            const pdfDoc = await PDFDocument.create();

            // Embed the Times Roman font
            const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

            // Add a blank page to the document
            const page = pdfDoc.addPage();

            // Get the width and height of the page
            const { width, height } = page.getSize();

            // Draw a string of text toward the top of the page
            const fontSize = 30;
            page.drawText(`${schoolName} Report`, {
                x: 50,
                y: height - 4 * fontSize,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0.53, 0.71),
            });

            page.drawText(`Type: ${type} Report`, {
                x: 50,
                y: height - 6 * fontSize,
                size: 20,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });

            page.drawText(`Generated on: ${new Date().toLocaleString()}`, {
                x: 50,
                y: height - 8 * fontSize,
                size: 14,
                font: timesRomanFont,
                color: rgb(0.5, 0.5, 0.5),
            });

            page.drawText("(This is a sample generated PDF)", {
                x: 50,
                y: height - 10 * fontSize,
                size: 12,
                font: timesRomanFont,
                color: rgb(0.8, 0.1, 0.1),
            });

            // Serialize the PDFDocument to bytes (a Uint8Array)
            const pdfBytes = await pdfDoc.save();

            // Trigger download
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${type}_Report_${new Date().getTime()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Report downloaded");
        } catch (error) {
            console.error("PDF generation failed", error);
            toast.error("Failed to generate PDF");
        } finally {
            setGenerating(false);
        }
    }

    return (
        <Button onClick={generateReport} disabled={generating} variant="outline" className="w-full justify-start">
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download {type} Report
        </Button>
    );
}
