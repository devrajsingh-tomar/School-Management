"use client";

import { createFeeStructure } from "@/lib/actions/finance.actions";
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
            {pending ? "Creating..." : "Create Fee"}
        </button>
    );
}

export default function CreateFeeForm({ classes }: { classes: any[] }) {
    // @ts-ignore
    const [state, formAction] = useFormState(createFeeStructure, initialState);

    return (
        <form action={formAction} className="bg-white p-6 rounded shadow space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Fee</h3>

            {state.message && (
                <div className={cn("rounded-md p-2 text-sm", state.errors ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                    {state.message}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Fee Name</label>
                <input name="name" placeholder="Tuition Fee Term 1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select name="classId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm">
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input type="number" name="amount" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input type="date" name="dueDate" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" />
            </div>

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
