"use client";

import { deleteLessonPlan } from "@/lib/actions/academic-content.actions";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2, Calendar, BookOpen } from "lucide-react";

export function LessonPlanTable({ plans }: { plans: any[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (!confirm("Delete this lesson plan?")) return;

        try {
            const res = await deleteLessonPlan(id);
            if (res.success) {
                toast.success("Plan deleted");
                router.refresh();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    }

    return (
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="text-teal-600" size={18} />
                    Current Schedule
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-600 font-medium">
                        <tr>
                            <th className="p-4">Timeline</th>
                            <th className="p-4">Class & Subject</th>
                            <th className="p-4">Topic</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-gray-700">
                        {plans.map((p: any) => (
                            <tr key={p._id} className="hover:bg-gray-50 transition">
                                <td className="p-4 text-gray-500 whitespace-nowrap font-mono text-xs">
                                    {format(new Date(p.startDate), "dd/MM/yyyy")} - <br />
                                    {format(new Date(p.endDate), "dd/MM/yyyy")}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{p.class?.name}</div>
                                    <div className="text-xs text-indigo-600 flex items-center gap-1">
                                        <BookOpen size={12} />
                                        {p.subject}
                                    </div>
                                </td>
                                <td className="p-4 max-w-[200px] truncate" title={p.topic}>{p.topic}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === "Completed" ? "bg-green-100 text-green-700" :
                                        p.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                            "bg-gray-100 text-gray-600"
                                        }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDelete(p._id)}
                                        className="text-red-400 hover:text-red-600 transition p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {plans.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-500 italic">
                                    No lesson plans scheduled yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
