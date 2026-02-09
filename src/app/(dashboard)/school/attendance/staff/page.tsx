"use client";

import { useState, useEffect, useTransition } from "react";
import { getSchoolUsers } from "@/lib/actions/user.actions";
import { Loader2, Save, Calendar, UserCheck } from "lucide-react";
import { markStaffAttendance, getStaffAttendanceByDate } from "@/lib/actions/attendance.actions";

export default function StaffAttendancePage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendance, setAttendance] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startSaving] = useTransition();

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const [users, attRecord] = await Promise.all([
                getSchoolUsers(), // Fetch all, will filter for Staff/Teacher roles in app logic or better in query
                getStaffAttendanceByDate(date)
            ]);

            const staffList = users.filter((u: any) => ["TEACHER", "STAFF", "ACCOUNTANT"].includes(u.role));
            setStaff(staffList);

            const newAtt: Record<string, string> = {};
            const attMap = attRecord as Record<string, string>;
            staffList.forEach((s: any) => {
                newAtt[s._id] = attMap[s._id] || "Present";
            });
            setAttendance(newAtt);
            setIsLoading(false);
        };
        load();
    }, [date]);

    const handleToggle = (id: string, status: string) => {
        setAttendance(prev => ({ ...prev, [id]: status }));
    };

    const handleSave = () => {
        startSaving(async () => {
            const records = Object.entries(attendance).map(([staffId, status]) => ({
                staffId,
                status
            }));

            await markStaffAttendance({
                date: new Date(date),
                records
            });

            alert("Staff Attendance Saved!");
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <UserCheck className="text-indigo-600" /> Staff Attendance
                </h1>
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    <input
                        type="date"
                        className="border rounded p-2 text-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500"><Loader2 className="animate-spin inline" /> Loading Staff List...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Role</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {staff.map((s) => (
                                <tr key={s._id}>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{s.name}</div>
                                        <div className="text-xs text-gray-400">{s.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded border">{s.role}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            {["Present", "Absent", "Late"].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleToggle(s._id, status)}
                                                    className={`px-4 py-1 rounded-full text-xs font-bold border transition ${attendance[s._id] === status
                                                        ? status === "Present" ? "bg-green-600 text-white border-green-600"
                                                            : status === "Absent" ? "bg-red-600 text-white border-red-600"
                                                                : "bg-indigo-600 text-white border-indigo-600"
                                                        : "bg-white text-gray-400 border-gray-200 hover:border-indigo-300"
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Staff Attendance
                    </button>
                </div>
            </div>
        </div>
    );
}
