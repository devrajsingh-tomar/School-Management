"use client";

import { useEffect, useState, useTransition } from "react";
import { getExamById, updateStudentMarks, getMarksForExam } from "@/lib/actions/exam.actions";
import { getStudents } from "@/lib/actions/student.actions";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MarksEntryPage({ params }: { params: { id: string } }) {
    const [exam, setExam] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [marksData, setMarksData] = useState<Record<string, Record<string, number>>>({}); // { studentId: { "Math": 90 } }
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startSaving] = useTransition();

    useEffect(() => {
        const load = async () => {
            const ex = await getExamById(params.id);
            setExam(ex);

            // Fetch students for this class
            const { students: classStudents } = await getStudents({ classId: ex.class._id });
            setStudents(classStudents);

            // Fetch existing marks
            const existingResults = await getMarksForExam(params.id);

            // Map existing marks to state
            const initialMarks: any = {};
            existingResults.forEach((res: any) => {
                const sMarks: any = {};
                res.subjectScores.forEach((score: any) => {
                    sMarks[score.subject] = score.marksObtained;
                });
                initialMarks[res.student._id] = sMarks;
            });
            setMarksData(initialMarks);

            setIsLoading(false);
        };
        load();
    }, [params.id]);

    const handleMarkChange = (studentId: string, subject: string, val: string) => {
        const num = Number(val);
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [subject]: num
            }
        }));
    };

    const handleSave = () => {
        startSaving(async () => {
            // Bulk update not implemented in action efficiently, so looping calls for MVP.
            // Ideally: updateExamMarksBulk action.
            // Using loop with Promise.all
            const promises = students.map(s => {
                const sMarks = marksData[s._id];
                if (!sMarks) return null;

                const scores = Object.entries(sMarks).map(([subj, m]) => ({ subject: subj, marksObtained: Number(m) }));

                return updateStudentMarks({
                    examId: exam._id,
                    studentId: s._id,
                    classId: exam.class._id,
                    subjectScores: scores
                });
            });

            await Promise.all(promises);
            alert("Marks Saved!");
        });
    };

    if (isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin inline" /> Loading Exam Data...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Marks Entry: {exam.name}</h1>
            <p className="text-gray-500">Enter marks for Class {exam.class.name}. Auto-saved as Draft until published.</p>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 border-r sticky left-0 bg-gray-50 z-10 w-48">Student</th>
                            {exam.subjects.map((sub: any) => (
                                <th key={sub.name} className="p-4 text-center min-w-[120px] border-r">
                                    {sub.name}
                                    <div className="text-xs text-gray-400 font-normal">Max: {sub.maxMarks}</div>
                                </th>
                            ))}
                            <th className="p-4 text-center w-24">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {students.map((student) => {
                            const scores = marksData[student._id] || {};
                            const total = Object.values(scores).reduce((a, b) => a + b, 0);

                            return (
                                <tr key={student._id}>
                                    <td className="p-4 border-r font-medium sticky left-0 bg-white z-10">
                                        {student.firstName} {student.lastName}
                                        <div className="text-xs text-gray-500">{student.admissionNumber}</div>
                                    </td>
                                    {exam.subjects.map((sub: any) => (
                                        <td key={sub.name} className="p-2 border-r text-center">
                                            <input
                                                type="number"
                                                min={0} max={sub.maxMarks}
                                                className={`w-16 border rounded p-1 text-center font-bold ${(scores[sub.name] || 0) < sub.passingMarks ? "text-red-500 bg-red-50 border-red-200" : ""
                                                    }`}
                                                value={scores[sub.name] === undefined ? "" : scores[sub.name]}
                                                onChange={(e) => handleMarkChange(student._id, sub.name, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td className="p-4 text-center font-bold text-gray-700 bg-gray-50">
                                        {total}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end sticky bottom-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-8 py-3 rounded shadow-lg hover:bg-indigo-700 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Save All Marks
                </button>
            </div>
        </div>
    );
}
