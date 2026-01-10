"use client";

import { saveExamResults } from "@/lib/actions/exam.actions";
import { useFormState, useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const initialState = { message: "" };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
            {pending ? "Saving..." : "Save Results"}
        </button>
    );
}

export default function ResultsForm({
    examId,
    students,
    existingResults
}: {
    examId: string,
    students: any[],
    existingResults: any[]
}) {
    // @ts-ignore
    const [state, formAction] = useFormState(saveExamResults, initialState);

    const getMarks = (studentId: string) => {
        const result = existingResults.find(r => r.student === studentId);
        return result ? result.marksObtained : "";
    };

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="examId" value={examId} />

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr key={student._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="number"
                                        name={`marks-${student._id}`}
                                        step="0.5"
                                        defaultValue={getMarks(student._id)}
                                        placeholder="0.0"
                                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-1"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end items-center gap-4">
                {state?.message && <span className={cn("text-sm", state.message.includes("success") ? "text-green-600" : "text-red-600")}>{state.message}</span>}
                <SubmitButton />
            </div>
        </form>
    );
}
