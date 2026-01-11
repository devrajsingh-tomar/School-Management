"use client";

import { useActionState } from "react";
import { createUser, CreateUserState } from "@/lib/actions/user.actions";
import { cn } from "@/lib/utils";
import { useState } from "react";

const initialState: CreateUserState = { message: "", errors: {} };

export default function CreateUserForm({ classes }: { classes?: any[] }) {
    const [state, formAction, isPending] = useActionState(createUser, initialState);
    const [role, setRole] = useState("TEACHER");
    const [selectedClassId, setSelectedClassId] = useState("");

    const selectedClass = classes?.find(c => c._id === selectedClassId);
    const availableSections = selectedClass?.sections || [];

    return (
        <form action={formAction} className="space-y-6 bg-white p-6 rounded shadow">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New User</h3>

            {state.message && (
                <div className={cn("rounded-md p-4 text-sm", state.errors ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        name="role"
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    >
                        <option value="TEACHER">Teacher</option>
                        <option value="STUDENT">Student</option>
                        <option value="STAFF">Staff</option>
                        <option value="ACCOUNTANT">Accountant</option>
                    </select>
                </div>

                {role === "STUDENT" && classes && (
                    <>
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Class</label>
                            <select
                                name="classId"
                                required
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Section</label>
                            <select
                                name="sectionId"
                                required
                                disabled={!selectedClassId}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 disabled:bg-gray-100"
                            >
                                <option value="">Select Section</option>
                                {availableSections.map((s: any) => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                    {state.errors?.email && <p className="text-sm text-red-600">{state.errors.email}</p>}
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Initial Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isPending ? "Adding User..." : "Add User"}
                </button>
            </div>
        </form>
    );
}
