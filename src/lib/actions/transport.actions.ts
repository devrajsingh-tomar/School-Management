"use server";

import { z } from "zod";
import TransportRoute from "@/lib/db/models/TransportRoute";
import Student from "@/lib/db/models/Student";
import connectDB from "@/lib/db/connect";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createTransportRoute(formData: FormData) {
    const session = await auth();
    if (!session?.user?.schoolId) return { message: "Unauthorized" };

    const name = formData.get("name") as string;
    const vehicleNumber = formData.get("vehicleNumber") as string;
    const driverName = formData.get("driverName") as string;
    const driverPhone = formData.get("driverPhone") as string;
    const monthlyCost = Number(formData.get("monthlyCost"));

    const stopsJson = formData.get("stops") as string;
    const stops = stopsJson ? JSON.parse(stopsJson) : [];

    await connectDB();
    await TransportRoute.create({
        school: session.user.schoolId,
        name,
        vehicleNumber,
        driverName,
        driverPhone,
        monthlyCost,
        stops
    });

    revalidatePath("/school/transport");
    return { message: "Route Created" };
}

export async function getRoutes() {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const routes = await TransportRoute.find({ school: session.user.schoolId }).lean();
    return JSON.parse(JSON.stringify(routes));
}

export async function assignTransport(studentId: string, routeId: string, stop: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return;

    await connectDB();
    await Student.findByIdAndUpdate(studentId, {
        transportRoute: routeId,
        transportStop: stop
    });

    revalidatePath("/school/transport/allocation");
}

export async function getStudentsOnRoute(routeId: string) {
    const session = await auth();
    if (!session?.user?.schoolId) return [];

    await connectDB();
    const students = await Student.find({ transportRoute: routeId })
        .select("firstName lastName admissionNumber class transportStop phone")
        .populate("class", "name")
        .lean();

    return JSON.parse(JSON.stringify(students));
}
