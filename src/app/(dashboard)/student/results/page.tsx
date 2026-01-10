
import { auth } from "@/auth";
import { getStudentResults } from "@/lib/actions/exam.actions";

export default async function StudentResultsPage() {
    const session = await auth();
    if (!session?.user) return null;

    const results = await getStudentResults(session.user.id);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Exam Results</h1>

            {results.length === 0 ? (
                <p className="text-gray-500 italic">No results released yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((res: any) => (
                        <div key={res._id} className="bg-white p-4 rounded shadow border-l-4 border-indigo-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{res.exam?.name}</h3>
                                    <p className="text-sm text-gray-500">{new Date(res.exam?.date).toLocaleDateString()}</p>
                                    <p className="text-sm mt-1">{res.exam?.subject?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-indigo-600">{res.marksObtained} <span className="text-sm text-gray-400">/ {res.exam?.maxMarks}</span></p>
                                    {res.grade && <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-1">Grade: {res.grade}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
