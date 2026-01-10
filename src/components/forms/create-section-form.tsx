"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSection, FormState } from "@/lib/actions/academic.actions";
import { cn } from "@/lib/utils";
import { useState } from "react";

const initialState: FormState = { message: "" };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:opacity-50"
        >
            {pending ? "Saving..." : "Save"}
        </button>
    );
}

export default function CreateSectionForm({ classId }: { classId: string }) {
    // @ts-ignore
    const [state, formAction] = useFormState(createSection, initialState);
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isExpanded) {
        return (
            <button onClick={() => setIsExpanded(true)} className="text-sm text-gray-500 hover:text-indigo-600 border border-dashed border-gray-300 rounded px-2 py-1">
                + Add Section
            </button>
        )
    }

    return (
        <div className="mt-2">
            <form action={formAction} className="flex gap-2 items-center">
                <input type="hidden" name="classId" value={classId} />
                <input
                    name="name"
                    placeholder="Section (A)"
                    required
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs border p-1"
                />
                <SubmitButton />
                <button type="button" onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
            </form>
            {state?.message && <p className={cn("text-xs mt-1", state.message.includes("success") ? "text-green-600" : "text-red-500")}>{state.message}</p>}
        </div>
    );
}
