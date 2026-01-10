"use client";

import { useState, useEffect } from "react";
import { getClasses } from "@/lib/actions/academic.actions";
import { getTeachers } from "@/lib/actions/staff.actions";
import { getTimetableForClass, saveTimetableSlot, deleteTimetableSlot } from "@/lib/actions/timetable.actions";
import { Loader2, Trash2, Plus, AlertTriangle } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = 8;

export default function TimetableManager() {
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [timetable, setTimetable] = useState<any[]>([]);

    // Modal State
    const [editingSlot, setEditingSlot] = useState<{ day: string, period: number } | null>(null);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        Promise.all([
            getClasses(),
            getTeachers()
        ]).then(([cls, tchs]) => {
            setClasses(cls);
            // @ts-ignore
            setTeachers(tchs); // Assuming getTeachers returns array
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        if (selectedClass) {
            setIsLoading(true);
            getTimetableForClass(selectedClass).then(slots => {
                setTimetable(slots);
                setIsLoading(false);
            });
        } else {
            setTimetable([]);
        }
    }, [selectedClass]);

    const getSlot = (day: string, period: number) => {
        return timetable.find(t => t.day === day && t.periodIndex === period);
    };

    const handleSave = async () => {
        if (!editingSlot || !selectedClass) return;
        setSaveError("");

        const res = await saveTimetableSlot({
            classId: selectedClass,
            day: editingSlot.day,
            periodIndex: editingSlot.period,
            subject: selectedSubject,
            teacherId: selectedTeacher
        });

        if (res.error) {
            setSaveError(res.error);
        } else {
            // Reload
            const slots = await getTimetableForClass(selectedClass);
            setTimetable(slots);
            setEditingSlot(null);
            setSelectedSubject("");
            setSelectedTeacher("");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Clear this slot?")) {
            await deleteTimetableSlot(id);
            const slots = await getTimetableForClass(selectedClass);
            setTimetable(slots);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Timetable</h1>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Class to Edit</label>
                <select
                    className="w-full md:w-64 border rounded p-2"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    <option value="">-- Choose Class --</option>
                    {classes.map((c: any) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Grid */}
            {selectedClass && (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    {isLoading ? (
                        <div className="p-12 text-center"><Loader2 className="animate-spin inline" /></div>
                    ) : (
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 border bg-gray-50 text-indigo-900 sticky left-0 z-10 w-32">Day / Period</th>
                                    {Array.from({ length: PERIODS }).map((_, i) => (
                                        <th key={i} className="p-3 border bg-gray-50 text-indigo-900 min-w-[140px]">
                                            Period {i + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map(day => (
                                    <tr key={day}>
                                        <td className="p-3 border font-bold bg-gray-50 sticky left-0 z-10">{day}</td>
                                        {Array.from({ length: PERIODS }).map((_, i) => {
                                            const period = i + 1;
                                            const slot = getSlot(day, period);

                                            return (
                                                <td key={period} className="p-2 border relative group hover:bg-gray-50 h-24 align-top">
                                                    {slot ? (
                                                        <div className="flex flex-col h-full justify-between">
                                                            <div>
                                                                <div className="font-bold text-indigo-700 text-sm">{slot.subject}</div>
                                                                <div className="text-xs text-gray-600">{slot.teacher?.name}</div>
                                                            </div>
                                                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-1 mt-1">
                                                                <button onClick={() => handleDelete(slot._id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setEditingSlot({ day, period });
                                                                setSaveError("");
                                                            }}
                                                            className="w-full h-full flex items-center justify-center text-gray-300 hover:text-indigo-500"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Edit Modal Overlay */}
            {editingSlot && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">
                            Edit Slot: {editingSlot.day} - Period {editingSlot.period}
                        </h3>

                        {saveError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm flex items-center gap-2">
                                <AlertTriangle size={16} /> {saveError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    className="w-full border rounded p-2"
                                    placeholder="e.g. Science"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teacher</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map((t: any) => (
                                        <option key={t._id} value={t._id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end mt-6">
                                <button
                                    onClick={() => setEditingSlot(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    Save Slot
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
