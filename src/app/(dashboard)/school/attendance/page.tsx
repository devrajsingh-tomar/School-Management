import Link from "next/link";
import { getDailyAttendanceStats } from "@/lib/actions/attendance.actions";
import {
    CalendarCheck,
    Users,
    UserX,
    Clock,
    ArrowRight
} from "lucide-react";

export default async function AttendanceDashboard() {
    const today = new Date().toISOString().split("T")[0];
    const stats = await getDailyAttendanceStats(today) || [];

    const getCount = (status: string) => stats.find((s: any) => s._id === status)?.count || 0;
    const present = getCount("Present");
    const absent = getCount("Absent");
    const late = getCount("Late");

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Attendance Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DashboardCard icon={<CalendarCheck className="text-green-600" />} title="Present" value={present} color="bg-green-50" />
                <DashboardCard icon={<UserX className="text-red-600" />} title="Absent" value={absent} color="bg-red-50" />
                <DashboardCard icon={<Clock className="text-yellow-600" />} title="Late" value={late} color="bg-yellow-50" />
                <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-center items-center gap-2">
                    <Link href="/school/attendance/student" className="w-full">
                        <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 flex items-center justify-center gap-2">
                            Mark Attendance <ArrowRight size={16} />
                        </button>
                    </Link>
                    <Link href="/school/attendance/leaves" className="text-sm text-gray-500 hover:text-indigo-600 underline">
                        Manage Leaves
                    </Link>
                </div>
            </div>

            {/* Placeholder for Calendar View or Graph */}
            <div className="bg-white p-8 rounded-lg shadow min-h-[300px] flex items-center justify-center text-gray-400">
                Monthly Heatmap Visualization Coming Soon...
            </div>
        </div>
    );
}

function DashboardCard({ icon, title, value, color }: any) {
    return (
        <div className={`p-6 rounded-lg shadow ${color} flex items-center gap-4`}>
            <div className="bg-white p-3 rounded-full shadow-sm">{icon}</div>
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            </div>
        </div>
    )
}
