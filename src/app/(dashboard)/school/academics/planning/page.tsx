import { getClasses } from "@/lib/actions/academic.actions";
import { createLessonPlan, getLessonPlans } from "@/lib/actions/academic-content.actions";
import { BookOpen, Map, CheckCircle2 } from "lucide-react";

export default async function PlanningPage() {
    const classes = await getClasses();
    const plans = await getLessonPlans();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Lesson Planning</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow h-fit">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">New Lesson Plan</h2>
                    <form action={createLessonPlan} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class</label>
                            <select name="classId" required className="w-full border rounded p-2 bg-white">
                                {classes.map((c: any) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <input name="subject" required className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Topic</label>
                            <input name="topic" required className="w-full border rounded p-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start</label>
                                <input name="startDate" type="date" required className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End</label>
                                <input name="endDate" type="date" required className="w-full border rounded p-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Resources</label>
                            <input name="resources" placeholder="Textbooks, Links..." className="w-full border rounded p-2" />
                        </div>
                        <button className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700">
                            Save Plan
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4">Timeline</th>
                                    <th className="p-4">Class</th>
                                    <th className="p-4">Topic</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {plans.map((p: any) => (
                                    <tr key={p._id}>
                                        <td className="p-4 text-gray-500 whitespace-nowrap">
                                            {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-bold">{p.class?.name} <span className="text-xs font-normal text-gray-500 block">{p.subject}</span></td>
                                        <td className="p-4 text-gray-700">{p.topic}</td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{p.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {plans.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">No lesson plans found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
