"use client";

import { useState, useEffect } from "react";
import { saveAttendance } from "@/lib/actions/attendance.actions";
import { useFormState, useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const initialState = { message: "", success: false };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
            {pending ? "Saving..." : "Save Attendance"}
        </button>
    );
}

export default function AttendanceTracker({
    classId,
    sectionId,
    date,
    users,
    existingAttendance
}: {
    classId: string,
    sectionId: string,
    date: string,
    users: any[],
    existingAttendance: any
}) {
    // @ts-ignore
    const [state, formAction] = useFormState(saveAttendance, initialState);

    // Map initial status
    const getInitialStatus = (studentId: string) => {
        if (existingAttendance && existingAttendance.records) {
            const record = existingAttendance.records.find((r: any) => r.student === studentId);
            return record ? record.status : "PRESENT";
        }
        return "PRESENT";
    };

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="classId" value={classId} />
            <input type="hidden" name="sectionId" value={sectionId} />
            <input type="hidden" name="date" value={date} />

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-4">
                                        {["PRESENT", "ABSENT", "LATE", "EXCUSED"].map((status) => (
                                            <label key={status} className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`status-${user._id}`}
                                                    value={status}
                                                    defaultChecked={getInitialStatus(user._id) === status}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                />
                                                <span className={cn(
                                                    "text-xs font-medium px-2 py-0.5 rounded",
                                                    status === "PRESENT" && "bg-green-100 text-green-800",
                                                    status === "ABSENT" && "bg-red-100 text-red-800",
                                                    status === "LATE" && "bg-yellow-100 text-yellow-800",
                                                    status === "EXCUSED" && "bg-blue-100 text-blue-800"
                                                )}>
                                                    {status}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end items-center gap-4">
                {state?.message && <span className={cn("text-sm", state.success ? "text-green-600" : "text-red-600")}>{state.message}</span>}
                <SubmitButton />
            </div>
        </form>
    );
}
