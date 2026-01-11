import { getExamById, getMarksForExam } from "@/lib/actions/exam.actions";
import { BarChart, Users, TrendingUp, AlertCircle, CheckCircle2, Award } from "lucide-react";
import Link from "next/link";

export default async function ExamAnalyticsPage({ params }: { params: { id: string } }) {
    const exam = await getExamById(params.id);
    const results = await getMarksForExam(params.id);

    if (results.length === 0) return (
        <div className="p-12 text-center bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">No Data Available</h2>
            <p className="text-gray-500">Results must be entered and published to view analytics.</p>
        </div>
    );

    // Calculate Analytics
    const totalStudents = results.length;
    const passedStudents = results.filter((r: any) => r.status === "PASS").length;
    const failedStudents = totalStudents - passedStudents;
    const passPercentage = (passedStudents / totalStudents) * 100;

    const averagePercentage = results.reduce((acc: number, r: any) => acc + r.percentage, 0) / totalStudents;
    const highestPercentage = Math.max(...results.map((r: any) => r.percentage));

    // Subject wise averages
    const subjectWise: Record<string, { total: number, count: number }> = {};
    results.forEach((res: any) => {
        res.subjectScores.forEach((s: any) => {
            if (!subjectWise[s.subject]) subjectWise[s.subject] = { total: 0, count: 0 };
            subjectWise[s.subject].total += s.marksObtained;
            subjectWise[s.subject].count += 1;
        });
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Exam Analytics: {exam.name}</h1>
                <Link href={`/school/exams/${params.id}/results`} className="text-indigo-600 hover:underline">
                    Back to Result Sheet
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Users size={24} /></div>
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Class Strength</div>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-full"><TrendingUp size={24} /></div>
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Pass Percentage</div>
                        <div className="text-2xl font-bold">{passPercentage.toFixed(1)}%</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><TrendingUp size={24} /></div>
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Class Average</div>
                        <div className="text-2xl font-bold">{averagePercentage.toFixed(1)}%</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full"><Award size={24} /></div>
                    <div>
                        <div className="text-sm text-gray-500 font-medium">Highest Score</div>
                        <div className="text-2xl font-bold">{highestPercentage.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pass/Fail Ratio */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-600" /> Result Breakdown
                    </h3>
                    <div className="flex items-center gap-8">
                        <div className="w-32 h-32 rounded-full border-8 border-green-500 border-l-red-500 flex items-center justify-center font-bold text-xl relative" style={{
                            background: `conic-gradient(#10B981 ${passPercentage}%, #EF4444 0)`
                        }}>
                            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                {passPercentage.toFixed(0)}%
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /> Passed: {passedStudents}</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /> Failed: {failedStudents}</div>
                        </div>
                    </div>
                </div>

                {/* Subject Performance */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <BarChart size={18} className="text-indigo-600" /> Subject-wise Performance
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(subjectWise).map(([subj, data]: [string, any]) => {
                            const subDef = exam.subjects.find((s: any) => s.name === subj);
                            const maxMarks = subDef ? subDef.maxMarks : 100;
                            const avg = (data.total / data.count);
                            const percent = (avg / maxMarks) * 100;

                            return (
                                <div key={subj}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{subj}</span>
                                        <span className="text-gray-500">{avg.toFixed(1)} / {maxMarks} ({percent.toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${percent > 75 ? 'bg-green-500' : percent > 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
