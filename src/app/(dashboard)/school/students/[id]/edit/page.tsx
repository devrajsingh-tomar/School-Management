import StudentForm from "@/components/forms/student-form";
import { getClasses } from "@/lib/actions/academic.actions";
import { getHouses, getCategories } from "@/lib/actions/master.actions";
import { getStudentById } from "@/lib/actions/student.actions";
import { notFound } from "next/navigation";

export default async function EditStudentPage({
    params,
}: {
    params: { id: string };
}) {
    const [student, classes, houses, categories] = await Promise.all([
        getStudentById(params.id),
        getClasses(),
        getHouses(),
        getCategories(),
    ]);

    if (!student) {
        notFound();
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Student</h1>
            <div className="border p-6 rounded-md bg-white">
                <StudentForm
                    initialData={student}
                    classes={classes}
                    houses={houses}
                    categories={categories}
                />
            </div>
        </div>
    );
}
