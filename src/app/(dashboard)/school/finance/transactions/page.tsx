import { auth } from "@/auth";
import connectDB from "@/lib/db/connect";
import FeePayment from "@/lib/db/models/FeePayment";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import mongoose from "mongoose";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams?: Promise<{ page?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.schoolId) return <div>Unauthorized</div>;

    await connectDB();
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const payments = await FeePayment.find({ school: session.user.schoolId })
        .populate("student", "firstName lastName admissionNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await FeePayment.countDocuments({ school: session.user.schoolId });
    const pages = Math.ceil(total / limit);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Transaction History"
                description="All fee collections and waivers"
                showBackButton
                autoBreadcrumb
            >
                <Button variant="outline" className="gap-2">
                    <Download size={16} /> Export CSV
                </Button>
            </PageHeader>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-600 font-medium">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Receipt #</th>
                            <th className="p-4">Student</th>
                            <th className="p-4">Method</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4">Remarks</th>
                            <th className="p-4 text-center">Receipt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-gray-700">
                        {payments.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center text-gray-500">No transactions found.</td></tr>
                        ) : (
                            payments.map((p: any) => (
                                <tr key={p._id} className="hover:bg-gray-50">
                                    <td className="p-4">{format(new Date(p.date), "dd/MM/yyyy")} <span className="text-xs text-gray-400">{format(new Date(p.date), "h:mm a")}</span></td>
                                    <td className="p-4 font-mono text-xs">{p.receiptNumber}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{p.student?.firstName} {p.student?.lastName}</div>
                                        <div className="text-xs text-gray-500">{p.student?.admissionNumber}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.method === "Waiver" ? "bg-red-100 text-red-700" :
                                            p.method === "Online" ? "bg-blue-100 text-blue-700" :
                                                "bg-green-100 text-green-700"
                                            }`}>
                                            {p.method}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold">₹ {p.amountPaid.toLocaleString()}</td>
                                    <td className="p-4 text-gray-500 truncate max-w-xs" title={p.remarks}>{p.remarks || "-"}</td>
                                    <td className="p-4 text-center">
                                        <a href={`/api/finance/receipt/${p._id}`} target="_blank" className="text-indigo-600 hover:text-indigo-800 inline-block">
                                            <FileText size={18} />
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: pages }).map((_, i) => (
                        <Link
                            key={i}
                            href={`/school/finance/transactions?page=${i + 1}`}
                            className={`px-3 py-1 rounded border ${page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            {i + 1}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
