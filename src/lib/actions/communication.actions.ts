"use server";

import connectDB from "@/lib/db/connect";
import Announcement from "@/lib/db/models/Announcement";
import MessageLog from "@/lib/db/models/MessageLog";
import Class from "@/lib/db/models/Class";
import User from "@/lib/db/models/User";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function createAnnouncement(data: {
    schoolId: string;
    authorId: string;
    title: string;
    content: string;
    type: "Notice" | "Announcement" | "Message";
    audience: "School" | "Class" | "Staff" | "Student" | "Parent";
    targetClass?: string;
}) {
    try {
        await connectDB();
        const newAnnouncement = await Announcement.create({
            school: data.schoolId,
            author: data.authorId,
            title: data.title,
            content: data.content,
            type: data.type,
            audience: data.audience,
            targetClass: data.targetClass,
            channel: "App", // Default to App for this action
        });

        revalidatePath("/school/communication");
        return { success: true, data: JSON.parse(JSON.stringify(newAnnouncement)) };
    } catch (error: any) {
        console.error("Error creating announcement:", error);
        return { success: false, error: error.message };
    }
}

export async function getAnnouncements(schoolId: string) {
    try {
        await connectDB();
        const announcements = await Announcement.find({ school: schoolId })
            .populate("targetClass", "name")
            .populate("author", "name")
            .sort({ createdAt: -1 });
        return { success: true, data: JSON.parse(JSON.stringify(announcements)) };
    } catch (error: any) {
        console.error("Error fetching announcements:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAnnouncement(id: string) {
    try {
        await connectDB();
        await Announcement.findByIdAndDelete(id);
        revalidatePath("/school/communication");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting announcement:", error);
        return { success: false, error: error.message };
    }
}

export async function sendBulkMessage(data: {
    schoolId: string;
    authorId: string;
    content: string;
    audience: "Class" | "Staff" | "Student" | "Parent"; // Simplified for bulk
    channel: "SMS" | "WhatsApp";
    targetClass?: string;
}) {
    try {
        await connectDB();

        // 1. Identify recipients
        let recipients: any[] = [];

        if (data.audience === "Class" && data.targetClass) {
            // For "Class" audience, we might be sending to Students or Parents OF that class.
            // But the UI might just say "Class-wise message".
            // Let's assume Class-wise message targets Students in that class for now, 
            // or maybe we need to be more specific. 
            // For simplified "placeholder" logic:
            // Get all users in the class.
            const students = await User.find({ class: data.targetClass, role: "Student" });
            recipients = students.map(s => ({ name: s.name, phone: "123-456-7890", id: s._id }));
        } else if (data.audience === "Staff") {
            const staff = await User.find({ school: data.schoolId, role: { $in: ["Teacher", "Admin", "Accountant"] } });
            recipients = staff.map(s => ({ name: s.name, phone: "123-456-7890", id: s._id }));
        } else if (data.audience === "Student") {
            const students = await User.find({ school: data.schoolId, role: "Student" });
            recipients = students.map(s => ({ name: s.name, phone: "123-456-7890", id: s._id }));
        } else if (data.audience === "Parent") {
            const parents = await User.find({ school: data.schoolId, role: "Parent" });
            recipients = parents.map(s => ({ name: s.name, phone: "123-456-7890", id: s._id }));
        }

        // If no real recipients found (or for testing), let's just make a dummy one if empty
        if (recipients.length === 0) {
            recipients.push({ name: "Test Recipient", phone: "000-000-0000" });
        }

        // 2. Create MessageLogs (Mock sending)
        const logPromises = recipients.map(recipient => {
            return MessageLog.create({
                school: data.schoolId,
                recipient: recipient.name,
                channel: data.channel,
                content: data.content,
                status: "Sent", // Mock success
            });
        });

        await Promise.all(logPromises);

        revalidatePath("/school/communication");
        return { success: true, count: recipients.length };

    } catch (error: any) {
        console.error("Error sending bulk message:", error);
        return { success: false, error: error.message };
    }
}

export async function getMessageLogs(schoolId: string) {
    try {
        await connectDB();
        const logs = await MessageLog.find({ school: schoolId }).sort({ sentAt: -1 }).limit(100);
        return { success: true, data: JSON.parse(JSON.stringify(logs)) };
    } catch (error: any) {
        console.error("Error fetching message logs:", error);
        return { success: false, error: error.message };
    }
}

export async function getStudentNotices(studentId: string, schoolId: string) {
    console.log("STUDENT PORTAL QUERY: getStudentNotices", { schoolId, studentId });
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(schoolId)) {
        console.error("Invalid IDs provided to getStudentNotices", { studentId, schoolId });
        return [];
    }

    try {
        // Need student class for "Class" audience
        const StudentModel = mongoose.models.Student;
        const student = await StudentModel.findById(studentId).select("class").lean();

        if (!student) return [];

        const notices = await Announcement.find({
            school: schoolId,
            $or: [
                { audience: "School" },
                { audience: "Student" }, // "Student" audience in Announcement means "All Students" or specific? 
                // Usually "Student" audience means "All Students". Specific targeting uses different mechanism typically.
                // Assuming "Student" means all students.
                { audience: "Class", targetClass: student.class }
            ]
        })
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(notices));
    } catch (error) {
        console.error("Error fetching student notices:", error);
        return [];
    }
}
