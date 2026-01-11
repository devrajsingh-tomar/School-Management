import { getStudentsOnRoute, getRoutes } from "@/lib/actions/transport.actions";
import Link from "next/link";
import { ArrowLeft, Printer, User } from "lucide-react";
import TransportRoute from "@/lib/db/models/TransportRoute";
import connectDB from "@/lib/db/connect";

export default async function RouteStudentsPage({ params }: { params: { id: string } }) {
    await connectDB();
    const route = await TransportRoute.findById(params.id).lean();
    if (!route) return <div>Route not found</div>;

    const students = await getStudentsOnRoute(params.id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/school/transport" className="text-gray-500 hover:text-indigo-600">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{route.name}</h1>
                        <p className="text-gray-500">{students.length} Students Allocated • {route.vehicleNumber}</p>
                    </div>
                </div>
                <button className="bg-white text-gray-600 border px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-50">
                    <Printer size={18} /> Print Manifest
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Admission No</th>
                            <th className="p-4">Student</th>
                            <th className="p-4">Class</th>
                            <th className="p-4">Stop</th>
                            <th className="p-4">Guardian Phone</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {students.length === 0 ? (
                            <tr><td colSpan={5} className="p-12 text-center text-gray-400">No students assigned to this route yet.</td></tr>
                        ) : (
                            students.map((student: any) => (
                                <tr key={student._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-500">{student.admissionNumber}</td>
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <User size={14} />
                                        </div>
                                        {student.firstName} {student.lastName}
                                    </td>
                                    <td className="p-4">{student.class?.name}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-bold border border-blue-100">
                                            {student.transportStop || "Default"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{student.phone || "N/A"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2">Driver Info</h4>
                    <p className="text-sm text-indigo-800"><b>Name:</b> {route.driverName}</p>
                    <p className="text-sm text-indigo-800"><b>Phone:</b> {route.driverPhone}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h4 className="font-bold text-yellow-900 mb-2">Vehicle Info</h4>
                    <p className="text-sm text-yellow-800"><b>Number:</b> {route.vehicleNumber}</p>
                    <p className="text-sm text-yellow-800"><b>Capacity:</b> {route.capacity} Seats</p>
                </div>
            </div>
        </div>
    );
}
