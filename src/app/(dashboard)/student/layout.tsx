
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "STUDENT") {
        redirect("/dashboard");
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-blue-600">Student Portal</h1>
                    <p className="text-xs text-gray-500 mt-1">{session.user.name}</p>
                </div>
                <nav className="mt-6 flex-1 px-4 space-y-2">
                    <Link
                        href="/student"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium rounded-md"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/student/attendance"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium rounded-md"
                    >
                        My Attendance
                    </Link>
                    <Link
                        href="/student/results"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium rounded-md"
                    >
                        Exam Results
                    </Link>
                    <Link
                        href="/student/fees"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium rounded-md"
                    >
                        My Fees
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <Link href="/api/auth/signout" className="text-sm text-red-600 hover:text-red-800">
                        Sign Out
                    </Link>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    );
}
