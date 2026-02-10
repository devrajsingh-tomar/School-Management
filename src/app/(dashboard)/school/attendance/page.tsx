import Link from "next/link";
import { getDailyAttendanceStats } from "@/lib/actions/attendance.actions";
import {
    CalendarCheck,
    UserX,
    Clock,
    ArrowRight
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AttendanceDashboard() {
    const today = new Date().toISOString().split("T")[0];
    const stats = await getDailyAttendanceStats(today) || [];

    const getCount = (status: string) => stats.find((s: any) => s._id === status)?.count || 0;
    const present = getCount("Present");
    const absent = getCount("Absent");
    const late = getCount("Late");

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader title="Attendance Dashboard" description={`Overview for ${today}.`}>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/school/attendance/leaves">Manage Leaves</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/school/attendance/student">
                            Mark Attendance <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{present}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{absent}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{late}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="min-h-[300px] flex items-center justify-center bg-gray-50/50 border-dashed">
                <div className="text-center">
                    <p className="text-muted-foreground mb-2">Detailed Monthly Heatmap Visualization</p>
                    <Button variant="secondary" size="sm" disabled>Coming Soon</Button>
                </div>
            </Card>
        </div>
    );
}
