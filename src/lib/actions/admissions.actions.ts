"use server";

import { auth } from "@/auth";
import Enquiry from "@/lib/db/models/Enquiry";
import Student from "@/lib/db/models/Student";
import connectToDatabase from "@/lib/db/connect";
import { ActionState } from "@/lib/types/actions";
import { EnquiryStatus, StudentStatus } from "@/lib/types/enums";
import { revalidatePath } from "next/cache";

export async function getEnquiries(status?: string): Promise<ActionState<any[]>> {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.schoolId) return { success: false, message: "Unauthorized", data: [] };

        const query: any = { school: session.user.schoolId };
        if (status && status !== "ALL") {
            query.status = status;
        }

        const enquiries = await Enquiry.find(query).populate("classAppliedFor").sort({ createdAt: -1 }).lean();

        // Serialize
        const plainEnquiries = enquiries.map((enq: any) => ({
            ...enq,
            _id: enq._id.toString(),
            school: enq.school.toString(),
            classAppliedFor: enq.classAppliedFor ? { ...enq.classAppliedFor, _id: enq.classAppliedFor._id.toString() } : null,
            assignedStudent: enq.assignedStudent?.toString(),
            createdAt: enq.createdAt.toISOString(),
            updatedAt: enq.updatedAt.toISOString(),
            dob: enq.dob.toISOString(),
        }));

        return { success: true, data: plainEnquiries };
    } catch (error) {
        console.error("Error fetching enquiries:", error);
        return { success: false, message: "Failed to fetch enquiries", data: [] };
    }
}

export async function updateEnquiryStatus(enquiryId: string, status: string): Promise<ActionState<null>> {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.schoolId) return { success: false, message: "Unauthorized", data: null };

        await Enquiry.findByIdAndUpdate(enquiryId, { status });
        revalidatePath("/school/admissions");
        return { success: true, message: "Status updated successfully", data: null };
    } catch (error) {
        return { success: false, message: "Failed to update status", data: null };
    }
}

export async function convertEnquiryToStudent(enquiryId: string): Promise<ActionState<string>> {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.schoolId) return { success: false, message: "Unauthorized", data: "" };

        const enquiry = await Enquiry.findById(enquiryId);
        if (!enquiry) return { success: false, message: "Enquiry not found", data: "" };

        // Basic Name Split (Naive)
        const nameParts = enquiry.studentName.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Student";

        // Generate Admission Number (Random for now, usually sequential)
        const admissionNumber = `ADM-${Date.now().toString().slice(-6)}`;

        const newStudent = await Student.create({
            school: enquiry.school,
            firstName,
            lastName,
            dob: enquiry.dob,
            gender: enquiry.gender,
            email: enquiry.email,
            phone: enquiry.phone,
            address: {
                street: enquiry.address || "",
                city: "Default City",
                state: "Default State",
                zipCode: "000000"
            },
            class: enquiry.classAppliedFor,
            admissionNumber,
            status: StudentStatus.ADMITTED,
        });

        // Update Enquiry
        enquiry.status = EnquiryStatus.ADMITTED;
        enquiry.assignedStudent = newStudent._id;
        await enquiry.save();

        revalidatePath("/school/admissions");
        revalidatePath("/school/students");

        return { success: true, message: "Student admitted successfully", data: newStudent._id.toString() };
    } catch (error) {
        console.error("Conversion Error:", error);
        return { success: false, message: "Failed to convert to student", data: "" };
    }
}
