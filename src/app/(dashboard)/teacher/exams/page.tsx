
import { getExams } from "@/lib/actions/exam.actions";
import Link from "next/link";

export default async function TeacherExamsPage() {
    const exams = await getExams();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Exams & Results</h1>
            <p className="text-sm text-gray-500">Select an exam to enter marks.</p>

            {exams.length === 0 ? (
                <p className="text-gray-500 italic">No exams scheduled.</p>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {exams.map((exam: any) => (
                            <li key={exam._id}>
                                <Link href={`/teacher/exams/${exam._id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{exam.name}</p>
                                            <p className="text-xs text-gray-500">{new Date(exam.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500 mr-4">
                                                    Class: {exam.class?.name}
                                                </p>
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Subject: {exam.subject?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
