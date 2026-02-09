import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    Calendar,
    BookOpen,
    Trophy,
    Clock,
    ChevronRight,
    IndianRupee,
    Megaphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getStudentAttendance } from "@/lib/actions/attendance.actions";
import { getStudentHomework } from "@/lib/actions/homework.actions";
import { getStudentFees } from "@/lib/actions/finance.actions";
import { getStudentNotices } from "@/lib/actions/communication.actions";
import { getStudentResults } from "@/lib/actions/exam.actions";
import { formatDistanceToNow, isPast, format } from "date-fns";

export default async function StudentDashboard() {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
        redirect("/portal/login");
    }

    const studentId = session.user.linkedStudentId;
    const schoolId = session.user.schoolId;

    if (!studentId || !schoolId) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Loading dashboard failed. Missing student context.
            </div>
        );
    }

    // Parallel data fetching for performance
    const [attendanceData, homeworkList, feeData, notices, results] = await Promise.all([
        getStudentAttendance(studentId, schoolId),
        getStudentHomework(studentId, schoolId, 3), // Limit 3
        getStudentFees(studentId, schoolId),
        getStudentNotices(studentId, schoolId),
        getStudentResults(studentId, schoolId)
    ]);

    // Calculate dynamic stats
    const attendancePercentage = attendanceData.stats.total > 0
        ? Math.round((attendanceData.stats.present / attendanceData.stats.total) * 100)
        : 0;

    // Rank is harder to calculate efficiently on the fly without a dedicated rank job, 
    // but we can show latest grade or something from results.
    // For now, let's show "Last Grade" if available, or "N/A"
    const latestResult = results.length > 0 ? results[0] : null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Student Dashboard: {session.user.name} 👋
                </h1>
                <p className="text-slate-500 text-sm">
                    Here's your latest academic summary.
                </p>
            </div>

            {/* Dynamic Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Attendance"
                    value={`${attendancePercentage}%`}
                    description={`${attendanceData.stats.present}/${attendanceData.stats.total} Days Present`}
                    icon={<Calendar className="text-indigo-600" size={18} />}
                    color="bg-indigo-50"
                />
                <StatCard
                    title="Latest Result"
                    value={latestResult ? latestResult.grade : "N/A"}
                    description={latestResult ? `${latestResult.exam?.name} (${latestResult.percentage.toFixed(0)}%)` : "No results yet"}
                    icon={<Trophy className="text-amber-600" size={18} />}
                    color="bg-amber-50"
                />
                <StatCard
                    title="Assignments"
                    value={homeworkList.length.toString()}
                    description="Upcoming Tasks"
                    icon={<BookOpen className="text-violet-600" size={18} />}
                    color="bg-violet-50"
                    isAlert={homeworkList.length > 0}
                />
                <StatCard
                    title="Due Fees"
                    value={feeData.summary.balanceDue > 0 ? `₹${feeData.summary.balanceDue.toLocaleString()}` : "Settled"}
                    description={feeData.summary.balanceDue > 0 ? "Outstanding Payment" : "No Pending Dues"}
                    icon={<IndianRupee className={feeData.summary.balanceDue > 0 ? "text-red-600" : "text-emerald-600"} size={18} />}
                    color={feeData.summary.balanceDue > 0 ? "bg-red-50" : "bg-emerald-50"}
                    isAlert={feeData.summary.balanceDue > 0}
                />
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Upcoming Homework */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200 h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Upcoming Homework</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/portal/homework">View All <ChevronRight size={14} className="ml-1" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {homeworkList.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No upcoming homework! Time to relax. 🎉
                            </div>
                        ) : (
                            homeworkList.map((hw: any) => {
                                const isOverdue = isPast(new Date(hw.dueDate));
                                return (
                                    <div key={hw._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors hover:bg-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border shadow-sm">
                                                <BookOpen className="text-indigo-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 line-clamp-1">{hw.title}</p>
                                                <p className="text-xs text-slate-500 font-medium">{hw.subject} • Due {format(new Date(hw.dueDate), "dd/MM/yyyy")}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 text-[10px] font-bold rounded uppercase
                                            ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
                                        `}>
                                            {isOverdue ? 'Overdue' : 'Pending'}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Quick Notices */}
                <Card className="shadow-sm border-slate-200 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Notices</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <div className="space-y-4 flex-1">
                            {notices.length === 0 ? (
                                <div className="text-sm text-slate-500 italic pb-4 text-center">No new notices.</div>
                            ) : (
                                notices.slice(0, 3).map((notice: any) => (
                                    <div key={notice._id} className="pb-3 border-b last:border-0 border-dashed">
                                        <div className="flex items-start gap-2 mb-1">
                                            <Megaphone className="h-4 w-4 text-orange-500 mt-0.5" />
                                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{notice.title}</p>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 pl-6">{notice.content}</p>
                                        <p className="text-[10px] text-slate-400 pl-6 mt-1">
                                            {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <Button variant="outline" className="w-full text-xs font-bold mt-4" asChild>
                            <Link href="/portal/notices">Check Archive</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, description, icon, color, isAlert }: any) {
    return (
        <Card className="shadow-sm border-slate-200 overflow-hidden group hover:border-indigo-200 transition-colors">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
                        {icon}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    <h3 className={`text-2xl font-bold ${isAlert ? 'text-rose-600' : 'text-slate-900'}`}>{value}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
