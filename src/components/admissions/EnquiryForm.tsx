"use client";

import { useState, useTransition } from "react";
import { createEnquiry } from "@/lib/actions/enquiry.actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EnquiryForm({ classes }: { classes: any[] }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        setError("");
        startTransition(async () => {
            try {
                const data = {
                    studentName: formData.get("studentName"),
                    gender: formData.get("gender"),
                    dob: new Date(formData.get("dob") as string),
                    parentName: formData.get("parentName"),
                    email: formData.get("email"),
                    phone: formData.get("phone"),
                    address: formData.get("address"),
                    classAppliedFor: formData.get("classAppliedFor"),
                    previousSchool: formData.get("previousSchool"),
                    documents: [], // Handle file uploads separately later if needed
                };

                await createEnquiry(data);
                router.push("/school/admissions/enquiries");
            } catch (e: any) {
                setError(e.message || "Failed to create enquiry");
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4">New Admission Enquiry</h2>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Details */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Student Name *</label>
                    <input name="studentName" required className="w-full border p-2 rounded" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Gender *</label>
                    <select name="gender" required className="w-full border p-2 rounded bg-white">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date of Birth *</label>
                    <input type="date" name="dob" required className="w-full border p-2 rounded" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Class Applied For *</label>
                    <select name="classAppliedFor" required className="w-full border p-2 rounded bg-white">
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                            <option key={cls._id} value={cls._id}>{cls.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Previous School</label>
                <input name="previousSchool" className="w-full border p-2 rounded" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t">Parent / Guardian Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Parent Name *</label>
                    <input name="parentName" required className="w-full border p-2 rounded" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                    <input name="phone" required className="w-full border p-2 rounded" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" name="email" className="w-full border p-2 rounded" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" className="w-full border p-2 rounded h-24"></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {isPending && <Loader2 className="animate-spin" size={16} />}
                    Submit Enquiry
                </button>
            </div>
        </form>
    );
}
