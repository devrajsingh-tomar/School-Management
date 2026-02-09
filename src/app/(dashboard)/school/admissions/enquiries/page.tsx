import { getEnquiries } from "@/lib/actions/enquiry.actions";
import Link from "next/link";
import { Search, Filter, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EnquiryStatus } from "@/lib/types/enums";
import { format } from "date-fns";

export default async function EnquiriesListPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        status?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query || "";
    const page = Number(params?.page) || 1;
    const status = params?.status || "";

    const { enquiries, total, pages } = await getEnquiries({
        page,
        limit: 10,
        search: query,
        status: status === "All" ? "" : status
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Enquiries"
                description="Manage all student enquiries and applications"
                showBackButton
                autoBreadcrumb
            >
                <Button asChild>
                    <Link href="/school/admissions/enquiries/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Enquiry
                    </Link>
                </Button>
            </PageHeader>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <form action={async (formData) => {
                        "use server";
                        const q = formData.get("query");
                        redirect(`/school/admissions/enquiries?query=${q}&status=${status}`);
                    }}>
                        <input
                            name="query"
                            defaultValue={query}
                            placeholder="Search by name, email, phone..."
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </form>
                </div>

                <div className="w-full md:w-48 relative">
                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <form>
                        {/* This is a bit hacky for server components without client logic, ideally use client comp for filters */}
                        <select
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                            defaultValue={status}
                            name="status"
                        // On change would need JS, so wrapping in form for enter key or use client component
                        >
                            <option value="">All Statuses</option>
                            <option value="New">New</option>
                            <option value="In Review">In Review</option>
                            <option value="Test Scheduled">Test Scheduled</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Admitted">Admitted</option>
                        </select>
                    </form>
                </div>
            </div>

            {/* Alert for Status Filter Interaction */}
            <div className="text-xs text-gray-500">
                * Press Enter in search box to apply filters.
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                            <th className="p-4 font-medium">Student Name</th>
                            <th className="p-4 font-medium">Class</th>
                            <th className="p-4 font-medium">Parent Info</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Applied Date</th>
                            <th className="p-4 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm text-gray-700">
                        {enquiries.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">No enquiries found.</td>
                            </tr>
                        ) : (
                            enquiries.map((enquiry: any) => (
                                <tr key={enquiry._id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{enquiry.studentName}</td>
                                    <td className="p-4">{enquiry.classAppliedFor?.name}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{enquiry.parentName}</div>
                                        <div className="text-gray-500 text-xs">{enquiry.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={enquiry.status} />
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {format(new Date(enquiry.createdAt), "dd/MM/yyyy")}
                                    </td>
                                    <td className="p-4">
                                        <Link
                                            href={`/school/admissions/enquiries/${enquiry._id}`}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            View
                                        </Link>
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
                            href={`/school/admissions/enquiries?page=${i + 1}&query=${query}&status=${status}`}
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
