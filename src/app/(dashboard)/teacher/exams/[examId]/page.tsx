
import ResultsForm from "@/components/forms/results-form";
import { getExamWithResults } from "@/lib/actions/exam.actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TeacherExamResultsPage({ params }: { params: { examId: string } }) {
    const data = await getExamWithResults(params.examId);

    if (!data) {
        return notFound();
    }

    const { exam, students, results } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/teacher/exams" className="text-sm text-indigo-600 hover:text-indigo-500 mb-2 block">&larr; Back to Exams</Link>
                    <h1 className="text-2xl font-bold">{exam.name}</h1>
                    <p className="text-gray-500 text-sm">
                        {exam.class?.name} &bull; {exam.subject?.name}
                    </p>
                </div>
            </div>

            {students.length === 0 ? (
                <div className="bg-yellow-50 p-4 rounded text-yellow-800">
                    No students found.
                </div>
            ) : (
                <ResultsForm
                    examId={exam._id}
                    students={students}
                    existingResults={results}
                />
            )}
        </div>
    );
}
