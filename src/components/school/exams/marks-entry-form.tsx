"use client";

import { useActionState, useState } from "react";
import { saveExamResults } from "@/lib/actions/exam.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MarksEntryFormProps {
    exam: any;
    students: any[];
    existingResults: any[];
}

const initialState = {
    success: false,
    message: "",
    data: null,
};

export function MarksEntryForm({ exam, students, existingResults }: MarksEntryFormProps) {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(saveExamResults, initialState);

    // Helper to get existing mark for a student & subject
    const getExistingMark = (studentId: string, subjectName: string) => {
        const result = existingResults.find((r: any) => r.student === studentId);
        if (!result) return "";
        const score = result.subjectScores.find((s: any) => s.subject === subjectName);
        return score ? score.marksObtained : "";
    };

    // Helper to get existing Total mark if manual override
    const getExistingTotal = (studentId: string) => {
        const result = existingResults.find((r: any) => r.student === studentId);
        if (!result) return "";
        // If subjectScores is empty or doesn't match total calculation, maybe check if there is a 'Total' subject?
        // But usually total is calculated. 
        // If the backend expects a "Total" field fallback:
        const score = result.subjectScores.find((s: any) => s.subject === "Total");
        return score ? score.marksObtained : "";
    };

    if (state.success) {
        toast.success("Marks saved successfully!");
        // Reset state logic or redirect? 
        // Since we stay on page, maybe just show toast.
        // But we want to revalidate, which the action does.
    }

    if (state.message && !state.success) {
        toast.error(state.message);
    }

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="examId" value={exam._id} />

            <Card>
                <CardHeader>
                    <CardTitle>Marks Entry: {exam.name}</CardTitle>
                    <CardDescription>
                        Enter marks for {students.length} students in Class {exam.class.name}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b text-gray-500">
                                <tr>
                                    <th className="p-4 font-medium min-w-[200px]">Student Name</th>
                                    <th className="p-4 font-medium w-[100px]">Roll No.</th>
                                    {exam.subjects.map((subject: any) => (
                                        <th key={subject.name} className="p-4 font-medium min-w-[120px]">
                                            {subject.name} <span className="text-xs text-gray-400 block">Max: {subject.maxMarks}</span>
                                        </th>
                                    ))}
                                    {/* Optional Total Override if needed, but usually calc on server */}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student: any) => (
                                    <tr key={student._id} className="border-b last:border-0 hover:bg-gray-50/50">
                                        <td className="p-4">
                                            <input type="hidden" name="studentIds" value={student._id} />
                                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                                            <div className="text-xs text-gray-500">{student.admissionNumber}</div>
                                        </td>
                                        <td className="p-4 font-mono">{student.rollNumber || "-"}</td>
                                        {exam.subjects.map((subject: any) => (
                                            <td key={subject.name} className="p-4">
                                                <Input
                                                    type="number"
                                                    name={`marks-${student._id}-${subject.name}`}
                                                    defaultValue={getExistingMark(student._id, subject.name)}
                                                    min="0"
                                                    max={subject.maxMarks}
                                                    step="0.5"
                                                    className="w-24"
                                                    placeholder="0"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 sticky bottom-4 p-4 bg-white/80 backdrop-blur-sm border rounded-lg shadow-lg">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Marks
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
