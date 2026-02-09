import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAuditLogs } from "@/lib/actions/audit.actions";
import connectDB from "@/lib/db/connect";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function AuditPage() {
    const session = await auth();
    // Assuming SuperAdmin or SchoolAdmin access
    if (!session?.user) redirect("/login");

    await connectDB();
    const { data: logs } = await getAuditLogs(session.user.role === "SuperAdmin" ? undefined : session.user.schoolId);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>

            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log: any) => (
                                <TableRow key={log._id}>
                                    <TableCell>{format(new Date(log.timestamp), "PPpp")}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{log.user?.name || "System"}</div>
                                        <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                                    </TableCell>
                                    <TableCell className="font-bold">{log.action}</TableCell>
                                    <TableCell>{log.entity}</TableCell>
                                    <TableCell className="text-xs font-mono max-w-[300px] truncate">
                                        {JSON.stringify(log.details)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No logs found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
