import StudentForm from "@/components/forms/student-form";
import { getStudentById } from "@/lib/actions/student.actions";
import { notFound } from "next/navigation";

export default async function EditStudentPage({
    params,
}: {
    params: { id: string };
}) {
    const student = await getStudentById(params.id);

    if (!student) {
        notFound();
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Student</h1>
            <div className="border p-6 rounded-md bg-white">
                <StudentForm initialData={student} />
            </div>
        </div>
    );
}
