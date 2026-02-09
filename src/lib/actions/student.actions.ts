"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Student from "@/lib/db/models/Student";
import User from "@/lib/db/models/User";
import { logAction } from "@/lib/actions/audit.actions";
import { studentSchema, studentUpdateSchema } from "@/lib/validators/student";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionState } from "@/lib/types/actions";
import bcrypt from "bcryptjs";
import { sendCredentials } from "@/lib/services/credential-service";

export async function createStudent(data: z.infer<typeof studentSchema>): Promise<ActionState<any>> {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        return { success: false, data: null, message: "Unauthorized" };
    }

    const validated = studentSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, data: null, message: "Validation Failed", errors: validated.error.flatten().fieldErrors };
    }

    await connectDB();

    // Auto-generate admission number if not provided
    let admissionNumber = validated.data.admissionNumber;
    if (!admissionNumber) {
        const year = new Date().getFullYear();
        const count = await Student.countDocuments({ school: session.user.schoolId });
        admissionNumber = `ADM${year}${String(count + 1).padStart(4, '0')}`;

        // Ensure uniqueness
        let counter = 1;
        while (await Student.findOne({ school: session.user.schoolId, admissionNumber })) {
            admissionNumber = `ADM${year}${String(count + counter).padStart(4, '0')}`;
            counter++;
        }
    } else {
        // Only check uniqueness if admission number was manually provided
        const existing = await Student.findOne({
            school: session.user.schoolId,
            admissionNumber: admissionNumber,
        });
        if (existing) {
            return { success: false, data: null, message: "Admission number already exists" };
        }
    }

    try {
        const student = await Student.create({
            ...validated.data,
            admissionNumber, // Use the generated or provided admission number
            school: session.user.schoolId,
        });

        // Handle Portal Access Creation
        if (validated.data.createPortalAccess) {
            const password = validated.data.loginPassword || "123456";
            const hashedPassword = await bcrypt.hash(password, 10);

            // 1. Create Student User Account
            const studentIdentifier = validated.data.email || validated.data.phone || `${admissionNumber}@student.school`;

            await User.findOneAndUpdate(
                {
                    $or: [
                        { email: validated.data.email ? validated.data.email : "__NOT_PROVIDED__" },
                        { phone: validated.data.phone ? validated.data.phone : "__NOT_PROVIDED__" },
                        { name: `${student.firstName} ${student.lastName}`, school: session.user.schoolId, role: "STUDENT" }
                    ]
                },
                {
                    school: session.user.schoolId,
                    name: `${student.firstName} ${student.lastName}`,
                    email: validated.data.email,
                    phone: validated.data.phone,
                    passwordHash: hashedPassword,
                    role: "STUDENT",
                    linkedStudentId: student._id,
                    isActive: true
                },
                { upsert: true, new: true }
            );

            // 2. Create Parent User Account
            // For parent, we use a distinct identifier to prevent collision with student email/phone
            const parentEmail = validated.data.email ? `p_${validated.data.email}` : undefined;
            const parentPhone = validated.data.phone; // Might be same, but role is different

            await User.findOneAndUpdate(
                {
                    $or: [
                        { email: parentEmail ? parentEmail : "__NOT_PROVIDED__" },
                        { name: `Parent of ${student.firstName}`, school: session.user.schoolId, role: "PARENT" }
                    ]
                },
                {
                    school: session.user.schoolId,
                    name: `Parent of ${student.firstName}`,
                    email: parentEmail,
                    phone: parentPhone,
                    passwordHash: hashedPassword,
                    role: "PARENT",
                    linkedStudentId: student._id,
                    isActive: true
                },
                { upsert: true, new: true }
            );

            const parentIdentifier = parentEmail || parentPhone || `p_${student.admissionNumber}`;

            // TODO: In production, trigger Email/SMS notification here.
            console.log(`PROD LOG: Credentials created for Student/Parent. Identifier: ${studentIdentifier}, Password: ${password}`);

            // Send to Student
            await sendCredentials({
                name: `${student.firstName} ${student.lastName}`,
                identifier: studentIdentifier,
                password: password,
                role: "STUDENT",
                email: validated.data.email,
                phone: validated.data.phone,
                channel: validated.data.email ? "EMAIL" : "SMS"
            });

            // Send to Parent
            await sendCredentials({
                name: `Parent of ${student.firstName}`,
                identifier: parentIdentifier,
                password: password,
                role: "PARENT",
                email: validated.data.email ? `p_${validated.data.email}` : undefined,
                channel: validated.data.email ? "EMAIL" : "WHATSAPP"
            });
        }

        await logAction(
            session.user.id,
            "CREATE_STUDENT",
            "STUDENT",
            { name: `${student.firstName} ${student.lastName}`, id: student._id, portalAccess: !!validated.data.createPortalAccess },
            session.user.schoolId
        );

        revalidatePath("/school/students");
        return { success: true, data: JSON.parse(JSON.stringify(student)), message: "Student Created" };
    } catch (error: any) {
        console.error(error);
        return { success: false, data: null, message: error.message || "Database Error" };
    }
}

