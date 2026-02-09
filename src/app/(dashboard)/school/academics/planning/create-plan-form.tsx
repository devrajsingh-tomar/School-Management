"use client";

import { createLessonPlan } from "@/lib/actions/academic-content.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export function CreatePlanForm({ classes }: { classes: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const res = await createLessonPlan(formData);
            if (res.success) {
                toast.success("Lesson plan saved!");
                router.refresh();
                (document.getElementById("plan-form") as HTMLFormElement).reset();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Failed to save plan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">New Lesson Plan</h2>
            <form id="plan-form" action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <select name="classId" required className="w-full border rounded p-2 bg-white mt-1">
                        {classes.map((c: any) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input name="subject" required className="w-full border rounded p-2 mt-1" placeholder="e.g. Mathematics" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Topic</label>
                    <input name="topic" required className="w-full border rounded p-2 mt-1" placeholder="e.g. Algebra Basics" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start</label>
                        <input name="startDate" type="date" required className="w-full border rounded p-2 mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End</label>
                        <input name="endDate" type="date" required className="w-full border rounded p-2 mt-1" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Resources</label>
                    <textarea name="resources" rows={2} placeholder="Textbooks, Links..." className="w-full border rounded p-2 mt-1" />
                </div>
                <button
                    disabled={loading}
                    className="w-full bg-teal-600 text-white py-2 rounded font-medium hover:bg-teal-700 transition disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Plan"}
                </button>
            </form>
        </div>
    );
}
