"use client";

import { createCategory } from "@/lib/actions/master.actions";
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
            {pending ? "Saving..." : "Add Category"}
        </button>
    );
}

export default function CreateCategoryForm() {
    // @ts-ignore
    const [state, formAction] = useFormState(createCategory, initialState);

    return (
        <form action={formAction} className="bg-white p-6 rounded shadow space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">New Student Category</h3>

            {state.message && (
                <div className={cn("rounded-md p-2 text-sm", state.message.includes("Created") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                    {state.message}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input name="name" placeholder="General" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" />
            </div>

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
