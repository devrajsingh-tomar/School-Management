import { getLeaves, updateLeaveStatus } from "@/lib/actions/attendance.actions";
import Link from "next/link";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default async function LeavePage() {
    const leaves = await getLeaves();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Leave Applications</h1>
                <Link href="/school/attendance/leaves/new">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Apply for Leave
                    </button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left font-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Applicant</th>
                            <th className="p-4">Dates</th>
                            <th className="p-4">Reason</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {leaves.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No pending leave applications.</td></tr>
                        ) : (
                            leaves.map((leave: any) => (
                                <tr key={leave._id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium">
                                            {leave.applicantType === "Student"
                                                ? `${leave.student?.firstName} ${leave.student?.lastName}`
                                                : leave.staff?.name}
                                        </div>
                                        <div className="text-xs text-gray-500">{leave.applicantType}</div>
                                    </td>
                                    <td className="p-4">
                                        {new Date(leave.startDate).toLocaleDateString()}
                                        <span className="text-gray-400 mx-1">➜</span>
                                        {new Date(leave.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-gray-600 max-w-xs truncate">{leave.reason}</td>
                                    <td className="p-4">
                                        <StatusBadge status={leave.status} />
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        {leave.status === "Pending" && (
                                            <>
                                                <form action={async () => {
                                                    "use server";
                                                    await updateLeaveStatus(leave._id, "Approved");
                                                }}>
                                                    <button className="text-green-600 hover:bg-green-50 p-2 rounded-full" title="Approve">
                                                        <CheckCircle size={20} />
                                                    </button>
                                                </form>
                                                <form action={async () => {
                                                    "use server";
                                                    await updateLeaveStatus(leave._id, "Rejected");
                                                }}>
                                                    <button className="text-red-600 hover:bg-red-50 p-2 rounded-full" title="Reject">
                                                        <XCircle size={20} />
                                                    </button>
                                                </form>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        Pending: "bg-yellow-100 text-yellow-700",
        Approved: "bg-green-100 text-green-700",
        Rejected: "bg-red-100 text-red-700",
        Cancelled: "bg-gray-100 text-gray-700"
    };
    // @ts-ignore
    const css = styles[status] || styles.Pending;

    return (
        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${css}`}>
            {status === "Pending" && <Clock size={12} />}
            {status}
        </span>
    );
}
