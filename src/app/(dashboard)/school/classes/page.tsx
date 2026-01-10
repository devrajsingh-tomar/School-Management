
import CreateClassForm from "@/components/forms/create-class-form";
import CreateSectionForm from "@/components/forms/create-section-form";
import { getClasses } from "@/lib/actions/academic.actions";

export default async function SchoolClassesPage() {
    const classes = await getClasses();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Classes & Sections</h2>
                <p className="mt-1 text-sm text-gray-500">Define the academic structure.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Create Class Column */}
                <div className="bg-white p-6 rounded-lg shadow h-fit">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Class</h3>
                    <CreateClassForm />
                </div>

                {/* List Classes Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Existing Classes</h3>

                    {classes.length === 0 ? (
                        <p className="text-gray-500 italic">No classes defined yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classes.map((cls: any) => (
                                <div key={cls._id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-xl font-bold text-gray-800">{cls.name}</h4>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sections</p>
                                        <div className="flex flex-wrap gap-2">
                                            {cls.sections && cls.sections.length > 0 ? (
                                                cls.sections.map((sec: any) => (
                                                    <span key={sec._id} className="inline-flex items-center px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800">
                                                        {sec.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400">No sections</span>
                                            )}
                                        </div>
                                        <div className="mt-3">
                                            <CreateSectionForm classId={cls._id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