export async function updateStudent(id: string, data: z.infer<typeof studentUpdateSchema>): Promise<ActionState<any>> {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        return { success: false, data: null, message: "Unauthorized" };
    }

    const validated = studentUpdateSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, data: null, message: "Validation Failed", errors: validated.error.flatten().fieldErrors };
    }

    await connectDB();

    try {
        const student = await Student.findOne({ _id: id, school: session.user.schoolId });
        if (!student) return { success: false, data: null, message: "Student not found" };

        const updated = await Student.findByIdAndUpdate(id, validated.data, { new: true });

        await logAction(
            session.user.id,
            "UPDATE_STUDENT",
            "STUDENT",
            { id, changes: validated.data },
            session.user.schoolId
        );

        revalidatePath("/school/students");
        revalidatePath(`/school/students/${id}`);
        return { success: true, data: JSON.parse(JSON.stringify(updated)), message: "Student Updated" };
    } catch (error: any) {
        console.error(error);
        return { success: false, data: null, message: error.message || "Database Error" };
    }
}

export async function getStudents(query: {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
    status?: string;
}) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { school: session.user.schoolId };

    if (query.search) {
        const searchRegex = new RegExp(query.search, "i");
        filter.$or = [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { admissionNumber: searchRegex },
            { email: searchRegex },
        ];
    }

    if (query.classId) {
        filter.class = query.classId;
    }

    if (query.status) {
        filter.status = query.status;
    }

    const students = await Student.find(filter)
        .populate("class", "name")
        .populate("section", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Student.countDocuments(filter);

    return {
        students: JSON.parse(JSON.stringify(students)),
        total,
        pages: Math.ceil(total / limit),
    };
}

export async function getStudentById(id: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const student = await Student.findOne({ _id: id, school: session.user.schoolId })
        .populate("class")
        .populate("section")
        .populate("guardians")
        .populate("house")
        .populate("category")
        .lean();

    if (!student) return null;

    return JSON.parse(JSON.stringify(student));
}

export async function deleteStudent(id: string): Promise<ActionState<null>> {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        return { success: false, data: null, message: "Unauthorized" };
    }

    await connectDB();
    const student = await Student.findOneAndDelete({ _id: id, school: session.user.schoolId });
    if (!student) return { success: false, data: null, message: "Student not found" };

    await logAction(
        session.user.id,
        "DELETE_STUDENT",
        "STUDENT",
        { id, name: `${student.firstName} ${student.lastName}` },
        session.user.schoolId
    );

    revalidatePath("/school/students");
    return { success: true, data: null, message: "Student Deleted" };
}

export async function addGuardianToStudent(studentId: string, guardianId: string): Promise<ActionState<null>> {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) return { success: false, data: null, message: "Unauthorized" };

    await connectDB();

    await Student.findByIdAndUpdate(studentId, {
        $addToSet: { guardians: guardianId }
    });

    await logAction(
        session.user.id,
        "LINK_GUARDIAN",
        "STUDENT",
        { studentId, guardianId },
        session.user.schoolId
    );

    revalidatePath(`/school/students/${studentId}`);
    return { success: true, data: null, message: "Guardian Linked" };
}

export async function removeGuardianFromStudent(studentId: string, guardianId: string): Promise<ActionState<null>> {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) return { success: false, data: null, message: "Unauthorized" };

    await connectDB();

    await Student.findByIdAndUpdate(studentId, {
        $pull: { guardians: guardianId }
    });

    await logAction(
        session.user.id,
        "UNLINK_GUARDIAN",
        "STUDENT",
        { studentId, guardianId },
        session.user.schoolId
    );

    revalidatePath(`/school/students/${studentId}`);
    return { success: true, data: null, message: "Guardian Unlinked" };
}
