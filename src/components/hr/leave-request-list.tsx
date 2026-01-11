"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { updateLeaveStatus } from "@/lib/actions/hr.actions";
import { toast } from "sonner";

export function LeaveRequestList({ requests, currentUserId }: { requests: any[]; currentUserId: string }) {
    const [actionId, setActionId] = useState<string | null>(null);

    async function handleStatus(id: string, status: "Approved" | "Rejected") {
        setActionId(id);
        try {
            const res = await updateLeaveStatus(id, status, currentUserId);
            if (res.success) {
                toast.success(`Leave ${status}`);
            } else {
                toast.error(res.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setActionId(null);
        }
    }

    if (requests.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No leave requests found.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Staff Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((req) => (
                        <TableRow key={req._id}>
                            <TableCell className="font-medium">
                                {req.staff?.name}
                                <div className="text-xs text-muted-foreground">{req.staff?.role}</div>
                            </TableCell>
                            <TableCell>{req.type}</TableCell>
                            <TableCell>
                                {format(new Date(req.startDate), "PP")} - {format(new Date(req.endDate), "PP")}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={req.reason}>
                                {req.reason}
                            </TableCell>
                            <TableCell>
                                <Badge variant={
                                    req.status === "Approved" ? "default" :
                                        (req.status === "Rejected" ? "destructive" : "secondary")
                                }>
                                    {req.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {req.status === "Pending" && (
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => handleStatus(req._id, "Approved")}
                                            disabled={actionId === req._id}
                                        >
                                            {actionId === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleStatus(req._id, "Rejected")}
                                            disabled={actionId === req._id}
                                        >
                                            {actionId === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
