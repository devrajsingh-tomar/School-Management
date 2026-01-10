
import { auth } from "@/auth";
import Link from "next/link";
import { getSchoolUsers } from "@/lib/actions/user.actions";

export default async function SchoolDashboardPage() {
    const session = await auth();
    const users = await getSchoolUsers();

    const stats = {
        users: users.length,
        teachers: users.filter((u: any) => u.role === "TEACHER").length,
        students: users.filter((u: any) => u.role === "STUDENT").length,
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">School Overview</h1>
            <p>Welcome, {session?.user.name}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users}</p>
                    <Link href="/school/users" className="text-sm text-indigo-600 hover:text-indigo-500 mt-4 block">View details &rarr;</Link>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Teachers</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.teachers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Students</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.students}</p>
                </div>
            </div>
        </div>
    );
}
