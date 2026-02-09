import StudentForm from "@/components/forms/student-form";

export default function CreateStudentPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
            <div className="border p-6 rounded-md bg-white">
                <StudentForm />
            </div>
        </div>
    );
}
