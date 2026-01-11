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
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function InventoryList({ items }: { items: any[] }) {
    if (items.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No items in inventory.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Unit</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => {
                        const isLowStock = item.quantity <= item.minStockThreshold;
                        return (
                            <TableRow key={item._id}>
                                <TableCell className="font-medium">
                                    {item.name}
                                    {item.description && (
                                        <div className="text-xs text-muted-foreground">{item.description}</div>
                                    )}
                                </TableCell>
                                <TableCell>{item.category || "-"}</TableCell>
                                <TableCell className="font-bold text-lg">
                                    {item.quantity}
                                </TableCell>
                                <TableCell>
                                    {isLowStock ? (
                                        <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                            <AlertTriangle size={12} /> Low Stock
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="flex w-fit items-center gap-1 text-green-600">
                                            <CheckCircle2 size={12} /> OK
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {item.unit}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
