import { Suspense } from "react";
import { getEnquiries } from "@/lib/actions/enquiry.actions";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import {
    Users,
    UserPlus,
    FileText,
    Calendar,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";

export default async function AdmissionsPage() {
    const data = await getEnquiries({ limit: 5 });
    const stats = data.stats;

    const totalEnquiries = data.total;
    const newEnquiries = stats.find((s: any) => s._id === "New")?.count || 0;
    const admitted = stats.find((s: any) => s._id === "Admitted")?.count || 0;
    const rejected = stats.find((s: any) => s._id === "Rejected")?.count || 0;
    const inPipeline = totalEnquiries - admitted - rejected;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admissions Dashboard</h1>
                    <p className="text-gray-500">Overview of student admissions and enquiries.</p>
                </div>
                <Link href="/school/admissions/enquiries/new">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition flex items-center gap-2">
                        <UserPlus size={18} />
                        New Enquiry
                    </button>
                </Link>
                <Link href="/school/admissions/pipeline" className="ml-2">
                    <button className="bg-white border text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-50 transition flex items-center gap-2">
                        <FileText size={18} />
                        Pipeline View
                    </button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Enquiries"
                    value={totalEnquiries}
                    icon={<Users className="text-blue-500" />}
                    bg="bg-blue-50"
                />
                <StatsCard
                    title="In Pipeline"
                    value={inPipeline}
                    icon={<Clock className="text-yellow-500" />}
                    bg="bg-yellow-50"
                />
                <StatsCard
                    title="Admitted"
                    value={admitted}
                    icon={<CheckCircle className="text-green-500" />}
                    bg="bg-green-50"
                />
                <StatsCard
                    title="Rejected"
                    value={rejected}
                    icon={<XCircle className="text-red-500" />}
                    bg="bg-red-50"
                />
            </div>

            {/* Recent Enquiries */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Recent Enquiries</h3>
                    <Link href="/school/admissions/enquiries" className="text-indigo-600 text-sm hover:underline">
                        View All
                    </Link>
                </div>
                <div className="divide-y">
                    {data.enquiries.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No enquiries found.</div>
                    ) : (
                        data.enquiries.map((enquiry: any) => (
                            <div key={enquiry._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {enquiry.studentName[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{enquiry.studentName}</div>
                                        <div className="text-sm text-gray-500">{enquiry.classAppliedFor?.name} • {format(new Date(enquiry.createdAt), "dd/MM/yyyy")}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <StatusBadge status={enquiry.status} />
                                    <Link href={`/school/admissions/enquiries/${enquiry._id}`} className="text-gray-400 hover:text-indigo-600">
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`h-12 w-12 rounded-full ${bg} flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        "New": "bg-blue-100 text-blue-800",
        "In Review": "bg-yellow-100 text-yellow-800",
        "Test Scheduled": "bg-purple-100 text-purple-800",
        "Interview Scheduled": "bg-orange-100 text-orange-800",
        "Selected": "bg-teal-100 text-teal-800",
        "Rejected": "bg-red-100 text-red-800",
        "Admitted": "bg-green-100 text-green-800",
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
            {status}
        </span>
    );
}
