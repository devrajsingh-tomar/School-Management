
import CreateSessionForm from "@/components/forms/create-session-form";
import CreateHouseForm from "@/components/forms/create-house-form";
import CreateCategoryForm from "@/components/forms/create-category-form";
import { getSessions, getHouses, getCategories } from "@/lib/actions/master.actions";

export default async function SchoolSetupPage() {
    const sessions = await getSessions();
    const houses = await getHouses();
    const categories = await getCategories();

    return (
        <div className="space-y-10 pb-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">School Master Setup</h2>
                <p className="mt-1 text-sm text-gray-500">Configure core school data: Sessions, Houses, and Categories.</p>
            </div>

            {/* Sessions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <CreateSessionForm />
                </div>
                <div className="bg-white p-6 rounded shadow max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Sessions</h3>
                    <ul className="divide-y divide-gray-200">
                        {sessions.map((s: any) => (
                            <li key={s._id} className="py-2 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">{s.name}</p>
                                    <p className="text-xs text-gray-500">{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</p>
                                </div>
                                {s.isCurrent && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Current</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-200 my-8"></div>

            {/* Houses & Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Houses */}
                <div className="space-y-4">
                    <CreateHouseForm />
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Houses</h3>
                        <ul className="grid grid-cols-2 gap-2">
                            {houses.map((h: any) => (
                                <li key={h._id} className="flex items-center space-x-2 border p-2 rounded">
                                    {h.color && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: h.color }}></div>}
                                    <span className="text-sm font-medium">{h.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    <CreateCategoryForm />
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Student Categories</h3>
                        <ul className="flex flex-wrap gap-2">
                            {categories.map((c: any) => (
                                <li key={c._id} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 font-medium">
                                    {c.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    );
}
