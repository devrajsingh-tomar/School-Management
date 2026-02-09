"use client";

import { useState } from "react";
import { getTimetableForClass, getAvailableTeachers, createSubstitution } from "@/lib/actions/timetable.actions";
import { toast } from "sonner";
import { User, Book, Clock, MapPin, AlertCircle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SubstitutionManager({ teachers, date, initialSubs }: any) {
    const [absentTeacherId, setAbsentTeacherId] = useState("");
    const [slots, setSlots] = useState<any[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [subs, setSubs] = useState(initialSubs);

    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
    const [loadingAvailable, setLoadingAvailable] = useState(false);

    async function handleSelectAbsentTeacher(id: string) {
        setAbsentTeacherId(id);
        if (!id) {
            setSlots([]);
            return;
        }
        setLoadingSlots(true);
        // We need all slots for this teacher on this day.
        // My existing action is getTimetableForClass. I need getTimetableForTeacher.
        // Let's assume we fetch all school slots and filter (Naive but works for prototype).
        // Actually, I'll add getTimetableForTeacher to actions later or just fetch all classes for now.
        // For the sake of this UI, I'll use a mocked "Slots" view or just search by teacher.
        // I will assume the user selects a CLASS first to see slots of that class and then substitutes.
        // Actually, the best way: Select Teacher -> Find their Class/Day slots.

        // I'll fetch manually here for now or assuming the action exists.
        // I'll update actions to include getTimetableForTeacher.
        setLoadingSlots(false);
    }

    async function handleAssign(slot: any) {
        setSelectedSlot(slot);
        setLoadingAvailable(true);
        const res = await getAvailableTeachers(date, slot.periodIndex);
        setAvailableTeachers(res);
        setLoadingAvailable(false);
    }

    async function confirmAssign(subId: string) {
        const res = await createSubstitution({
            slotId: selectedSlot._id,
            date: date,
            substituteTeacherId: subId
        });

        if (res.success) {
            toast.success("Substitution confirmed");
            setSelectedSlot(null);
            // Refresh subs list
            window.location.reload();
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Assigned Substitutions</h3>
                    <div className="space-y-3">
                        {subs.map((s: any) => (
                            <div key={s._id} className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-indigo-600 uppercase">Period {s.originalSlot?.periodIndex} - {s.originalSlot?.class?.name}</div>
                                    <div className="text-sm font-medium">{s.originalTeacher?.name} <span className="text-gray-400">→</span> {s.substituteTeacher?.name}</div>
                                </div>
                                <CheckCircle className="text-green-500" size={18} />
                            </div>
                        ))}
                        {subs.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm italic">
                                No substitutions assigned for today.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Select Absent Teacher</h3>
                    <select
                        value={absentTeacherId}
                        onChange={(e) => handleSelectAbsentTeacher(e.target.value)}
                        className="w-full border rounded p-2 bg-white"
                    >
                        <option value="">Choose Teacher...</option>
                        {teachers.map((t: any) => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="lg:col-span-8">
                {selectedSlot ? (
                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-600 space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Assign Substitute</h3>
                                <p className="text-gray-500">Period {selectedSlot.periodIndex} for {selectedSlot.class?.name}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedSlot(null)}>Cancel</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loadingAvailable ? (
                                <div className="col-span-2 py-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>
                            ) : availableTeachers.length > 0 ? (
                                availableTeachers.map((t: any) => (
                                    <button
                                        key={t._id}
                                        onClick={() => confirmAssign(t._id)}
                                        className="p-4 border rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition text-left group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-gray-800">{t.name}</div>
                                                <div className="text-xs text-gray-500">Available Period {selectedSlot.periodIndex}</div>
                                            </div>
                                            <ArrowRight className="text-transparent group-hover:text-indigo-600 transition" size={18} />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-2 p-6 bg-red-50 text-red-600 rounded-lg flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    No teachers are free during this period!
                                </div>
                            )}
                        </div>
                    </div>
                ) : absentTeacherId ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 font-mono">Teacher Timetable (Today)</h3>
                            <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-200">Date: {date}</Badge>
                        </div>
                        <div className="p-20 text-center text-gray-400 space-y-4">
                            <AlertCircle className="mx-auto" size={40} />
                            <p>Loading teacher specific slots... (Coming in next update)</p>
                            {/* In actual impl, we'd list slots here and click "Assign" on one */}
                            <Button variant="outline" onClick={() => {
                                // Dummy Slot for Demo
                                handleAssign({
                                    _id: "dummy-id",
                                    periodIndex: 1,
                                    class: { name: "10A" },
                                    subject: "Math"
                                });
                            }}>Try Assignment Flow (Dummy Slot)</Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-indigo-50 border border-dashed border-indigo-200 rounded-2xl p-20 text-center flex flex-col items-center gap-4 text-indigo-600/50">
                        <User size={60} />
                        <div className="max-w-xs font-medium">Select an absent teacher from the sidebar to manage their substitutions.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
