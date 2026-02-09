import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import StudentCategory from "@/lib/db/models/StudentCategory";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.schoolId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    try {
        const categories = await StudentCategory.find({ school: session.user.schoolId })
            .sort({ name: 1 })
            .lean();
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
