import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (session?.user?.role !== "SUPER_ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-indigo-600">SaaS Admin</h1>
                </div>
                <nav className="mt-6">
                    <Link
                        href="/admin/schools"
                        className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                    >
                        Schools
                    </Link>
                    <Link
                        href="/admin/users"
                        className="block px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-medium"
                    >
                        Users
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
