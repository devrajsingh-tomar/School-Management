import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Trophy, Calendar, CheckCircle, Clock } from "lucide-react";
import { getStudentResults } from "@/lib/actions/exam.actions";
import { format } from "date-fns";

export default async function ResultsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/school/login");
    }

    const studentId = session.user.linkedStudentId;
    const schoolId = session.user.schoolId;

    if (!studentId || !schoolId) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Unable to load results. Missing student or school information.
            </div>
        );
    }

    const results = await getStudentResults(studentId, schoolId);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Exam Results</h2>

            {results.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-pink-500" />
                            Academic Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="min-h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed border-2 rounded-lg">
                            No published results available yet.
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {results.map((result: any) => (
                        <Card key={result._id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{result.exam?.name}</CardTitle>
                                        <CardDescription className="uppercase text-xs font-semibold mt-1">
                                            {result.exam?.type}
                                        </CardDescription>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-2xl font-bold 
                                            ${result.status === 'PASS' ? 'text-green-600' : 'text-red-600'}
                                        `}>
                                            {result.grade}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-medium">
                                            {result.percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-center py-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Obtained</p>
                                            <p className="font-semibold text-lg">{result.totalObtained}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Total</p>
                                            <p className="font-semibold text-lg">{result.totalMax}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Rank</p>
                                            <div className="flex items-center justify-center gap-1 font-semibold text-lg text-violet-600">
                                                {result.rank > 0 ? (
                                                    <>
                                                        <Trophy className="h-3 w-3" />
                                                        #{result.rank}
                                                    </>
                                                ) : "-"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium mb-2">Subject Breakdown</p>
                                        {result.subjectScores.map((score: any, i: number) => (
                                            <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0 border-dashed">
                                                <span className="text-gray-600">{score.subject}</span>
                                                <span className="font-medium">{score.marksObtained}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-2 text-xs text-gray-400 flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        Exam Date: {result.exam?.startDate ? format(new Date(result.exam.startDate), 'PPP') : 'N/A'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
