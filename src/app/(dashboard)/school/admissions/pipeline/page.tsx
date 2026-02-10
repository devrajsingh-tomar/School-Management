import { getEnquiries } from "@/lib/actions/admissions.actions";
import Link from "next/link";
import { format } from "date-fns";
import { AdmitButton } from "./admit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdmissionsPipelinePage() {
    const { data: enquiries } = await getEnquiries("ALL");
    const allEnquiries = enquiries || [];

    const columns = [
        { id: "New", label: "New", color: "bg-blue-50 border-blue-100" },
        { id: "In Review", label: "In Review", color: "bg-yellow-50 border-yellow-100" },
        { id: "Test Scheduled", label: "Test / Interview", color: "bg-purple-50 border-purple-100" }, // Combined for simplicity or split if needed
        { id: "Selected", label: "Selected", color: "bg-teal-50 border-teal-100" }
    ];

    const getColumnEnquiries = (status: string) => {
        if (status === "Test Scheduled") {
            return allEnquiries.filter((e: any) => e.status === "Test Scheduled" || e.status === "Interview Scheduled");
        }
        return allEnquiries.filter((e: any) => e.status === status);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admissions Pipeline</h1>
                    <p className="text-gray-500">Track candidates from enquiry to admission.</p>
                </div>
                <Link href="/school/admissions">
                    <button className="text-sm text-indigo-600 hover:underline">Back to Dashboard</button>
                </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-4 h-full min-w-[1000px] px-2 pb-4">
                    {columns.map((col) => (
                        <div key={col.id} className={`flex-1 flex flex-col rounded-xl border ${col.color} min-w-[280px]`}>
                            <div className="p-3 border-b border-gray-200/50 flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-t-xl">
                                <h3 className="font-semibold text-gray-700">{col.label}</h3>
                                <Badge variant="secondary" className="bg-white">{getColumnEnquiries(col.id).length}</Badge>
                            </div>
                            <div className="p-2 flex-1 overflow-y-auto space-y-3">
                                {getColumnEnquiries(col.id).map((enquiry: any) => (
                                    <PipelineCard key={enquiry._id} enquiry={enquiry} />
                                ))}
                                {getColumnEnquiries(col.id).length === 0 && (
                                    <div className="text-center text-gray-400 py-10 text-sm">No items</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PipelineCard({ enquiry }: { enquiry: any }) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
            <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-900 line-clamp-1">{enquiry.studentName}</div>
                    {/* Link to details? */}
                </div>
                <div className="text-xs text-gray-500">
                    <p>{enquiry.classAppliedFor?.name || "No Class"}</p>
                    <p>{format(new Date(enquiry.createdAt), "dd/MM/yyyy")}</p>
                </div>

                {enquiry.status === "Selected" && (
                    <div className="pt-2 border-t mt-2">
                        <AdmitButton enquiryId={enquiry._id} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
