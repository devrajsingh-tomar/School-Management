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

export function MessageLogsTable({ logs }: { logs: any[] }) {
    if (logs.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No message logs found.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead className="w-[40%]">Content</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log._id}>
                            <TableCell className="font-medium">
                                {format(new Date(log.sentAt), "PP p")}
                            </TableCell>
                            <TableCell>{log.recipient}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{log.channel}</Badge>
                            </TableCell>
                            <TableCell className="truncate max-w-md" title={log.content}>
                                {log.content}
                            </TableCell>
                            <TableCell>
                                <Badge variant={log.status === "Sent" ? "default" : "destructive"}>
                                    {log.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
