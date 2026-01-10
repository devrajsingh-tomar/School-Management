"use client";

import { recordPayment } from "@/lib/actions/finance.actions";
import { useFormState, useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const initialState = { message: "" };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none disabled:opacity-50"
        >
            {pending ? "Recording..." : "Record Payment"}
        </button>
    );
}

export default function RecordPaymentForm({ students, fees }: { students: any[], fees: any[] }) {
    // @ts-ignore
    const [state, formAction] = useFormState(recordPayment, initialState);

    return (
        <form action={formAction} className="bg-white p-6 rounded shadow space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Record Payment</h3>

            {state.message && (
                <div className={cn("rounded-md p-2 text-sm", state.message.includes("Success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                    {state.message}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <select name="studentId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm">
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Fee</label>
                <select name="feeId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm">
                    <option value="">Select Fee</option>
                    {fees.map(f => <option key={f._id} value={f._id}>{f.name} - ${f.amount} ({f.class?.name})</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
                <input type="number" name="amount" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" />
            </div>

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
