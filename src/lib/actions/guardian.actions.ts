"use server";

import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Guardian from "@/lib/db/models/Guardian";
import { logAction } from "@/lib/actions/audit.actions";
import { guardianSchema } from "@/lib/validators/student";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createGuardian(data: z.infer<typeof guardianSchema>) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    const validated = guardianSchema.parse(data);
    await connectDB();

    const guardian = await Guardian.create({
        ...validated,
        school: session.user.schoolId,
    });

    await logAction(
        session.user.id,
        "CREATE_GUARDIAN",
        "GUARDIAN",
        { name: `${guardian.firstName} ${guardian.lastName}`, id: guardian._id },
        session.user.schoolId
    );

    return JSON.parse(JSON.stringify(guardian));
}

export async function searchGuardians(query: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const searchRegex = new RegExp(query, "i");

    const guardians = await Guardian.find({
        school: session.user.schoolId,
        $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { phone: searchRegex },
            { email: searchRegex },
        ],
    })
        .limit(10)
        .lean();

    return JSON.parse(JSON.stringify(guardians));
}

export async function updateGuardian(id: string, data: Partial<z.infer<typeof guardianSchema>>) {
    const session = await auth();
    if (!session || !session.user || !session.user.schoolId) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const guardian = await Guardian.findOneAndUpdate(
        { _id: id, school: session.user.schoolId },
        data,
        { new: true }
    );

    if (!guardian) throw new Error("Guardian not found");

    await logAction(
        session.user.id,
        "UPDATE_GUARDIAN",
        "GUARDIAN",
        { id, changes: data },
        session.user.schoolId
    );

    return JSON.parse(JSON.stringify(guardian));
}
