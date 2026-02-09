import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, isSameDay } from "date-fns";
import { getStudentAttendance } from "@/lib/actions/attendance.actions";

export default async function AttendancePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/school/login");
    }

    const studentId = session.user.linkedStudentId;
    const schoolId = session.user.schoolId;

    if (!studentId || !schoolId) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Unable to load attendance. Missing student or school information.
            </div>
        );
    }

    const { records, stats } = await getStudentAttendance(studentId, schoolId);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-emerald-500" />
                        Recent Attendance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {records.length === 0 ? (
                        <div className="min-h-[150px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed border-2 rounded-lg">
                            No attendance records found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {records.map((record: any) => (
                                <div key={record._id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold
                                            ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                    record.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }
                                        `}>
                                            {record.status.substring(0, 1)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {format(new Date(record.date), "EEEE, MMMM d, yyyy")}
                                            </p>
                                            <p className="text-sm text-gray-500">{record.status}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border
                                         ${record.status === 'Present' ? 'bg-green-50 text-green-700 border-green-200' :
                                            record.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' :
                                                record.status === 'Late' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    'bg-gray-50 text-gray-700 border-gray-200'
                                        }
                                    `}>
                                        {record.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
