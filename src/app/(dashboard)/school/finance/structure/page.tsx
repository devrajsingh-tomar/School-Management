import { getClasses } from "@/lib/actions/academic.actions";
import { getFeeStructures, createFeeStructure, deleteFeeStructure } from "@/lib/actions/finance.actions";
import { Plus, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function FeeStructurePage() {
    const classes = await getClasses();
    const feeStructures = await getFeeStructures();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Fee Structure Builder</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="bg-white p-6 rounded-lg shadow h-fit">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Add New Fee Head</h2>
                    <form action={createFeeStructure} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fee Name</label>
                            <input name="name" placeholder="e.g. Annual Charges" required className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class</label>
                            <select name="classId" required className="w-full border rounded p-2 bg-white">
                                {classes.map((c: any) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select name="type" required className="w-full border rounded p-2 bg-white">
                                    <option value="Tuition">Tuition</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Exam">Exam</option>
                                    <option value="Admission">Admission</option>
                                    <option value="Misc">Misc</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                                <select name="frequency" required className="w-full border rounded p-2 bg-white">
                                    <option value="One-Time">One-Time</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                            <input name="amount" type="number" required className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input name="dueDate" type="date" required className="w-full border rounded p-2" />
                        </div>

                        <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                            Create Fee Structure
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left font-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 font-medium text-gray-600">Class</th>
                                    <th className="p-4 font-medium text-gray-600">Fee Head</th>
                                    <th className="p-4 font-medium text-gray-600">Type</th>
                                    <th className="p-4 font-medium text-gray-600">Amount</th>
                                    <th className="p-4 font-medium text-gray-600">Next Due</th>
                                    <th className="p-4 font-medium text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {feeStructures.map((fee: any) => (
                                    <tr key={fee._id}>
                                        <td className="p-4">{fee.class?.name || "All"}</td>
                                        <td className="p-4 font-medium">{fee.name}</td>
                                        <td className="p-4 text-xs">
                                            <span className="bg-gray-100 px-2 py-1 rounded">{fee.type}</span>
                                            <span className="ml-1 text-gray-400">{fee.frequency}</span>
                                        </td>
                                        <td className="p-4 font-bold">₹ {fee.amount.toLocaleString()}</td>
                                        <td className="p-4 text-gray-500">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <form action={async () => {
                                                "use server";
                                                await deleteFeeStructure(fee._id);
                                            }}>
                                                <button className="text-red-500 hover:text-red-700">
                                                    <Trash2 size={16} />
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {feeStructures.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No fee structures defined.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
