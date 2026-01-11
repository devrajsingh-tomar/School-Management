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
import { Loader2, Printer, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { markPayrollPaid } from "@/lib/actions/hr.actions";
import { toast } from "sonner";

export function PayrollTable({ payrolls }: { payrolls: any[] }) {
    const [markingId, setMarkingId] = useState<string | null>(null);

    async function handlePaid(id: string) {
        if (!confirm("Confirm payment for this record?")) return;
        setMarkingId(id);
        try {
            const res = await markPayrollPaid(id);
            if (res.success) {
                toast.success("Marked as Paid");
            } else {
                toast.error(res.error || "Failed to update");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setMarkingId(null);
        }
    }

    if (payrolls.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No payroll records found for this period.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Staff</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Basic</TableHead>
                        <TableHead>Allowances</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead className="font-bold">Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payrolls.map((p) => (
                        <TableRow key={p._id}>
                            <TableCell className="font-medium">
                                {p.staff?.name}
                                <div className="text-xs text-muted-foreground">{p.staff?.role}</div>
                            </TableCell>
                            <TableCell>{format(new Date(p.month), "MMMM yyyy")}</TableCell>
                            <TableCell>{p.basic}</TableCell>
                            <TableCell className="text-green-600">+{p.allowances}</TableCell>
                            <TableCell className="text-red-600">-{p.deductions}</TableCell>
                            <TableCell className="font-bold text-lg">{p.netSalary}</TableCell>
                            <TableCell>
                                <Badge variant={p.status === "Paid" ? "default" : "secondary"}>
                                    {p.status}
                                </Badge>
                                {p.paymentDate && (
                                    <div className="text-[10px] text-muted-foreground mt-1">
                                        On {format(new Date(p.paymentDate), "dd/MM")}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                                <Button size="sm" variant="ghost" title="Print Slip">
                                    <Printer className="h-4 w-4" />
                                </Button>
                                {p.status === "Draft" && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        title="Mark Paid"
                                        onClick={() => handlePaid(p._id)}
                                        disabled={markingId === p._id}
                                    >
                                        {markingId === p._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
