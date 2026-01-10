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
import { Plus } from "lucide-react";
import StudentListFilters from "@/components/students/student-list-filters";

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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Students ({total})</h1>
                <Link href="/school/students/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                </Link>
            </div>

            <StudentListFilters classes={classes} />

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Admission #</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student: any) => (
                                <TableRow key={student._id}>
                                    <TableCell>{student.admissionNumber}</TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/school/students/${student._id}`}
                                            className="hover:underline font-medium text-blue-600"
                                        >
                                            {student.firstName} {student.lastName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {student.class?.name || "N/A"}{" "}
                                        {student.section?.name ? `(${student.section.name})` : ""}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${student.status === "Admitted"
                                                    ? "bg-green-100 text-green-800"
                                                    : student.status === "Enquiry"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {student.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{student.gender}</TableCell>
                                    <TableCell>
                                        <Link href={`/school/students/${student._id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center mt-4 gap-2">
                {currentPage > 1 && (
                    <Link
                        href={`/school/students?page=${currentPage - 1}&search=${query}&status=${status}&classId=${classId}`}
                    >
                        <Button variant="outline" size="sm">
                            Previous
                        </Button>
                    </Link>
                )}
                <span className="py-2 text-sm text-gray-500">
                    Page {currentPage} of {pages}
                </span>
                {currentPage < pages && (
                    <Link
                        href={`/school/students?page=${currentPage + 1}&search=${query}&status=${status}&classId=${classId}`}
                    >
                        <Button variant="outline" size="sm">
                            Next
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
