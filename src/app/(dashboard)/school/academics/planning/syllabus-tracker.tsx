"use client";

import { useState, useEffect } from "react";
import { getSyllabus, updateSyllabusTopicStatus, createSyllabus } from "@/lib/actions/academic-content.actions";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2, Plus, Target } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export function SyllabusTracker({ classes, initialClassId, initialSubject }: any) {
    const [selectedClass, setSelectedClass] = useState(initialClassId);
    const [selectedSubject, setSelectedSubject] = useState(initialSubject);
    const [syllabus, setSyllabus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedClass && selectedSubject) {
            loadSyllabus();
        }
    }, [selectedClass, selectedSubject]);

    async function loadSyllabus() {
        setLoading(true);
        const res = await getSyllabus(selectedClass, selectedSubject);
        if (res.success) {
            setSyllabus(res.data);
        }
        setLoading(false);
    }

    async function toggleStatus(topicId: string, currentStatus: string) {
        const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
        const res = await updateSyllabusTopicStatus(syllabus._id, topicId, newStatus);
        if (res.success) {
            toast.success("Progress updated");
            loadSyllabus();
        }
    }

    const completionRate = syllabus?.topics?.length
        ? Math.round((syllabus.topics.filter((t: any) => t.status === "Completed").length / syllabus.topics.length) * 100)
        : 0;

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-gray-500 uppercase">Select Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full border rounded p-2 mt-1 bg-white"
                    >
                        <option value="">Choose Class...</option>
                        {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
                    <input
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        placeholder="e.g. Science"
                        className="w-full border rounded p-2 mt-1"
                    />
                </div>
                <button
                    onClick={loadSyllabus}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 h-[42px]"
                >
                    Track Progress
                </button>
            </div>

            {loading ? (
                <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>
            ) : syllabus ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <h3 className="font-semibold text-gray-700">Course Topics</h3>
                                <div className="text-xs font-medium text-gray-500">{syllabus.topics.length} Total</div>
                            </div>
                            <div className="divide-y">
                                {syllabus.topics.map((topic: any) => (
                                    <div key={topic._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleStatus(topic._id, topic.status)}
                                                className={`transition ${topic.status === "Completed" ? "text-green-500" : "text-gray-300 hover:text-indigo-400"}`}
                                            >
                                                {topic.status === "Completed" ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                            </button>
                                            <div>
                                                <div className={`font-medium ${topic.status === "Completed" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                                    {topic.title}
                                                </div>
                                                {topic.description && <div className="text-xs text-gray-400">{topic.description}</div>}
                                            </div>
                                        </div>
                                        {topic.completedAt && (
                                            <div className="text-[10px] text-gray-400">
                                                Done: {format(new Date(topic.completedAt), "dd/MM/yyyy")}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Target className="text-indigo-600" size={20} />
                                Subject Mastery
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="text-3xl font-black text-indigo-600">{completionRate}%</div>
                                    <div className="text-sm text-gray-500">Completed</div>
                                </div>
                                <Progress value={completionRate} className="h-3 rounded-full" />
                                <div className="text-xs text-center text-gray-400 italic">
                                    Track topic-wise completion to update syllabus progress.
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                            <h4 className="font-bold mb-2">Need to initialize?</h4>
                            <p className="text-sm opacity-90 mb-4">If this is a new class/subject, you can bulk initialize the syllabus topics.</p>
                            <button className="w-full bg-white/20 hover:bg-white/30 transition py-2 rounded font-medium text-sm flex items-center justify-center gap-2">
                                <Plus size={16} /> Add New Topic
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                selectedClass && (
                    <div className="bg-gray-50 p-20 rounded-xl border border-dashed text-center space-y-4">
                        <div className="text-gray-400 font-medium">No syllabus found for this subject.</div>
                        <button
                            onClick={async () => {
                                await createSyllabus(selectedClass, selectedSubject, [{ title: "Introduction" }]);
                                loadSyllabus();
                            }}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition shadow-md"
                        >
                            Initialize Syllabus
                        </button>
                    </div>
                )
            )}
        </div>
    );
}
