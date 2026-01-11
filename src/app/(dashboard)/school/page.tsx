import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardStats, getAttendanceTrends } from "@/lib/actions/reports.actions";
import { connectDB } from "@/lib/db/connect";
import { AttendanceChart } from "@/components/reports/charts";
import { Users, GraduationCap, DollarSign, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.schoolId) redirect("/login");

    await connectDB();
    const [statsRes, attendanceRes] = await Promise.all([
        getDashboardStats(session.user.schoolId),
        getAttendanceTrends(session.user.schoolId)
    ]);

    const stats = statsRes.success ? statsRes.data : { studentCount: 0, teacherCount: 0 };
    const attendanceData = attendanceRes.success ? attendanceRes.data : [];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader title="Dashboard" description="Overview of school metrics and activities.">
                <Button asChild>
                    <Link href="/school/students/new">Add Student</Link>
                </Button>
            </PageHeader>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.studentCount}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.teacherCount}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fees Collected</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹45,231.89</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">+201 since last hour</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Attendance Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <AttendanceChart data={attendanceData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            You have 265 recent events.
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Mock Activity List */}
                            <div className="flex items-center">
                                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">JD</span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">John Doe</p>
                                    <p className="text-sm text-muted-foreground">Paid school fees</p>
                                </div>
                                <div className="ml-auto font-medium">+₹1,999.00</div>
                            </div>
                            <div className="flex items-center">
                                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">MS</span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Maria Smith</p>
                                    <p className="text-sm text-muted-foreground">Applied for leave</p>
                                </div>
                                <div className="ml-auto font-medium text-orange-500">Pending</div>
                            </div>
                            <div className="flex items-center">
                                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">RJ</span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Rahul Jain</p>
                                    <p className="text-sm text-muted-foreground">Marked absent</p>
                                </div>
                                <div className="ml-auto font-medium text-red-500">Absent</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
