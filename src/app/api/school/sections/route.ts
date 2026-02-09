import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Section from "@/lib/db/models/Section";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.schoolId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
        return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    await connectDB();
    try {
        const sections = await Section.find({
            school: session.user.schoolId,
            class: classId
        }).sort({ name: 1 }).lean();
        return NextResponse.json(sections);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
