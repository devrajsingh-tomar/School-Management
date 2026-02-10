import CreateUserForm from "@/components/forms/create-user-form";
import { getSchoolUsers } from "@/lib/actions/user.actions";
import { getClasses } from "@/lib/actions/academic.actions";
import { IUser } from "@/lib/db/models/User";

export const dynamic = "force-dynamic";

export default async function SchoolUsersPage() {
    const users = await getSchoolUsers();
    const classes = await getClasses();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h2>
                <p className="mt-1 text-sm text-gray-500">Manage teachers, students, and staff for your school.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* List Section */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">All Users</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <li className="px-4 py-4 text-center text-gray-500 sm:px-6">No users found.</li>
                        ) : (
                            users.map((user: any) => (
                                <li key={user._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>

                                        <div className="ml-2 flex-shrink-0 flex">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Create Section */}
                <div>
                    <CreateUserForm classes={classes} />
                </div>
            </div>
        </div>
    );
}
