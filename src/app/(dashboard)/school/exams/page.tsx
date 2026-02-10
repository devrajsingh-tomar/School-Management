import { getExams } from "@/lib/actions/exam.actions";
import Link from "next/link";
import { Plus, Eye, Edit3, ClipboardList } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
    const exams = await getExams();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Examinations</h1>
                <Link href="/school/exams/create">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                        <Plus size={18} /> Create New Exam
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {exams.length === 0 ? (
                    <div className="p-12 bg-white rounded-lg shadow text-center text-gray-500">
                        No exams scheduled.
                    </div>
                ) : (
                    exams.map((exam: any) => (
                        <div key={exam._id} className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{exam.name}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    <span className="font-semibold text-gray-700">{exam.class?.name}</span> • {exam.type} • {format(new Date(exam.startDate), "dd/MM/yyyy")}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {exam.subjects.map((sub: any, i: number) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border">
                                            {sub.name} ({sub.maxMarks})
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/school/exams/${exam._id}/marks`}>
                                    <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium">
                                        <Edit3 size={16} /> Mark Entry
                                    </button>
                                </Link>
                                <Link href={`/school/exams/${exam._id}/results`}>
                                    <button className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 font-medium">
                                        <ClipboardList size={16} /> Results
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
