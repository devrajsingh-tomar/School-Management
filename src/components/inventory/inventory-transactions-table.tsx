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
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function InventoryTransactionsTable({ transactions }: { transactions: any[] }) {
    if (transactions.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No transactions found.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Performed By</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx._id}>
                            <TableCell className="font-medium">
                                {format(new Date(tx.date), "PP p")}
                            </TableCell>
                            <TableCell>
                                {tx.type === "IN" ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <ArrowDownLeft className="mr-1 h-3 w-3" /> IN
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                        <ArrowUpRight className="mr-1 h-3 w-3" /> OUT
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {tx.item?.name}
                                <span className="text-xs text-muted-foreground ml-1">({tx.item?.unit})</span>
                            </TableCell>
                            <TableCell className="font-bold">
                                {tx.quantity}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {tx.reference || "-"}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                                {tx.performedBy?.name || "Unknown"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
