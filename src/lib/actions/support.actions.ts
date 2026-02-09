"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import SupportTicket, { ISupportTicket } from "@/lib/db/models/SupportTicket";
import "@/lib/db/models/School"; // Ensure School model is registered
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/actions/audit.actions";
import mongoose from "mongoose";

/**
 * Create a new support ticket
 */
export async function createSupportTicket(data: {
    subject: string;
    message: string;
    category: string;
    priority: string;
}) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    try {
        // Generate ticket number
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const count = await SupportTicket.countDocuments({
            ticketNumber: new RegExp(`^TKT-${dateStr}-`)
        });
        const ticketNumber = `TKT-${dateStr}-${String(count + 1).padStart(3, '0')}`;

        const ticketData: any = {
            ticketNumber,
            schoolId: session.user.schoolId ? new mongoose.Types.ObjectId(session.user.schoolId) : undefined,
            userId: new mongoose.Types.ObjectId(session.user.id),
            userName: session.user.name,
            userEmail: session.user.email,
            userRole: session.user.role,
            subject: data.subject,
            message: data.message,
            category: data.category,
            priority: data.priority,
            status: "open",
        };

        const ticket = await SupportTicket.create(ticketData);

        await logAction(
            session.user.id,
            "CREATE_SUPPORT_TICKET",
            "SUPPORT_TICKET",
            { ticketNumber: ticket.ticketNumber, subject: data.subject },
            ticket._id.toString()
        );

        revalidatePath("/school/support");
        revalidatePath("/superadmin/support");

        return {
            success: true,
            ticketId: ticket._id.toString(),
            ticketNumber: ticket.ticketNumber
        };
    } catch (error) {
        console.error("Create ticket error:", error);
        throw new Error("Failed to create support ticket");
    }
}

/**
 * Get user's own tickets
 */
export async function getMyTickets() {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    try {
        const tickets = await SupportTicket.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(tickets));
    } catch (error) {
        console.error("Get tickets error:", error);
        throw new Error("Failed to fetch tickets");
    }
}

/**
 * Get all tickets (SuperAdmin only)
 */
export async function getAllTickets(filters?: {
    schoolId?: string;
    status?: string;
    priority?: string;
    search?: string;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized - SuperAdmin only");
    }

    await connectDB();

    try {
        const query: any = {};

        if (filters?.schoolId) {
            query.schoolId = filters.schoolId;
        }

        if (filters?.status && filters.status !== "all") {
            query.status = filters.status;
        }

        if (filters?.priority && filters.priority !== "all") {
            query.priority = filters.priority;
        }

        if (filters?.search) {
            query.$or = [
                { ticketNumber: new RegExp(filters.search, 'i') },
                { subject: new RegExp(filters.search, 'i') },
            ];
        }

        const tickets = await SupportTicket.find(query)
            .populate('schoolId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // Explicitly map _id to string to avoid serialization issues
        return tickets.map((t: any) => ({
            ...t,
            _id: t._id.toString(),
            schoolId: t.schoolId ? {
                ...t.schoolId,
                _id: t.schoolId._id?.toString()
            } : null
        }));
    } catch (error) {
        console.error("Get all tickets error:", error);
        throw new Error("Failed to fetch tickets");
    }
}

/**
 * Get single ticket by ID
 */
export async function getTicket(ticketId: string) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    try {
        console.log("Fetching ticket:", ticketId);

        // Validate ObjectId first
        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            console.error("Invalid ticket ID format:", ticketId);
            throw new Error("Invalid ticket ID");
        }

        const ticket = await SupportTicket.findById(ticketId)
            .populate('schoolId', 'name')
            .lean();

        if (!ticket) {
            console.error("Ticket found found in DB for ID:", ticketId);
            throw new Error(`Ticket not found for ID: ${ticketId}`);
        }

        // Check permissions
        if (session.user.role !== "SUPER_ADMIN") {
            if (ticket.userId.toString() !== session.user.id) {
                throw new Error("Unauthorized - You can only view your own tickets");
            }
        }

        return JSON.parse(JSON.stringify(ticket));
    } catch (error: any) {
        console.error("Get ticket error:", error);
        throw new Error(error.message || "Failed to fetch ticket");
    }
}

/**
 * Add reply to ticket
 */
export async function addTicketReply(ticketId: string, message: string) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    try {
        const ticket = await SupportTicket.findById(ticketId);

        if (!ticket) {
            throw new Error("Ticket not found");
        }

        // Check permissions
        if (session.user.role !== "SUPER_ADMIN") {
            if (ticket.userId.toString() !== session.user.id) {
                throw new Error("Unauthorized");
            }
        }

        const reply = {
            userId: new mongoose.Types.ObjectId(session.user.id),
            userName: session.user.name || "Unknown",
            userRole: session.user.role || "USER",
            message,
            isAdminReply: session.user.role === "SUPER_ADMIN",
            createdAt: new Date(),
        };

        ticket.replies.push(reply as any);
        ticket.lastReplyAt = new Date();
        await ticket.save();

        await logAction(
            session.user.id,
            "REPLY_SUPPORT_TICKET",
            "SUPPORT_TICKET",
            { ticketNumber: ticket.ticketNumber },
            ticket._id.toString()
        );

        revalidatePath(`/school/support/${ticketId}`);
        revalidatePath(`/superadmin/support/${ticketId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Add reply error:", error);
        throw new Error(error.message || "Failed to add reply");
    }
}

/**
 * Update ticket status (SuperAdmin only)
 */
export async function updateTicketStatus(ticketId: string, status: string) {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized - SuperAdmin only");
    }

    await connectDB();

    try {
        const ticket = await SupportTicket.findByIdAndUpdate(
            ticketId,
            { status },
            { new: true }
        );

        if (!ticket) {
            throw new Error("Ticket not found");
        }

        await logAction(
            session.user.id,
            "UPDATE_TICKET_STATUS",
            "SUPPORT_TICKET",
            { ticketNumber: ticket.ticketNumber, status },
            ticket._id.toString()
        );

        revalidatePath("/superadmin/support");
        revalidatePath(`/superadmin/support/${ticketId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Update status error:", error);
        throw new Error(error.message || "Failed to update ticket status");
    }
}

/**
 * Get ticket statistics (SuperAdmin only)
 */
export async function getTicketStats() {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized - SuperAdmin only");
    }

    await connectDB();

    try {
        const [total, open, inProgress, closed] = await Promise.all([
            SupportTicket.countDocuments(),
            SupportTicket.countDocuments({ status: "open" }),
            SupportTicket.countDocuments({ status: "in_progress" }),
            SupportTicket.countDocuments({ status: "closed" }),
        ]);

        return { total, open, inProgress, closed };
    } catch (error) {
        console.error("Get stats error:", error);
        throw new Error("Failed to fetch ticket statistics");
    }
}
