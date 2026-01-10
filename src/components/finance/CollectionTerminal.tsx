"use client";

import { useState, useTransition } from "react";
import { calculateStudentDues, collectFee, waiveFee } from "@/lib/actions/finance.actions";
import { Search, Calculator, CheckCircle, Loader2, Printer, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CollectionTerminal() { // Renamed for clarity in imports if needed, essentially a Page internal component
    const [searchId, setSearchId] = useState("");
    const [duesData, setDuesData] = useState<any>(null);
    const [isSearching, startSearch] = useTransition();
    const [isPaying, startPayment] = useTransition();
    const [isWaiving, startWaiver] = useTransition();

    // Payment Form
    const [amountToPay, setAmountToPay] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [lastReceipt, setLastReceipt] = useState<any>(null);

    // Waiver Form
    const [showWaiver, setShowWaiver] = useState(false);
    const [waiverReason, setWaiverReason] = useState("");

    const handleSearch = () => {
        setDuesData(null);
        setLastReceipt(null);
        startSearch(async () => {
            try {
                // In real app, search logic might start with finding ID by name, then passing ID here.
                // Assuming Admin inputs Student ID (MongoDB ID) directly for this rapid prototype, 
                // OR we can add a robust search dropdown. Let's stick to ID or direct search if implemented.
                // NOTE: User probably doesn't know MongoID. 
                // Suggestion: Search by Admission Number logic is better but requires that action.
                // For now, let's assume valid ID is pasted or provided.

                // Correction: calculateStudentDues expects _id. 
                // Let's rely on a separate search component or assume we know the ID for testing.
                const data = await calculateStudentDues(searchId);
                setDuesData(data);
                setAmountToPay(data.summary.balanceDue > 0 ? data.summary.balanceDue : 0);
            } catch (e) {
                alert("Student not found or invalid ID");
            }
        })
    };

    const handlePayment = async () => {
        if (amountToPay <= 0) return;

        startPayment(async () => {
            const receipt = await collectFee({
                studentId: searchId,
                amount: amountToPay,
                method: paymentMethod
            });

            setLastReceipt(receipt);
            setDuesData(null); // Clear dues view
            // alert(`Payment Recorded! Receipt: ${receipt.receiptNumber}`);
        });
    };

    const handleWaiver = async () => {
        if (amountToPay <= 0 || !waiverReason) return;

        startWaiver(async () => {
            try {
                const receipt = await waiveFee({
                    studentId: searchId,
                    amount: amountToPay,
                    reason: waiverReason
                });
                setLastReceipt(receipt);
                setDuesData(null);
                setShowWaiver(false);
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Search & Pay */}
            <div className="lg:col-span-1 space-y-6">

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Student Search</h2>
                    <div className="flex gap-2">
                        <input
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Enter Student MongoID..." // Admission No lookup TODO
                            className="w-full border rounded p-2 text-sm"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching || !searchId}
                            className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">* Use Student ID from Students list for now</p>
                </div>

                {duesData && (
                    <div className="bg-white p-6 rounded-lg shadow border-2 border-indigo-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Calculator size={20} /> Collect Payment
                            </span>
                            <button
                                onClick={() => setShowWaiver(!showWaiver)}
                                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                                <ShieldAlert size={14} /> Grant Waiver
                            </button>
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Total Due</label>
                                <div className="text-2xl font-bold text-red-600">₹ {duesData.summary.balanceDue.toLocaleString()}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount {showWaiver ? "Attributes to Waiver" : "Received"}</label>
                                <input
                                    type="number"
                                    value={amountToPay}
                                    onChange={(e) => setAmountToPay(Number(e.target.value))}
                                    className="w-full border rounded p-2 text-lg font-semibold"
                                />
                            </div>

                            {showWaiver ? (
                                <div className="bg-red-50 p-3 rounded space-y-3">
                                    <label className="block text-sm font-semibold text-red-700">Waiver Reason</label>
                                    <input
                                        type="text"
                                        value={waiverReason}
                                        onChange={(e) => setWaiverReason(e.target.value)}
                                        placeholder="Authorized by Principal..."
                                        className="w-full border border-red-200 rounded p-2 text-sm"
                                    />
                                    <button
                                        onClick={handleWaiver}
                                        disabled={isWaiving || amountToPay <= 0 || !waiverReason}
                                        className="w-full py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isWaiving ? <Loader2 className="animate-spin" /> : "CONFIRM WAIVER"}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full border rounded p-2 bg-white"
                                        >
                                            <option>Cash</option>
                                            <option>Online</option>
                                            <option>Cheque</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={isPaying || amountToPay <= 0}
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isPaying ? <Loader2 className="animate-spin" /> : "CONFIRM PAYMENT"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {lastReceipt && (
                    <div className="bg-green-50 p-6 rounded-lg shadow border border-green-200 text-center">
                        <div className="flex justify-center mb-2">
                            <CheckCircle className="text-green-600" size={48} />
                        </div>
                        <h3 className="text-lg font-bold text-green-800">Payment Successful!</h3>
                        <p className="text-green-700">Receipt: {lastReceipt.receiptNumber}</p>
                        <p className="text-2xl font-bold my-2">₹ {lastReceipt.amountPaid}</p>

                        <a
                            href={`/api/finance/receipt/${lastReceipt._id}`}
                            target="_blank"
                            className="mt-4 flex items-center justify-center gap-2 w-full bg-white border border-green-600 text-green-600 py-2 rounded hover:bg-green-50 transition"
                        >
                            <Printer size={16} /> Print Receipt
                        </a>
                        <button
                            onClick={() => { setLastReceipt(null); setSearchId(""); }}
                            className="mt-2 text-sm text-gray-500 underline"
                        >
                            New Transaction
                        </button>
                    </div>
                )}
            </div>

            {/* Right: Dues Breakdown */}
            <div className="lg:col-span-2">
                {duesData ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{duesData.student.firstName} {duesData.student.lastName}</h3>
                                <p className="text-gray-500">{duesData.student.admissionNumber}</p>
                            </div>
                            {duesData.summary.siblingDiscountPercent > 0 && (
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                                    Sibling Discount Active (-{duesData.summary.siblingDiscountPercent}%)
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            <h4 className="font-semibold text-gray-700 mb-3">Fee Breakdown</h4>
                            <table className="w-full text-sm border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-left">Fee Head</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-right">Discount</th>
                                        <th className="p-3 text-right">Net Payable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {duesData.breakdown.map((item: any, i: number) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-3">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.type} • {item.frequency}</div>
                                            </td>
                                            <td className="p-3 text-right">₹ {item.amount}</td>
                                            <td className="p-3 text-right text-red-500">- ₹ {item.discountApplied}</td>
                                            <td className="p-3 text-right font-bold">₹ {item.finalAmount}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="p-3">Total Payable</td>
                                        <td className="p-3 text-right">₹ {duesData.summary.totalFees}</td>
                                        <td className="p-3 text-right text-red-500">- ₹ {duesData.summary.totalDiscount}</td>
                                        <td className="p-3 text-right text-lg">₹ {duesData.summary.netPayable}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="mt-6">
                                <h4 className="font-semibold text-gray-700 mb-3">Payment History</h4>
                                <table className="w-full text-sm text-gray-600">
                                    <tbody>
                                        {duesData.history.length === 0 ? (
                                            <tr><td className="py-2 italic">No previous payments.</td></tr>
                                        ) : (
                                            duesData.history.map((pay: any) => (
                                                <tr key={pay._id} className="border-b last:border-0 hover:bg-gray-50">
                                                    <td className="py-2">{new Date(pay.date).toLocaleDateString()}</td>
                                                    <td className="py-2 font-medium">{pay.receiptNumber}</td>
                                                    <td className="py-2">{pay.method}</td>
                                                    <td className="py-2 text-right text-green-600 font-bold">₹ {pay.amountPaid}</td>
                                                </tr>
                                            ))
                                        )}
                                        <tr className="border-t font-bold text-gray-800">
                                            <td colSpan={3} className="py-3 text-right">Total Paid</td>
                                            <td className="py-3 text-right">₹ {duesData.summary.totalPaid}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg h-full flex items-center justify-center p-12 text-gray-400">
                        Select a student to view financial details
                    </div>
                )}
            </div>
        </div>
    );
}
