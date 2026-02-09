"use client";

import { format } from "date-fns";

export function StudentStrengthTable({ data }: { data: any[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-600">
                    <tr>
                        <th className="p-3">Class</th>
                        <th className="p-3 text-center">Total Students</th>
                        <th className="p-3 text-center text-blue-600">Male</th>
                        <th className="p-3 text-center text-pink-600">Female</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.map((item: any) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                            <td className="p-3 font-semibold">{item.classDetails?.name}</td>
                            <td className="p-3 text-center font-bold">{item.total}</td>
                            <td className="p-3 text-center">{item.male}</td>
                            <td className="p-3 text-center">{item.female}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">No data available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function FeeCollectionSummary({ data }: { data: any[] }) {
    const total = data.reduce((acc, curr) => acc + curr.amount, 0);
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase">Total Collected (30d)</div>
                    <div className="text-3xl font-black text-green-600">₹{total.toLocaleString()}</div>
                </div>
            </div>
            <div className="space-y-2">
                {data.slice(-5).map((d: any) => (
                    <div key={d._id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{format(new Date(d._id), "dd/MM/yyyy")}</span>
                        <span className="font-mono font-bold">₹{d.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
