"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Lock, CheckCircle, Printer } from "lucide-react";
import { publishExamResults } from "@/lib/actions/exam.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";

interface ResultsViewProps {
    exam: any;
    students: any[];
    results: any[];
}

export function ResultsView({ exam, students, results }: ResultsViewProps) {
    const router = useRouter();
    const printRef = useRef(null);
    const handlePrint = useReactToPrint({
        // content: () => printRef.current, // Upgraded react-to-print has different API, if version mismatch, check.
        // Assuming compatible version or standard usage reference
        contentRef: printRef // newer standard
    });

    const handlePublish = async () => {
        try {
            await publishExamResults(exam._id);
            toast.success("Results published successfully!");
            router.refresh();
        } catch (error) {
            toast.error("Failed to publish results");
        }
    };

    // Helper to get result for student
    const getResult = (studentId: string) => results.find(r => r.student === studentId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handlePrint && handlePrint()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Sheet
                    </Button>
                    {/* Export CSV could be added here */}
                </div>

                {exam.isPublished ? (
                    <Button variant="ghost" className="text-green-600 bg-green-50 pointer-events-none">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Results Published
                    </Button>
                ) : (
                    <Button onClick={handlePublish}>
                        <Lock className="mr-2 h-4 w-4" />
                        Publish Results
                    </Button>
                )}
            </div>

            <Card ref={printRef} className="print:shadow-none print:border-none">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{exam.name} - Result Sheet</CardTitle>
                            <CardDescription>
                                Class: {exam.class.name} | Date: {format(new Date(exam.startDate), "dd/MM/yyyy")}
                            </CardDescription>
                        </div>
                        <div className="text-right hidden print:block">
                            <h3 className="font-bold text-xl">School Management System</h3>
                            <p className="text-sm text-gray-500">Official Result Sheet</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="min-w-[50px]">Rank</TableHead>
                                    <TableHead className="min-w-[200px]">Student Name</TableHead>
                                    <TableHead className="min-w-[80px]">Roll No</TableHead>
                                    {exam.subjects.map((sub: any) => (
                                        <TableHead key={sub.name} className="min-w-[80px] text-center">
                                            {sub.name}
                                            <span className="block text-[10px] text-gray-400">/{sub.maxMarks}</span>
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">%</TableHead>
                                    <TableHead className="text-center">Grade</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student: any) => {
                                    const result = getResult(student._id);
                                    if (!result) return null; // Or show absent row

                                    return (
                                        <TableRow key={student._id}>
                                            <TableCell className="font-bold text-gray-500">
                                                {result.rank > 0 ? `#${result.rank}` : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{student.firstName} {student.lastName}</div>
                                                <div className="text-xs text-gray-500">{student.admissionNumber}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{student.rollNumber || "-"}</TableCell>
                                            {exam.subjects.map((sub: any) => {
                                                const score = result.subjectScores.find((s: any) => s.subject === sub.name);
                                                return (
                                                    <TableCell key={sub.name} className="text-center">
                                                        {score ? score.marksObtained : "-"}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-right font-medium">{result.totalObtained}</TableCell>
                                            <TableCell className="text-right text-gray-500">{result.percentage.toFixed(1)}%</TableCell>
                                            <TableCell className="text-center font-bold">{result.grade}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={result.status === "PASS" ? "default" : "destructive"}>
                                                    {result.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
