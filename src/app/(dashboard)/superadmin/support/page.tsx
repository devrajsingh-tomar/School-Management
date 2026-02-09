import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllTickets, getTicketStats } from "@/lib/actions/support.actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Clock, Filter, School as SchoolIcon, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function SupportPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; priority?: string; search?: string }>;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/school/login");
    }

    const { status, priority, search } = await searchParams;

    // Fetch tickets with filters
    const tickets = await getAllTickets({
        status,
        priority,
        search,
    });

    const stats = await getTicketStats();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Support Tickets"
                description="Manage support tickets from all schools"
                showBackButton={false}
                autoBreadcrumb
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.open}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Closed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tickets Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticket ID</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>School / User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No tickets found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket: any) => (
                                    <TableRow key={ticket._id}>
                                        <TableCell className="font-mono text-xs">{ticket.ticketNumber}</TableCell>
                                        <TableCell className="font-medium max-w-[300px] truncate" title={ticket.subject}>
                                            <div className="flex flex-col">
                                                <span>{ticket.subject}</span>
                                                <span className="text-xs text-muted-foreground truncate">{ticket.message}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <div className="flex items-center gap-1 font-medium">
                                                    <SchoolIcon className="h-3 w-3 text-muted-foreground" />
                                                    {ticket.schoolId?.name || "SaaS Platform"}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    {ticket.userName} ({ticket.userRole})
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    ticket.status === "open"
                                                        ? "default"
                                                        : ticket.status === "in_progress"
                                                            ? "secondary"
                                                            : "outline"
                                                }
                                                className={
                                                    ticket.status === "open"
                                                        ? "bg-green-100 text-green-800 hover:bg-green-100 border-none"
                                                        : ticket.status === "in_progress"
                                                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none"
                                                            : "bg-gray-100 text-gray-800 border-none"
                                                }
                                            >
                                                {ticket.status.replace("_", " ").toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                ticket.priority === 'urgent' ? 'text-red-600 border-red-200 bg-red-50' :
                                                    ticket.priority === 'high' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                                                        ''
                                            }>
                                                {ticket.priority.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/superadmin/support/${ticket._id}`} className="text-blue-600 hover:underline text-sm font-medium">
                                                View Details
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
