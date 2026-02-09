import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getExamWithResults } from "@/lib/actions/exam.actions";
import { ResultsView } from "@/components/school/exams/results-view";
import { PageHeader } from "@/components/ui/page-header";

export default async function ExamResultsPage({
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

    // Sort students by rank (if exists) or name
    // Merging result status into student list order
    // But ResultsView handles mapping via student list + result lookup
    // Ideally we sort the display list by Rank if published, else Roll No.
    // Let's pass data as is, let View handle if it wants to sort, 
    // BUT user often wants to see Rank list top-down.

    // Sort logic:
    // 1. If results exist, sort by totalObtained DESC
    // 2. Else sort by Roll Number

    const { exam, students, results } = data;

    // Create a map to attach result to student for sorting
    const studentsWithScore = students.map((s: any) => {
        const res = results.find((r: any) => r.student === s._id);
        return {
            ...s,
            _total: res ? res.totalObtained : -1,
            _rank: res ? res.rank : 99999
        };
    });

    const sortedStudents = studentsWithScore.sort((a: any, b: any) => {
        // If ranks exist (published), use rank
        if (a._rank !== 99999 || b._rank !== 99999) {
            return a._rank - b._rank;
        }
        // Fallback to total score descending
        if (b._total !== a._total) {
            return b._total - a._total;
        }
        // Fallback to name
        return a.firstName.localeCompare(b.firstName);
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Exam Results"
                description={`Result Sheet for ${exam.name}`}
                showBackButton
            />

            <ResultsView
                exam={exam}
                students={sortedStudents}
                results={results}
            />
        </div>
    );
}
