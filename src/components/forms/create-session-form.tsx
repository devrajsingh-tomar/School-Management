"use client";

import { createSession } from "@/lib/actions/master.actions";
import { useFormState, useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const initialState = { message: "" };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
        >
            {pending ? "Saving..." : "Add Session"}
        </button>
    );
}

export default function CreateSessionForm() {
    // @ts-ignore
    const [state, formAction] = useFormState(createSession, initialState);

    return (
        <form action={formAction} className="bg-white p-6 rounded shadow space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">New Academic Session</h3>

            {state.message && (
                <div className={cn("rounded-md p-2 text-sm", state.message.includes("Created") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                    {state.message}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input name="name" placeholder="2024-2025" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" name="startDate" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" name="endDate" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" />
                </div>
            </div>

            <div className="flex items-center">
                <input type="checkbox" name="isCurrent" value="true" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <label className="ml-2 block text-sm text-gray-900">Set as Current Session</label>
            </div>

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
