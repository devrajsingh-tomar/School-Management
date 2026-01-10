import { auth } from "@/auth";
import Link from "next/link";

export default async function StudentDashboard() {
    const session = await auth();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {session?.user.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/student/attendance" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-t-4 border-blue-500">
                    <h3 className="text-lg font-medium text-gray-900">My Attendance</h3>
                    <p className="text-sm text-gray-500 mt-1">Check your daily attendance records.</p>
                </Link>
                <Link href="/student/results" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-t-4 border-purple-500">
                    <h3 className="text-lg font-medium text-gray-900">Exam Results</h3>
                    <p className="text-sm text-gray-500 mt-1">View your grades and performance.</p>
                </Link>
                <Link href="/student/fees" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-t-4 border-green-500">
                    <h3 className="text-lg font-medium text-gray-900">Fee Status</h3>
                    <p className="text-sm text-gray-500 mt-1">Check paid and pending fees.</p>
                </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-8">
                <h4 className="text-blue-800 font-medium">Notice Board</h4>
                <p className="text-sm text-blue-600 mt-1">
                    Welcome to the new Student Portal. Please check your details and report any discrepancies to the class teacher.
                </p>
            </div>
        </div>
    );
}
