import { Suspense } from "react";
import Link from "next/link";
import { getStudents } from "@/lib/actions/student.actions";
import { getClasses } from "@/lib/actions/academic.actions";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, MoreHorizontal } from "lucide-react";
import StudentListFilters from "@/components/students/student-list-filters";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string; status?: string; classId?: string };
}) {
    const query = searchParams?.search || "";
    const currentPage = Number(searchParams?.page) || 1;
    const status = searchParams?.status || "";
    const classId = searchParams?.classId || "";

    const [data, classes] = await Promise.all([
        getStudents({
            page: currentPage,
            search: query,
            status,
            classId
        }),
        getClasses()
    ]);

    const { students, total, pages } = data;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader title="Students" description={`Manage ${total} student records.`}>
                <Link href="/school/students/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                </Link>
            </PageHeader>

            <div className="space-y-4">
                <Card>
                    <CardContent className="p-4">
                        <StudentListFilters classes={classes} />
                    </CardContent>
                </Card>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Admission</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student: any) => (
                                    <TableRow key={student._id}>
                                        <TableCell className="font-medium">{student.admissionNumber}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <Link
                                                    href={`/school/students/${student._id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {student.firstName} {student.lastName}
                                                </Link>
                                                <span className="text-xs text-muted-foreground">{student.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {student.class?.name || "N/A"}{" "}
                                                {student.section?.name ? `(${student.section.name})` : ""}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={student.status === "Admitted" ? "default" : "secondary"}
                                            >
                                                {student.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{student.gender}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/school/students/${student._id}`}>View Profile</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/school/students/${student._id}/edit`}>Edit Details</Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Pagination */}
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        asChild={currentPage > 1}
                    >
                        {currentPage > 1 ? (
                            <Link href={`/school/students?page=${currentPage - 1}&search=${query}&status=${status}&classId=${classId}`}>
                                Previous
                            </Link>
                        ) : <span>Previous</span>}
                    </Button>
                    <div className="text-sm font-medium">
                        Page {currentPage} of {pages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= pages}
                        asChild={currentPage < pages}
                    >
                        {currentPage < pages ? (
                            <Link href={`/school/students?page=${currentPage + 1}&search=${query}&status=${status}&classId=${classId}`}>
                                Next
                            </Link>
                        ) : <span>Next</span>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
