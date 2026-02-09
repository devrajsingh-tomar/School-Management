"use client";

import { createFeeStructure } from "@/lib/actions/finance.actions";
import { ActionState } from "@/lib/types/actions";
import { useFormState, useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const initialState: ActionState<null> = { success: false, data: null, message: "" };

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
    const [state, formAction] = useFormState(createFeeStructure, initialState);

    return (
        <form action={formAction} className="bg-white p-6 rounded shadow space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Fee</h3>

            {state.message && (
                <div className={cn("rounded-md p-2 text-sm", !state.success ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
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

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select name="type" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm">
                        <option value="Tuition">Tuition</option>
                        <option value="Transport">Transport</option>
                        <option value="Exam">Exam</option>
                        <option value="Admission">Admission</option>
                        <option value="Misc">Misc</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <select name="frequency" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm">
                        <option value="One-Time">One-Time</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                </div>
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
