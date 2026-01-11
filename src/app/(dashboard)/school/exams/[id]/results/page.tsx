import { getExamById, getMarksForExam, publishExamResults } from "@/lib/actions/exam.actions";
import Link from "next/link";
import { Lock, FileText, CheckCircle, BarChart } from "lucide-react";

export default async function ExamResultsPage({ params }: { params: { id: string } }) {
    const exam = await getExamById(params.id);
    const results = await getMarksForExam(params.id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Results: {exam.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>Class {exam.class.name}</span>
                        <span>•</span>
                        <span>{results.length} Students Graded</span>
                        <span>•</span>
                        <Link href={`/school/exams/${params.id}/analytics`} className="text-indigo-600 font-medium hover:underline flex items-center gap-1">
                            <BarChart size={14} /> View Analytics
                        </Link>
                    </div>
                </div>
                {!exam.isPublished ? (
                    <form action={async () => {
                        "use server";
                        await publishExamResults(params.id);
                    }}>
                        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2">
                            <Lock size={18} /> Publish & Lock Results
                        </button>
                    </form>
                ) : (
                    <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded border border-green-200">
                        <CheckCircle size={20} /> Results Published
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left font-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">Rank</th>
                            <th className="p-3">Student</th>
                            <th className="p-3 text-right">Total</th>
                            <th className="p-3 text-right">%</th>
                            <th className="p-3 text-center">Grade</th>
                            <th className="p-3 text-center">Result</th>
                            <th className="p-3 text-center">Report Card</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {results.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center text-gray-500">No results found. Please enter marks first.</td></tr>
                        ) : (
                            results.map((res: any, index: number) => (
                                <tr key={res._id} className="hover:bg-gray-50">
                                    <td className="p-3 font-bold text-gray-500">#{res.rank || index + 1}</td>
                                    <td className="p-3 font-medium">
                                        {res.student?.firstName} {res.student?.lastName}
                                        <div className="text-xs text-gray-400">{res.student?.admissionNumber}</div>
                                    </td>
                                    <td className="p-3 text-right font-mono">{res.totalObtained} / {res.totalMax}</td>
                                    <td className="p-3 text-right font-mono">{res.percentage.toFixed(1)}%</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 rounded font-bold text-xs ${res.grade.startsWith("A") ? "bg-green-100 text-green-700" :
                                            res.grade === "F" ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
                                            }`}>{res.grade}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        {res.status === "FAIL" ? (
                                            <span className="text-red-600 font-bold text-xs">FAIL</span>
                                        ) : (
                                            <span className="text-green-600 font-bold text-xs">PASS</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        {exam.isPublished ? (
                                            <a href={`/api/exams/report-card/${res._id}`} target="_blank" className="text-indigo-600 hover:underline flex justify-center">
                                                <FileText size={18} />
                                            </a>
                                        ) : (
                                            <span className="text-gray-300"><FileText size={18} /></span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
