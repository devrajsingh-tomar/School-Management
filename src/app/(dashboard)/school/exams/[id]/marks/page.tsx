import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getExamWithResults } from "@/lib/actions/exam.actions";
import { MarksEntryForm } from "@/components/school/exams/marks-entry-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function MarksEntryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.schoolId) {
        redirect("/school/login");
    }

    const data = await getExamWithResults(id);

    if (!data) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Exam not found
            </div>
        );
    }

    const { exam, students, results } = data;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Marks Entry"
                description={`Enter marks for ${exam.name}`}
                showBackButton
            />

            <MarksEntryForm
                exam={exam}
                students={students}
                existingResults={results}
            />
        </div>
    );
}
