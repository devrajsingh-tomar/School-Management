"use client";

import { useActionState } from "react";
import { createClass, FormState } from "@/lib/actions/academic.actions";
import { cn } from "@/lib/utils";

const initialState: FormState = { message: "" };

export default function CreateClassForm() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(createClass, initialState);

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
            <button
                type="submit"
                disabled={isPending}
                className={cn(
                    "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50",
                    isPending && "cursor-not-allowed"
                )}
            >
                {isPending ? "Creating..." : "Add Class"}
            </button>
        </form>
    );
}
