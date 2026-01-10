import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth"; // Use auth helper if needed, or form action

export default async function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "TEACHER") {
        // Basic protection. 
        // Principals might want to view this view too? 
        // For now strict separation.
        redirect("/dashboard");
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-emerald-600">Teacher Portal</h1>
                    <p className="text-xs text-gray-500 mt-1">{session.user.name}</p>
                </div>
                <nav className="mt-6 flex-1 px-4 space-y-2">
                    <Link
                        href="/teacher"
                        className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium rounded-md"
                    >
                        My Classes
                    </Link>
                    <Link
                        href="/teacher/attendance"
                        className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium rounded-md"
                    >
                        Take Attendance
                    </Link>
                    <Link
                        href="/teacher/exams"
                        className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium rounded-md"
                    >
                        exam Results
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
