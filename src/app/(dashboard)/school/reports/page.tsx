import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceChart, GenderChart, PerformanceChart } from "@/components/reports/charts";
import { ReportDownloader } from "@/components/reports/report-downloader";
import { getAttendanceTrends, getDashboardStats, getGenderDistribution, getFinanceStats, getExamPerformanceStats } from "@/lib/actions/reports.actions";
import connectDB from "@/lib/db/connect";

export default async function ReportsPage() {
    const session = await auth();
    if (!session?.user || !session.user.schoolId) redirect("/login");

    await connectDB();

    const [statsRes, genderRes, attendanceRes, financeRes, performanceRes] = await Promise.all([
        getDashboardStats(session.user.schoolId),
        getGenderDistribution(session.user.schoolId),
        getAttendanceTrends(session.user.schoolId),
        getFinanceStats(session.user.schoolId),
        getExamPerformanceStats(session.user.schoolId),
    ]);

    const stats = (statsRes.success && statsRes.data) ? statsRes.data : { studentCount: 0, teacherCount: 0, parentCount: 0 };
    const genderData = (genderRes.success && genderRes.data) ? genderRes.data : [];
    const attendanceData = (attendanceRes.success && attendanceRes.data) ? attendanceRes.data : [];
    const financeData = (financeRes.success && financeRes.data) ? financeRes.data : { income: 0, expenses: 0, pendingFees: 0 };
    const performanceData = (performanceRes.success && performanceRes.data) ? performanceRes.data : [];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="downloads">Downloads</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.studentCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.teacherCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Income YTD</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{financeData.income}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Expenses YTD</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{financeData.expenses}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Attendance Trends (Last 7 Days)</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <AttendanceChart data={attendanceData} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Gender Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GenderChart data={genderData} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-1">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Exam Performance Trends (Avg %)</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <PerformanceChart data={performanceData} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="downloads" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Reports</CardTitle>
                            <CardDescription>
                                Download detailed PDF reports for offline usage.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ReportDownloader key="students" schoolName="My School" type="Students" />
                                <ReportDownloader key="finance" schoolName="My School" type="Finance" />
                                <ReportDownloader key="attendance" schoolName="My School" type="Attendance" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
