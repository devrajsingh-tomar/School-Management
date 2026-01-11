import { getStudentById } from "@/lib/actions/student.actions";
import { getStudentDocuments } from "@/lib/actions/document.actions";
import { getAttendanceTrends } from "@/lib/actions/reports.actions";
import { getStudentActivity } from "@/lib/actions/audit.actions";
import { Button } from "@/components/ui/button";
import GuardianManager from "@/components/students/guardian-manager";
import DocumentManager from "@/components/students/document-manager";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, FileText, Download, Calendar, GraduationCap, DollarSign, Activity } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentTimeline } from "@/components/student/timeline";

export default async function StudentProfilePage({
    params,
}: {
    params: { id: string };
}) {
    const [student, documents, activityRes] = await Promise.all([
        getStudentById(params.id),
        getStudentDocuments(params.id),
        getStudentActivity(params.id)
    ]);

    if (!student) {
        notFound();
    }

    const activity = activityRes.success ? activityRes.data : [];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                        {/* Placeholder for student image if exists */}
                        <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                            {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{student.firstName} {student.lastName}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>Admission #{student.admissionNumber}</span>
                            <span>•</span>
                            <span>Class {student.class?.name} - {student.section?.name}</span>
                            <span>•</span>
                            <Badge variant={student.status === "Admitted" ? "default" : "secondary"}>
                                {student.status}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href={`/school/students/${student._id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    </Link>
                    <DropdownActionMenu studentId={student._id} />
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="academics">Academics</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="finance">Fees & Accounts</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Roll Number</CardTitle>
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{student.rollNumber || "N/A"}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">92%</div>
                                <p className="text-xs text-muted-foreground">Present Days</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">₹2,500</div>
                                <p className="text-xs text-muted-foreground">Due safely</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                        <dd className="mt-1 text-sm font-semibold">{student.email || "-"}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                                        <dd className="mt-1 text-sm font-semibold">{student.phone || "-"}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                                        <dd className="mt-1 text-sm font-semibold">{format(new Date(student.dob), "PPP")}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                                        <dd className="mt-1 text-sm font-semibold">{student.gender}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                                        <dd className="mt-1 text-sm font-semibold">
                                            {[
                                                student.address?.street,
                                                student.address?.city,
                                                student.address?.state,
                                                student.address?.zipCode
                                            ].filter(Boolean).join(", ")}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Timeline</CardTitle>
                                <CardDescription>Latest activities for this student</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StudentTimeline events={activity} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ACADEMICS TAB */}
                <TabsContent value="academics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-muted-foreground">House</dt>
                                    <dd className="mt-1 text-sm font-semibold">{student.house?.name || "-"}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                                    <dd className="mt-1 text-sm font-semibold">{student.category?.name || "-"}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Guardian Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GuardianManager studentId={student._id} guardians={student.guardians || []} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentManager studentId={student._id} documents={documents} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Placeholders for others */}
                <TabsContent value="attendance">
                    <Card>
                        <CardHeader><CardTitle>Attendance Record</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Attendance module integration pending view.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="finance">
                    <Card>
                        <CardHeader><CardTitle>Fee History</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Fee record integration pending view.</p></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function DropdownActionMenu({ studentId }: { studentId: string }) {
    return (
        <div className="flex gap-2">
            <a href={`/api/students/${studentId}/certificate?type=BONAFIDE`} target="_blank">
                <Button variant="ghost" size="icon" title="Download Bonafide">
                    <FileText className="h-4 w-4" />
                </Button>
            </a>
        </div>
    );
}
