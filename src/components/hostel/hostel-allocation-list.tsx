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
import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { vacateRoom } from "@/lib/actions/hostel.actions";

export function HostelAllocationList({ allocations }: { allocations: any[] }) {
    const [vacatingId, setVacatingId] = useState<string | null>(null);

    async function handleVacate(id: string) {
        if (!confirm("Are you sure you want to vacate this room request?")) return;
        setVacatingId(id);
        try {
            const res = await vacateRoom(id);
            if (res.success) {
                toast.success("Room vacated successfully");
            } else {
                toast.error(res.error || "Failed to vacate room");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setVacatingId(null);
        }
    }

    if (allocations.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No active allocations found.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Hostel</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Allocated Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allocations.map((alloc) => (
                        <TableRow key={alloc._id}>
                            <TableCell className="font-medium">
                                {alloc.student?.firstName} {alloc.student?.lastName}
                                <div className="text-xs text-muted-foreground">
                                    {alloc.student?.class?.name} - {alloc.student?.section?.name}
                                </div>
                            </TableCell>
                            <TableCell>{alloc.hostel?.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{alloc.room?.roomNumber}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(alloc.allocatedDate), "PP")}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleVacate(alloc._id)}
                                    disabled={vacatingId === alloc._id}
                                >
                                    {vacatingId === alloc._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <LogOut className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Vacate</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
