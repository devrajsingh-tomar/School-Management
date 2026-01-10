import { getFinanceStats } from "@/lib/actions/finance.actions";
import Link from "next/link";
import {
    CreditCard,
    TrendingUp,
    DollarSign,
    Calendar,
    ArrowRight,
    Plus
} from "lucide-react";

export default async function FinancePage() {
    const stats = await getFinanceStats();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Finance Dashboard</h1>
                    <p className="text-gray-500">Overview of fees collection and dues.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/school/finance/structure">
                        <button className="bg-white border text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition flex items-center gap-2">
                            Fee Structure
                        </button>
                    </Link>
                    <Link href="/school/finance/collect">
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition flex items-center gap-2">
                            <Plus size={18} />
                            Collect Fees
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Today's Collection"
                    value={`₹ ${stats.today.toLocaleString()}`}
                    icon={<CreditCard className="text-blue-500" />}
                    bg="bg-blue-50"
                    sub="received today"
                />
                <StatsCard
                    title="This Month"
                    value={`₹ ${stats.month.toLocaleString()}`}
                    icon={<Calendar className="text-green-500" />}
                    bg="bg-green-50"
                    sub="received this month"
                />
                <StatsCard
                    title="Total Pending"
                    value="-- *"
                    icon={<TrendingUp className="text-red-500" />}
                    bg="bg-red-50"
                    sub="calculation heavy *"
                />
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                    <Link href="/school/finance/transactions" className="text-indigo-600 text-sm hover:underline">
                        View All
                    </Link>
                </div>
                <div className="divide-y">
                    {stats.recent.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No transactions found.</div>
                    ) : (
                        stats.recent.map((txn: any) => (
                            <div key={txn._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600`}>
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {txn.student?.firstName} {txn.student?.lastName}
                                            <span className="text-gray-400 text-xs ml-2">({txn.student?.admissionNumber})</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(txn.date).toLocaleString()} • {txn.method} • {txn.receiptNumber}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold text-gray-800">
                                    ₹ {txn.amountPaid.toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, bg, sub }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
                <div className={`h-12 w-12 rounded-full ${bg} flex items-center justify-center`}>
                    {icon}
                </div>
                {/* <span className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded">+2.5%</span> */}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 my-1">{value}</h3>
                <p className="text-xs text-gray-400">{sub}</p>
            </div>
        </div>
    );
}
