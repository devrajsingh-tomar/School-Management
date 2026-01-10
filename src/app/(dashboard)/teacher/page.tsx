import { auth } from "@/auth";
import { getClasses } from "@/lib/actions/academic.actions";
import Link from "next/link";

export default async function TeacherDashboard() {
    const session = await auth();
    const classes = await getClasses();

    // In a real app, we would filter `classes` by those assigned to this teacher (Section.classTeacher)
    // For MVP, we show all, but we could highlight ones they own.

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {session?.user.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/teacher/attendance" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-emerald-500">
                    <h3 className="text-lg font-medium text-gray-900">Attendance</h3>
                    <p className="text-sm text-gray-500 mt-1">Mark daily attendance for your sections.</p>
                </Link>
                <Link href="/teacher/exams" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-indigo-500">
                    <h3 className="text-lg font-medium text-gray-900">Exams & Results</h3>
                    <p className="text-sm text-gray-500 mt-1">Enter marks for completed exams.</p>
                </Link>
            </div>

            <h2 className="text-lg font-medium text-gray-900 mt-8">My Classes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls: any) => (
                    <div key={cls._id} className="bg-white p-4 rounded border shadow-sm">
                        <h4 className="font-bold text-gray-800">{cls.name}</h4>
                        <p className="text-xs text-gray-500 mt-2">Sections: {cls.sections?.map((s: any) => s.name).join(", ")}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
