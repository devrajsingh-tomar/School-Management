"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Enquiry, { EnquiryStatus } from "@/lib/db/models/Enquiry";
import Student, { StudentStatus } from "@/lib/db/models/Student";
import Guardian from "@/lib/db/models/Guardian";
import AuditLog from "@/lib/db/models/AuditLog";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// --- CRUD ---

export async function createEnquiry(data: any) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

    const enquiry = await Enquiry.create({
        ...data,
        school: session.user.schoolId,
        status: EnquiryStatus.NEW,
    });

    await AuditLog.create({
        school: session.user.schoolId,
        actor: session.user.id,
        action: "CREATE_ENQUIRY",
        target: enquiry._id.toString(),
        details: { name: enquiry.studentName },
    });

    revalidatePath("/admin/admissions/enquiries");
    return JSON.parse(JSON.stringify(enquiry));
}

export async function updateEnquiry(id: string, data: any) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

    const enquiry = await Enquiry.findOne({ _id: id, school: session.user.schoolId });
    if (!enquiry) throw new Error("Enquiry not found");

    const updated = await Enquiry.findByIdAndUpdate(id, data, { new: true });

    await AuditLog.create({
        school: session.user.schoolId,
        actor: session.user.id,
        action: "UPDATE_ENQUIRY",
        target: id,
        details: { changes: data },
    });

    revalidatePath("/admin/admissions/enquiries");
    revalidatePath(`/admin/admissions/enquiries/${id}`);
    return JSON.parse(JSON.stringify(updated));
}

export async function deleteEnquiry(id: string) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

    const enquiry = await Enquiry.findOneAndDelete({ _id: id, school: session.user.schoolId });
    if (!enquiry) throw new Error("Enquiry not found");

    revalidatePath("/admin/admissions/enquiries");
    return { success: true };
}

export async function getEnquiries(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { school: session.user.schoolId };

    if (query.status) {
        filter.status = query.status;
    }

    if (query.search) {
        const searchRegex = new RegExp(query.search, "i");
        filter.$or = [
            { studentName: searchRegex },
            { parentName: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
        ];
    }

    const enquiries = await Enquiry.find(filter)
        .populate("classAppliedFor", "name")
        .populate("academicSession", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Enquiry.countDocuments(filter);

    // Group by status for Kanban/Stats
    const stats = await Enquiry.aggregate([
        { $match: { school: new mongoose.Types.ObjectId(session.user.schoolId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return {
        enquiries: JSON.parse(JSON.stringify(enquiries)),
        total,
        pages: Math.ceil(total / limit),
        stats,
    };
}

export async function getEnquiryById(id: string) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

    const enquiry = await Enquiry.findOne({ _id: id, school: session.user.schoolId })
        .populate("classAppliedFor")
        .populate("academicSession")
        .populate("assignedStudent")
        .lean();

    if (!enquiry) return null;

    return JSON.parse(JSON.stringify(enquiry));
}

// --- PIPELINE ACTIONS ---

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
    return updateEnquiry(id, { status });
}

export async function scheduleTest(id: string, date: Date) {
    return updateEnquiry(id, { testDate: date, status: EnquiryStatus.TEST_SCHEDULED });
}

export async function scheduleInterview(id: string, date: Date) {
    return updateEnquiry(id, { interviewDate: date, status: EnquiryStatus.INTERVIEW_SCHEDULED });
}

// --- CONVERSION ---

export async function convertEnquiryToStudent(id: string, admissionNumber: string) {
    const session = await auth();
    if (!session?.user?.schoolId) throw new Error("Unauthorized");

    await connectDB();

    const enquiry = await Enquiry.findOne({ _id: id, school: session.user.schoolId });
    if (!enquiry) throw new Error("Enquiry not found");
    if (enquiry.status === EnquiryStatus.ADMITTED) throw new Error("Already admitted");

    // Start Transaction
    const mongooseSession = await mongoose.startSession();
    mongooseSession.startTransaction();

    try {
        // 1. Create Guardian
        // We assume the parentName is the Father's name for simplicity, or create a generic guardian
        const guardian = new Guardian({
            school: session.user.schoolId,
            firstName: enquiry.parentName.split(" ")[0],
            lastName: enquiry.parentName.split(" ").slice(1).join(" ") || "Guardian",
            relationship: "Father", // Default
            email: enquiry.email,
            phone: enquiry.phone,
            address: {
                street: enquiry.address,
                city: "Unknown",
                state: "Unknown",
                zipCode: "000000"
            } // Basic address mapping
        });
        await guardian.save({ session: mongooseSession });

        // 2. Create Student
        const student = new Student({
            school: session.user.schoolId,
            admissionNumber: admissionNumber,
            firstName: enquiry.studentName.split(" ")[0],
            lastName: enquiry.studentName.split(" ").slice(1).join(" ") || ".",
            dob: enquiry.dob,
            gender: enquiry.gender,
            email: enquiry.email,
            phone: enquiry.phone,
            address: {
                street: enquiry.address,
                city: "Unknown",
                state: "Unknown",
                zipCode: "000000"
            },
            class: enquiry.classAppliedFor,
            guardians: [guardian._id],
            status: StudentStatus.ADMITTED,
            // Map other fields if necessary
        });
        await student.save({ session: mongooseSession });

        // 3. Update Enquiry
        enquiry.status = EnquiryStatus.ADMITTED;
        enquiry.assignedStudent = student._id;
        await enquiry.save({ session: mongooseSession });

        await mongooseSession.commitTransaction();
        mongooseSession.endSession();

        await AuditLog.create({
            school: session.user.schoolId,
            actor: session.user.id,
            action: "CONVERT_ENQUIRY",
            target: id,
            details: { studentId: student._id.toString() },
        });

        revalidatePath("/admin/admissions/enquiries");
        return JSON.parse(JSON.stringify(student));

    } catch (error) {
        await mongooseSession.abortTransaction();
        mongooseSession.endSession();
        throw error;
    }
}
