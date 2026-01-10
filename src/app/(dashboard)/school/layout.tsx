import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SchoolAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Allow SCHOOL_ADMIN and PRINCIPAL (could be refined)
    const allowedRoles = ["SCHOOL_ADMIN", "PRINCIPAL"];
    if (!session?.user || !allowedRoles.includes(session.user.role)) {
        redirect("/dashboard");
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-indigo-600">School Admin</h1>
                    <p className="text-xs text-gray-500 mt-1">{session.user.schoolId}</p>
                </div>
                <nav className="mt-6">
                    <Link
                        href="/school"
                        className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                    >
                        Overview
                    </Link>
                    <Link
                        href="/school/admissions"
                        className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                    >
                        Admissions
                        <Link
                            href="/school/users"
                            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                        >
                            Users (Staff/Students)
                        </Link>
                        <Link
                            href="/school/classes"
                            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                        >
                            Classes
                        </Link>
                        <Link
                            href="/school/attendance"
                            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                        >
                            Attendance
                        </Link>
                        <Link
                            href="/school/exams"
                            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                        >
                            Exams
                        </Link>
                        <Link
                            href="/school/finance"
                            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                        >
                            Finance
                        </Link>
                        <Link
                            href="/school/audit-logs"
                            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                        >
                            Audit Logs
                        </Link>
                        <Link
                            href="/school/setup"
                            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                        >
                            Master Setup
                        </Link>
                        <Link
                            href="/dashboard"
                            className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                        >
                            Back to Dashboard
                        </Link>
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    );
}
