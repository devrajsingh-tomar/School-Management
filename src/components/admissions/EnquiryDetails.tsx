"use client";

import { useState, useTransition } from "react";
import {
    updateEnquiryStatus,
    scheduleTest,
    convertEnquiryToStudent,
    updateEnquiry
} from "@/lib/actions/enquiry.actions";
import { EnquiryStatus } from "@/lib/types/enums";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    Check,
    X,
    UserCheck,
    FileText,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function EnquiryDetails({ enquiry }: { enquiry: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showTestModal, setShowTestModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);

    // Test Modal State
    const [testDate, setTestDate] = useState("");

    // Convert Modal State
    const [admissionNumber, setAdmissionNumber] = useState("");

    const handleStatusChange = (status: EnquiryStatus) => {
        startTransition(async () => {
            await updateEnquiryStatus(enquiry._id, status);
            // Toaster here ideally
        });
    };

    const handleScheduleTest = async () => {
        if (!testDate) return;
        startTransition(async () => {
            await scheduleTest(enquiry._id, new Date(testDate));
            setShowTestModal(false);
        });
    };

    const handleConvert = async () => {
        if (!admissionNumber) return;
        startTransition(async () => {
            try {
                await convertEnquiryToStudent(enquiry._id, admissionNumber);
                setShowConvertModal(false);
                router.push("/school/students"); // Redirect to students list
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <Link href="/school/admissions/enquiries" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-4">
                <ArrowLeft size={18} className="mr-1" /> Back to Enquiries
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{enquiry.studentName}</h1>
                    <p className="text-gray-500 mt-1">
                        Application for <span className="font-semibold text-indigo-600">{enquiry.classAppliedFor?.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Student Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Gender" value={enquiry.gender} />
                            <DetailItem label="Date of Birth" value={format(new Date(enquiry.dob), "dd/MM/yyyy")} />
                            <DetailItem label="Previous School" value={enquiry.previousSchool || "N/A"} />
                            <DetailItem label="Applied Date" value={format(new Date(enquiry.createdAt), "dd/MM/yyyy")} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Parent / Guardian</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Parent Name" value={enquiry.parentName} />
                            <DetailItem label="Phone" value={enquiry.phone} />
                            <DetailItem label="Email" value={enquiry.email || "N/A"} />
                            <DetailItem label="Address" value={enquiry.address} className="col-span-2" />
                        </div>
                    </div>

                    {(enquiry.testDate || enquiry.testScore != null) && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Test & Interview Results</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {enquiry.testDate && <DetailItem label="Test Date" value={format(new Date(enquiry.testDate), "dd/MM/yyyy h:mm a")} />}
                                <DetailItem label="Test Score" value={enquiry.testScore ?? "Not Graded"} />
                                <DetailItem label="Result" value={enquiry.examResult || "Pending"} />
                                <DetailItem label="Interview Notes" value={enquiry.interviewNotes || "None"} className="col-span-2" />
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Documents</h3>
                        {enquiry.documents && enquiry.documents.length > 0 ? (
                            <ul className="space-y-2">
                                {enquiry.documents.map((doc: any, i: number) => (
                                    <li key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                        <span className="font-medium">{doc.name}</span>
                                        <a href={doc.url} target="_blank" className="text-indigo-600 hover:underline text-sm">View</a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No documents attached.</p>
                        )}
                        <div className="mt-4 pt-4 border-t text-sm text-gray-400">
                            * Document upload is handled via the Student Documents module after admission.
                        </div>
                    </div>

                </div>

                {/* Right Column: Actions */}
                <div className="lg:col-span-1 space-y-6">

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Pipeline Actions</h3>
                        <div className="flex flex-col gap-3">
                            {enquiry.status === "New" && (
                                <ActionButton
                                    onClick={() => handleStatusChange(EnquiryStatus.IN_REVIEW)}
                                    icon={<FileText size={16} />}
                                    label="Mark as In Review"
                                    disabled={isPending}
                                />
                            )}

                            {(enquiry.status === "New" || enquiry.status === "In Review") && (
                                <ActionButton
                                    onClick={() => setShowTestModal(true)}
                                    icon={<Calendar size={16} />}
                                    label="Schedule Test/Interview"
                                    disabled={isPending}
                                />
                            )}

                            {(enquiry.status === "Test Scheduled" || enquiry.status === "Interview Scheduled") && (
                                <>
                                    <ActionButton
                                        onClick={() => handleStatusChange(EnquiryStatus.SELECTED)}
                                        icon={<Check size={16} />}
                                        label="Select Student"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        disabled={isPending}
                                    />
                                    <div className="text-center text-xs text-gray-500 my-1">- OR -</div>
                                    <ActionButton
                                        onClick={() => handleStatusChange(EnquiryStatus.REJECTED)}
                                        icon={<X size={16} />}
                                        label="Reject Application"
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        disabled={isPending}
                                    />
                                </>
                            )}

                            {enquiry.status === "Selected" && (
                                <ActionButton
                                    onClick={() => setShowConvertModal(true)}
                                    icon={<UserCheck size={16} />}
                                    label="Convert to Student"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    disabled={isPending}
                                />
                            )}

                            {enquiry.status === "Admitted" && (
                                <div className="space-y-3">
                                    <div className="p-3 bg-green-50 text-green-700 rounded text-center font-medium">
                                        Student Admitted
                                    </div>
                                    <a
                                        href={`/api/admissions/${enquiry._id}/receipt`}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium transition shadow-sm bg-white border hover:bg-gray-50 text-gray-700"
                                    >
                                        <FileText size={16} />
                                        Download Receipt
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manual Status Override */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Manual Status Update</h3>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={enquiry.status}
                            onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
                            disabled={isPending || enquiry.status === "Admitted"}
                        >
                            {Object.values(EnquiryStatus).map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                </div>
            </div>

            {/* Test Modal */}
            {showTestModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Schedule Test / Interview</h3>
                        <input
                            type="datetime-local"
                            className="w-full border p-2 rounded mb-4"
                            onChange={(e) => setTestDate(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowTestModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={handleScheduleTest} disabled={!testDate || isPending} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Schedule</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Convert Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Admit Student</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            This will create a new Student profile and linked Guardian account.
                        </p>
                        <div className="space-y-2 mb-4">
                            <label className="text-sm font-medium">Assign Admission Number *</label>
                            <input
                                type="text"
                                value={admissionNumber}
                                onChange={(e) => setAdmissionNumber(e.target.value)}
                                placeholder="e.g. 2025-001"
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowConvertModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={handleConvert} disabled={!admissionNumber || isPending} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                                {isPending ? "Admitting..." : "Confirm Admission"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

function DetailItem({ label, value, className = "" }: any) {
    return (
        <div className={className}>
            <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
            <p className="text-gray-900 font-medium">{value}</p>
        </div>
    );
}

function ActionButton({ onClick, icon, label, className = "bg-white border hover:bg-gray-50 text-gray-700", disabled }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium transition shadow-sm ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {disabled ? <Loader2 className="animate-spin" size={16} /> : icon}
            {label}
        </button>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case "New": return "bg-blue-50 text-blue-700 border-blue-200";
        case "In Review": return "bg-yellow-50 text-yellow-700 border-yellow-200";
        case "Selected": return "bg-teal-50 text-teal-700 border-teal-200";
        case "Admitted": return "bg-green-50 text-green-700 border-green-200";
        case "Rejected": return "bg-red-50 text-red-700 border-red-200";
        default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
}
