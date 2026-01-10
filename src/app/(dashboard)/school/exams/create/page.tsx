"use client";

import { getClasses } from "@/lib/actions/academic.actions";
import { createExam } from "@/lib/actions/exam.actions";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateExamPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<{ name: string; maxMarks: number; passingMarks: number }[]>([
        { name: "", maxMarks: 100, passingMarks: 33 } // Default row
    ]);
    const router = useRouter();

    useEffect(() => {
        getClasses().then(setClasses);
    }, []);

    const addSubject = () => {
        setSubjects([...subjects, { name: "", maxMarks: 100, passingMarks: 33 }]);
    };

    const removeSubject = (index: number) => {
        setSubjects(subjects.filter((_, i) => i !== index));
    };

    const updateSubject = (index: number, field: string, value: any) => {
        const newSubs = [...subjects];
        // @ts-ignore
        newSubs[index][field] = value;
        setSubjects(newSubs);
    };

    const handleSubmit = async (formData: FormData) => {
        formData.append("subjects", JSON.stringify(subjects));
        const res = await createExam(formData);
        if (res.message === "Exam Created") {
            router.push("/school/exams");
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Create New Exam</h1>

            <div className="bg-white p-8 rounded-lg shadow">
                <form action={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                            <input name="name" required placeholder="e.g. Mid Term 2024" className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select name="type" required className="w-full border rounded p-2 bg-white">
                                <option value="Term">Term Exam</option>
                                <option value="Unit Test">Unit Test</option>
                                <option value="Final">Final Exam</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class</label>
                            <select name="classId" required className="w-full border rounded p-2 bg-white">
                                {classes.map((c: any) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input name="startDate" type="date" required className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input name="endDate" type="date" required className="w-full border rounded p-2" />
                            </div>
                        </div>
                    </div>

                    {/* Subjects Editor */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Subjects & Marking Scheme</label>
                            <button type="button" onClick={addSubject} className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                                <Plus size={14} /> Add Subject
                            </button>
                        </div>
                        <div className="space-y-2">
                            {subjects.map((sub, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        placeholder="Subject Name"
                                        value={sub.name}
                                        onChange={(e) => updateSubject(index, "name", e.target.value)}
                                        required
                                        className="flex-1 border rounded p-2 text-sm"
                                    />
                                    <input
                                        type="number" placeholder="Max"
                                        value={sub.maxMarks}
                                        onChange={(e) => updateSubject(index, "maxMarks", Number(e.target.value))}
                                        required
                                        className="w-20 border rounded p-2 text-sm"
                                    />
                                    <input
                                        type="number" placeholder="Pass"
                                        value={sub.passingMarks}
                                        onChange={(e) => updateSubject(index, "passingMarks", Number(e.target.value))}
                                        required
                                        className="w-20 border rounded p-2 text-sm"
                                    />
                                    <button type="button" onClick={() => removeSubject(index)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
                        Create Exam Schedule
                    </button>
                </form>
            </div>
        </div>
    );
}
