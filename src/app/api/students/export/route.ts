import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Student from "@/lib/db/models/Student";
import { format } from "date-fns";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();

    const students = await Student.find({ school: session.user.schoolId })
        .populate("class", "name")
        .populate("section", "name")
        .sort({ admissionNumber: 1 })
        .lean();

    const csvRows = [
        ["Admission No", "First Name", "Last Name", "Gender", "DOB", "Class", "Section", "Status", "Parent Phone"],
    ];

    students.forEach((s: any) => {
        csvRows.push([
            s.admissionNumber,
            s.firstName,
            s.lastName,
            s.gender,
            format(new Date(s.dob), "yyyy-MM-dd"),
            s.class?.name || "",
            s.section?.name || "",
            s.status,
            s.phone || "",
        ]);
    });

    const csvString = csvRows.map((e) => e.join(",")).join("\n");

    return new Response(csvString, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="students_${format(new Date(), "yyyy-MM-dd")}.csv"`,
        },
    });
}
