"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSchool, CreateSchoolState } from "@/lib/actions/school.actions";
import { cn } from "@/lib/utils";

const initialState: CreateSchoolState = { message: "", errors: {} };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
            {pending ? "Creating..." : "Create School"}
        </button>
    );
}

export default function CreateSchoolForm() {
    // @ts-ignore - useFormState type mismatch in some next versions, but safe here
    const [state, formAction] = useFormState(createSchool, initialState);

    return (
        <form action={formAction} className="space-y-6 bg-white p-6 rounded shadow">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New School</h3>

            {state.message && (
                <div className={cn("rounded-md p-4 text-sm", state.errors ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">School Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Slug (Subdomain)</label>
                    <input
                        type="text"
                        name="slug"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                    {state.errors?.slug && <p className="text-sm text-red-600">{state.errors.slug}</p>}
                </div>

                <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <input
                        type="email"
                        name="contactEmail"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                    <select
                        name="subscriptionPlan"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    >
                        <option value="FREE">Free</option>
                        <option value="BASIC">Basic</option>
                        <option value="PREMIUM">Premium</option>
                    </select>
                </div>

                <hr className="sm:col-span-6" />

                <div className="sm:col-span-3">
                    <h4 className="font-medium text-gray-900">Admin Details</h4>
                </div>

                <div className="sm:col-span-3">
                    {/* Spacer */}
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                    <input name="adminName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                    <input type="email" name="adminEmail" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    {state.errors?.adminEmail && <p className="text-sm text-red-600">{state.errors.adminEmail}</p>}
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Default Password</label>
                    <input type="password" name="adminPassword" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                </div>
            </div>

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
