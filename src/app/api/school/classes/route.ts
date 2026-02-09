import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import Class from "@/lib/db/models/Class";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.schoolId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    try {
        const classes = await Class.find({ school: session.user.schoolId })
            .sort({ name: 1 })
            .lean();
        return NextResponse.json(classes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
