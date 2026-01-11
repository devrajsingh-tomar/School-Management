"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { returnBook } from "@/lib/actions/library.actions";
import { toast } from "sonner";
import { format, isPast } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function ActiveIssuesTable({ issues }: { issues: any[] }) {
    const [returningId, setReturningId] = useState<string | null>(null);

    async function handleReturn(id: string) {
        if (!confirm("Confirm return of this book?")) return;
        setReturningId(id);
        try {
            const res = await returnBook(id);
            if (res.success) {
                toast.success("Book returned successfully");
            } else {
                toast.error(res.error || "Failed to return");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setReturningId(null);
        }
    }

    if (issues.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No active issues found.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Issued To</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {issues.map((issue) => {
                        const isOverdue = isPast(new Date(issue.dueDate)) && issue.status !== "Returned";
                        return (
                            <TableRow key={issue._id}>
                                <TableCell className="font-medium">
                                    {issue.book?.title || "Unknown Book"}
                                    <div className="text-xs text-muted-foreground">{issue.book?.author}</div>
                                </TableCell>
                                <TableCell>
                                    {issue.user?.name || "Unknown User"}
                                    <div className="text-xs text-muted-foreground">{issue.user?.role}</div>
                                </TableCell>
                                <TableCell>{format(new Date(issue.issueDate), "PP")}</TableCell>
                                <TableCell className={isOverdue ? "text-red-500 font-bold" : ""}>
                                    {format(new Date(issue.dueDate), "PP")}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={isOverdue ? "destructive" : "outline"}>
                                        {isOverdue ? "Overdue" : issue.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReturn(issue._id)}
                                        disabled={returningId === issue._id}
                                    >
                                        {returningId === issue._id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                        Return
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
