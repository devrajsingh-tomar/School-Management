import StudentForm from "@/components/forms/student-form";
import { getClasses } from "@/lib/actions/academic.actions";
import { getHouses, getCategories } from "@/lib/actions/master.actions";

export default async function CreateStudentPage() {
    const [classes, houses, categories] = await Promise.all([
        getClasses(),
        getHouses(),
        getCategories(),
    ]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
            <div className="border p-6 rounded-md bg-white">
                <StudentForm
                    classes={classes}
                    houses={houses}
                    categories={categories}
                />
            </div>
        </div>
    );
}
