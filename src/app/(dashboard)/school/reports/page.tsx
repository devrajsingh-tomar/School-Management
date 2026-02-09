import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceChart, GenderChart, PerformanceChart } from "@/components/reports/charts";
import { ReportDownloader } from "@/components/reports/report-downloader";
import { StudentStrengthTable, FeeCollectionSummary } from "@/components/reports/detailed-reports";
import {
    getAttendanceTrends,
    getDashboardStats,
    getGenderDistribution,
    getFinanceStats,
    getExamPerformanceStats,
    getStudentStrengthReport,
    getFeeCollectionReport
} from "@/lib/actions/reports.actions";
import connectDB from "@/lib/db/connect";

export default async function ReportsPage() {
    const session = await auth();
    if (!session?.user || !session.user.schoolId) redirect("/login");

    await connectDB();

    const [
        statsRes,
        genderRes,
        attendanceRes,
        financeRes,
        performanceRes,
        strengthRes,
        feeReportRes
    ] = await Promise.all([
        getDashboardStats(session.user.schoolId),
        getGenderDistribution(session.user.schoolId),
        getAttendanceTrends(session.user.schoolId),
        getFinanceStats(session.user.schoolId),
        getExamPerformanceStats(session.user.schoolId),
        getStudentStrengthReport(session.user.schoolId),
        getFeeCollectionReport(session.user.schoolId)
    ]);

    const stats = (statsRes.success && statsRes.data) ? statsRes.data : { studentCount: 0, teacherCount: 0, parentCount: 0 };
    const genderData = (genderRes.success && genderRes.data) ? genderRes.data : [];
    const attendanceData = (attendanceRes.success && attendanceRes.data) ? attendanceRes.data : [];
    const financeData = (financeRes.success && financeRes.data) ? financeRes.data : { income: 0, expenses: 0, pendingFees: 0 };
    const performanceData = (performanceRes.success && performanceRes.data) ? performanceRes.data : [];
    const strengthData = (strengthRes.success && strengthRes.data) ? strengthRes.data : [];
    const feeReportData = (feeReportRes.success && feeReportRes.data) ? feeReportRes.data : [];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
                    <TabsTrigger value="downloads">Downloads</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold text-gray-500 uppercase">Total Students</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-3xl font-black">{stats.studentCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold text-gray-500 uppercase">Total Teachers</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-3xl font-black">{stats.teacherCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold text-gray-500 uppercase">Income YTD</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-3xl font-black text-green-600">₹{financeData.income.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold text-gray-500 uppercase">Unpaid Fees</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-3xl font-black text-red-600">₹{financeData.pendingFees.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 shadow-sm border-gray-100">
                            <CardHeader>
                                <CardTitle>Attendance Trends</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <AttendanceChart data={attendanceData} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 shadow-sm border-gray-100">
                            <CardHeader>
                                <CardTitle>Gender Split</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GenderChart data={genderData} />
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="shadow-sm border-gray-100">
                        <CardHeader>
                            <CardTitle>Academic Performance Trends</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <PerformanceChart data={performanceData} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="lg:col-span-2 shadow-sm border-gray-100">
                            <CardHeader>
                                <CardTitle>Class-wise Strength Report</CardTitle>
                                <CardDescription>Detailed breakdown of students across classes.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StudentStrengthTable data={strengthData} />
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-green-100 bg-green-50/20">
                            <CardHeader>
                                <CardTitle>Fee Collection (Last 30 Days)</CardTitle>
                                <CardDescription>Recent financial transactions and total collection.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FeeCollectionSummary data={feeReportData} />
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
