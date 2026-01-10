import { getStudentById } from "@/lib/actions/student.actions";
import { getStudentDocuments } from "@/lib/actions/document.actions";
import { Button } from "@/components/ui/button";
import GuardianManager from "@/components/students/guardian-manager";
import DocumentManager from "@/components/students/document-manager";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, FileText } from "lucide-react";
import { format } from "date-fns";

export default async function StudentProfilePage({
    params,
}: {
    params: { id: string };
}) {
    const [student, documents] = await Promise.all([
        getStudentById(params.id),
        getStudentDocuments(params.id),
    ]);

    if (!student) {
        notFound();
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-2xl">
                        {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{student.firstName} {student.lastName}</h1>
                        <p className="text-gray-500">Admission No: {student.admissionNumber} • Roll No: {student.rollNumber || "N/A"}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">Class {student.class?.name} - {student.section?.name}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">{student.status}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/school/students/${student._id}/edit`}>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" /> Edit Profile
                        </Button>
                    </Link>
                    {/* Certificate Buttons */}
                    <a href={`/api/students/${student._id}/certificate?type=BONAFIDE`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" /> Bonafide
                        </Button>
                    </a>
                    <a href={`/api/students/${student._id}/certificate?type=TC`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" /> TC
                        </Button>
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Personal Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border rounded-md p-4 bg-white">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <span className="text-gray-500 block">Date of Birth</span>
                                <span className="font-medium">{format(new Date(student.dob), "dd MMM yyyy")}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Gender</span>
                                <span className="font-medium">{student.gender}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Email</span>
                                <span className="font-medium">{student.email || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Phone</span>
                                <span className="font-medium">{student.phone || "N/A"}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 block">Address</span>
                                <span className="font-medium">
                                    {[
                                        student.address?.street,
                                        student.address?.city,
                                        student.address?.state,
                                        student.address?.zipCode
                                    ].filter(Boolean).join(", ") || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-md p-4 bg-white">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Academic Details</h2>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <span className="text-gray-500 block">House</span>
                                <span className="font-medium">{student.house?.name || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Category</span>
                                <span className="font-medium">{student.category?.name || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Guardians & Documents */}
                <div className="space-y-6">
                    <div className="border rounded-md p-4 bg-white">
                        <GuardianManager studentId={student._id} guardians={student.guardians || []} />
                    </div>
                    <div className="border rounded-md p-4 bg-white">
                        <DocumentManager studentId={student._id} documents={documents} />
                    </div>
                </div>
            </div>
        </div>
    );
}
