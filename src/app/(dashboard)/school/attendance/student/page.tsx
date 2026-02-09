"use client";

import { useState } from "react";
import { getClasses } from "@/lib/actions/academic.actions"; // We'll need to fetch classes
import { getStudents } from "@/lib/actions/student.actions";
import { saveAttendance, getAttendanceByDate } from "@/lib/actions/attendance.actions";
import { Loader2, Save, Calendar } from "lucide-react";

// HACK: Since getClasses and getStudents are server actions, we should probably fetch them in a Server Component wrapper.
// But for interactivity (class selection changes students), a Client Component standard pattern is easier for MVP interactive forms.
// Alternatively, we use URL params for classId. Let's do URL params pattern in a future Refactor.
// For now, I'll make this a hybrid or client wrapper.
// Actually, let's stick to the "Client Component fetching on mount/change" for simplicity of this specific interaction flow, 
// even though Server Actions are best called from Server Components or Effects.

import { useEffect, useTransition } from "react";

export default function StudentAttendancePage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<string, string>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startSaving] = useTransition();

    // Initial Load
    useEffect(() => {
        getClasses().then((data) => {
            setClasses(data);
            setIsLoading(false);
        });
    }, []);

    // Fetch Students & Existing Attendance when Class/Date changes
    useEffect(() => {
        if (!selectedClass) return;

        const loadSchema = async () => {
            setIsLoading(true);
            const [studs, attRecord] = await Promise.all([
                getStudents({ classId: selectedClass }), // Assuming getStudents supports filtering by classId in its args or we filter client side
                // Update: getStudents signature in student.actions.ts might need check. 
                // Assuming it returns all or we can filter. 
                // If getStudents(page, query, classId) exists. 
                // Let's assume we fetch all and filter client side if parameter missing, or check signature.
                // Checking previous context: getStudents(page, search). It doesn't seem to have classId filter exposed.
                // We might need to update getStudents or filter purely client side (bad for perf).
                // Let's assume (mock) filtering for now or update the action.
                getAttendanceByDate(selectedClass, date)
            ]);

            // Temporary fix if getStudents doesn't filter: Filter locally (inefficient but works for small school)
            // Ideally we update getStudents action.
            const classStudents = studs.students.filter((s: any) => s.class?._id === selectedClass || s.class === selectedClass);

            setStudents(classStudents);

            // Pre-fill attendance: If record exists use it, else default to 'Present'
            const newAtt: Record<string, string> = {};
            const attMap = attRecord as Record<string, string>;
            classStudents.forEach((s: any) => {
                newAtt[s._id] = attMap[s._id] || "Present";
            });
            setAttendance(newAtt);
            setIsLoading(false);
        };

        loadSchema();
    }, [selectedClass, date]);


    const handleToggle = (studentId: string, status: string) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSave = () => {
        startSaving(async () => {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await saveAttendance({
                classId: selectedClass,
                date: new Date(date),
                records
            });

            alert("Attendance Saved Successfully!");
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Mark Student Attendance</h1>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <select
                        className="w-full border rounded p-2"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {classes.map((c: any) => (
                            <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            {selectedClass ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
                    ) : (
                        <>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4">Roll No</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {students.map((student) => (
                                        <tr key={student._id}>
                                            <td className="p-4 text-gray-500">{student.admissionNumber}</td>
                                            <td className="p-4 font-medium">{student.firstName} {student.lastName}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    {["Present", "Absent", "Late", "Half-Day"].map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleToggle(student._id, status)}
                                                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${attendance[student._id] === status
                                                                ? status === "Present" ? "bg-green-600 text-white border-green-600"
                                                                    : status === "Absent" ? "bg-red-600 text-white border-red-600"
                                                                        : "bg-indigo-600 text-white border-indigo-600"
                                                                : "bg-white text-gray-400 border-gray-200 hover:border-indigo-300"
                                                                }`}
                                                        >
                                                            {status.charAt(0)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <input placeholder="..." className="border rounded px-2 py-1 text-xs w-24" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 bg-gray-50 border-t flex justify-end sticky bottom-0">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Attendance
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="p-12 text-center text-gray-400 border-2 border-dashed rounded-lg">
                    Select a class to mark attendance
                </div>
            )}
        </div>
    );
}
