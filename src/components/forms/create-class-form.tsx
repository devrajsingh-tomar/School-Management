"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createClass, FormState } from "@/lib/actions/academic.actions";
import { cn } from "@/lib/utils";

const initialState: FormState = { message: "" };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(
                "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50",
                pending && "cursor-not-allowed"
            )}
        >
            {pending ? "Creating..." : "Add Class"}
        </button>
    );
}

export default function CreateClassForm() {
    // @ts-ignore
    const [state, formAction] = useFormState(createClass, initialState);

    return (
        <form action={formAction} className="flex gap-2 items-start">
            <div className="flex-1">
                <label htmlFor="className" className="sr-only">Class Name</label>
                <input
                    id="className"
                    name="name"
                    placeholder="Class Name (e.g. Grade 10)"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
                {state?.message && <p className={cn("text-xs mt-1", state.message.includes("success") ? "text-green-600" : "text-red-500")}>{state.message}</p>}
            </div>
            <SubmitButton />
        </form>
    );
}
