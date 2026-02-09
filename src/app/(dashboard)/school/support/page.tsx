import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyTickets } from "@/lib/actions/support.actions";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function SupportPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/school/login");
    }

    const tickets = await getMyTickets();

    // Group tickets by status
    const openTickets = tickets.filter((t: any) => t.status === "open");
    const inProgressTickets = tickets.filter((t: any) => t.status === "in_progress");
    const closedTickets = tickets.filter((t: any) => t.status === "closed");

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Help & Support"
                description="Create and manage your support tickets"
                showBackButton={false}
                autoBreadcrumb
            >
                <Link href="/school/support/new">
                    <PrimaryActionButton>
                        <Plus className="h-4 w-4" />
                        Create New Ticket
                    </PrimaryActionButton>
                </Link>
            </PageHeader>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{openTickets.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{inProgressTickets.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Closed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{closedTickets.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tickets List */}
            <Card>
                <CardHeader>
                    <CardTitle>My Tickets</CardTitle>
                    <CardDescription>
                        View and manage all your support tickets
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {tickets.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No tickets</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new support ticket.
                            </p>
                            <div className="mt-6">
                                <Link href="/school/support/new">
                                    <PrimaryActionButton>
                                        <Plus className="h-4 w-4" />
                                        Create Ticket
                                    </PrimaryActionButton>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket: any) => (
                                <Link
                                    key={ticket._id}
                                    href={`/school/support/${ticket._id}`}
                                    className="block"
                                >
                                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-mono text-gray-500">
                                                        {ticket.ticketNumber}
                                                    </span>
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
                                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                                : ticket.status === "in_progress"
                                                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                                    : "bg-gray-100 text-gray-800"
                                                        }
                                                    >
                                                        {ticket.status.replace("_", " ").toUpperCase()}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {ticket.priority.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {ticket.subject}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {ticket.message}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(new Date(ticket.createdAt), {
                                                            addSuffix: true,
                                                        })}
                                                    </span>
                                                    {ticket.replies?.length > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            {ticket.replies.length} {ticket.replies.length === 1 ? "reply" : "replies"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
