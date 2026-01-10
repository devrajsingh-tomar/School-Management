
import CreateSchoolForm from "@/components/forms/create-school-form";
import { getSchools } from "@/lib/actions/school.actions";
import { ISchool } from "@/lib/db/models/School";

export default async function SchoolsPage() {
    const schools = await getSchools();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Schools Management</h2>
                <p className="mt-1 text-sm text-gray-500">Create and manage tenant schools.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* List Section */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Existing Schools</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {schools.length === 0 ? (
                            <li className="px-4 py-4 text-center text-gray-500 sm:px-6">No schools found.</li>
                        ) : (
                            schools.map((school: any) => (
                                <li key={school._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-indigo-600 truncate">{school.name}</p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${school.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {school.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                Slug: {school.slug}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <p>Plan: {school.subscriptionPlan}</p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Create Section */}
                <div>
                    <CreateSchoolForm />
                </div>
            </div>
        </div>
    );
}
