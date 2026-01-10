"use client";

import { useEffect, useState } from "react";
import { getRoutes, assignTransport, getStudentsOnRoute } from "@/lib/actions/transport.actions";
import { getClasses } from "@/lib/actions/academic.actions";
import { getStudents } from "@/lib/actions/student.actions";
import { Search, Bus, CheckCircle } from "lucide-react";

export default function TransportAllocation() {
    const [routes, setRoutes] = useState<any[]>([]);
    const [searchId, setSearchId] = useState("");
    const [student, setStudent] = useState<any>(null);
    const [selectedRoute, setSelectedRoute] = useState("");
    const [selectedStop, setSelectedStop] = useState("");

    useEffect(() => {
        getRoutes().then(setRoutes);
    }, []);

    const handleSearch = async () => {
        // Using getStudents is inefficient for Single ID.
        // Assuming we can filter or just iterate for MVP.
        // Ideal: getStudentById action.
        // For now, let's use the one we have for admission enquiry or list.
        // Quick Fix: getStudents({ search: searchId }) if implemented.
        const res = await getStudents({ search: searchId });
        if (res.students && res.students.length > 0) {
            setStudent(res.students[0]);
            // Pre-fill
            if (res.students[0].transportRoute) {
                setSelectedRoute(res.students[0].transportRoute._id || res.students[0].transportRoute);
                setSelectedStop(res.students[0].transportStop || "");
            }
        } else {
            alert("Student not found");
            setStudent(null);
        }
    };

    const handleAssign = async () => {
        if (!student || !selectedRoute) return;
        await assignTransport(student._id, selectedRoute, selectedStop);
        alert("Assigned Successfully! Transport Fee will now apply.");
        setStudent(null);
        setSearchId("");
        setSelectedRoute("");
        setSelectedStop("");
    };

    const currentRoute = routes.find(r => r._id === selectedRoute);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Transport Allocation</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Search */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="font-semibold mb-4">Find Student</h2>
                        <div className="flex gap-2">
                            <input
                                placeholder="Admission Number or Name"
                                className="flex-1 border rounded p-2"
                                value={searchId} onChange={(e) => setSearchId(e.target.value)}
                            />
                            <button onClick={handleSearch} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    {student && (
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500 animate-in fade-in slide-in-from-top-4">
                            <h3 className="font-bold text-lg">{student.firstName} {student.lastName}</h3>
                            <p className="text-sm text-gray-500">{student.admissionNumber} • {student.class?.name}</p>

                            <hr className="my-4" />

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign Route</label>
                                    <select
                                        className="w-full border rounded p-2"
                                        value={selectedRoute} onChange={(e) => {
                                            setSelectedRoute(e.target.value);
                                            setSelectedStop("");
                                        }}
                                    >
                                        <option value="">No Transport</option>
                                        {routes.map((r: any) => (
                                            <option key={r._id} value={r._id}>{r.name} (Rs. {r.monthlyCost})</option>
                                        ))}
                                    </select>
                                </div>

                                {currentRoute && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Stop</label>
                                        <select
                                            className="w-full border rounded p-2"
                                            value={selectedStop} onChange={(e) => setSelectedStop(e.target.value)}
                                        >
                                            <option value="">-- Choose Stop --</option>
                                            {currentRoute.stops.map((s: any, i: number) => (
                                                <option key={i} value={s.name}>{s.name} ({s.arrivalTime})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button onClick={handleAssign} className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
                                    Confirm Assignment
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions / Info */}
                <div className="bg-blue-50 p-6 rounded-lg h-fit">
                    <h3 className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                        <Bus size={20} /> Transport Policy
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-2 list-disc pl-4">
                        <li>Assigning a route automatically adds the <b>Transport Fee</b> to the student's monthly dues.</li>
                        <li>To cancel transport, select "No Transport" and save.</li>
                        <li>Ensure the correct Pick-up/Drop-off stop is selected for manifesting.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
