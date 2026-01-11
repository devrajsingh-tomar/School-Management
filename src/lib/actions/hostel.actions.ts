"use server";

import { connectDB } from "@/lib/db/connect";
import Hostel from "@/lib/db/models/Hostel";
import Room from "@/lib/db/models/Room";
import HostelAllocation from "@/lib/db/models/HostelAllocation";
import { revalidatePath } from "next/cache";

// --- Hostel Actions ---

export async function createHostel(data: {
    schoolId: string;
    name: string;
    type: "Boys" | "Girls" | "Co-ed";
    capacity: number;
    address?: string;
}) {
    try {
        await connectDB();
        const newHostel = await Hostel.create({
            school: data.schoolId,
            ...data,
        });
        revalidatePath("/school/hostel");
        return { success: true, data: JSON.parse(JSON.stringify(newHostel)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getHostels(schoolId: string) {
    try {
        await connectDB();
        const hostels = await Hostel.find({ school: schoolId }).sort({ name: 1 });
        return { success: true, data: JSON.parse(JSON.stringify(hostels)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Room Actions ---

export async function createRoom(data: {
    schoolId: string;
    hostelId: string;
    roomNumber: string;
    capacity: number;
    type: "AC" | "Non-AC";
}) {
    try {
        await connectDB();

        // Check uniqueness
        const existing = await Room.findOne({ school: data.schoolId, hostel: data.hostelId, roomNumber: data.roomNumber });
        if (existing) return { success: false, error: "Room number already exists in this hostel" };

        const newRoom = await Room.create({
            school: data.schoolId,
            hostel: data.hostelId,
            roomNumber: data.roomNumber,
            capacity: data.capacity,
            type: data.type,
        });
        revalidatePath("/school/hostel");
        return { success: true, data: JSON.parse(JSON.stringify(newRoom)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRooms(hostelId: string) {
    try {
        await connectDB();
        const rooms = await Room.find({ hostel: hostelId }).sort({ roomNumber: 1 });
        return { success: true, data: JSON.parse(JSON.stringify(rooms)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Allocation Actions ---

export async function allocateRoom(data: {
    schoolId: string;
    studentId: string;
    roomId: string;
}) {
    try {
        await connectDB();

        const room = await Room.findById(data.roomId);
        if (!room) return { success: false, error: "Room not found" };

        if (room.occupied >= room.capacity) {
            return { success: false, error: "Room is full" };
        }

        // Check if student already has active allocation
        const existing = await HostelAllocation.findOne({
            student: data.studentId,
            status: "Active"
        });
        if (existing) return { success: false, error: "Student already allocated to a room" };

        // Create Allocation
        const allocation = await HostelAllocation.create({
            school: data.schoolId,
            hostel: room.hostel,
            room: data.roomId,
            student: data.studentId,
        });

        // Update Room Occupancy
        room.occupied += 1;
        await room.save();

        revalidatePath("/school/hostel");
        return { success: true, data: JSON.parse(JSON.stringify(allocation)) };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAllocations(schoolId: string) {
    try {
        await connectDB();
        const allocations = await HostelAllocation.find({ school: schoolId, status: "Active" })
            .populate("student", "name rollNumber class section") // Assuming Student model populate
            .populate("hostel", "name")
            .populate("room", "roomNumber")
            .sort({ allocatedDate: -1 });
        return { success: true, data: JSON.parse(JSON.stringify(allocations)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function vacateRoom(allocationId: string) {
    try {
        await connectDB();
        const allocation = await HostelAllocation.findById(allocationId);
        if (!allocation) return { success: false, error: "Allocation not found" };
        if (allocation.status === "Vacated") return { success: false, error: "Already vacated" };

        allocation.status = "Vacated";
        allocation.vacatedDate = new Date();
        await allocation.save();

        await Room.findByIdAndUpdate(allocation.room, {
            $inc: { occupied: -1 }
        });

        revalidatePath("/school/hostel");
        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
