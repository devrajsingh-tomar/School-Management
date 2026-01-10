"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AttendanceFilter({ classes }: { classes: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [date, setDate] = useState(searchParams.get("date") || new Date().toISOString().split("T")[0]);
    const [selectedClass, setSelectedClass] = useState(searchParams.get("classId") || "");
    const [selectedSection, setSelectedSection] = useState(searchParams.get("sectionId") || "");

    const handleApply = () => {
        if (selectedClass && selectedSection && date) {
            router.push(`?classId=${selectedClass}&sectionId=${selectedSection}&date=${date}`);
        }
    };

    const currentClass = classes.find((c) => c._id === selectedClass);
    const sections = currentClass ? currentClass.sections : [];

    return (
        <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end">
            <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select
                    value={selectedClass}
                    onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedSection(""); // Reset section
                    }}
                    className="mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                            {cls.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={!selectedClass}
                    className="mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 disabled:bg-gray-100"
                >
                    <option value="">Select Section</option>
                    {sections.map((sec: any) => (
                        <option key={sec._id} value={sec._id}>
                            {sec.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleApply}
                disabled={!selectedSection}
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 text-sm h-10"
            >
                Load Students
            </button>
        </div>
    );
}
