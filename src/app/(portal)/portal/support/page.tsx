import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyTickets } from "@/lib/actions/support.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function SupportPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/portal/login");
    }

    const tickets = await getMyTickets();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
                <Button asChild>
                    <Link href="/portal/support/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Ticket
                    </Link>
                </Button>
            </div>

            {tickets.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                            Help & Support
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="min-h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-slate-50 border-dashed border-2 rounded-lg gap-4">
                            <p>You haven't raised any support tickets yet.</p>
                            <Button variant="outline" asChild>
                                <Link href="/portal/support/new">Raise a Ticket</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket: any) => (
                        <Card key={ticket._id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                ticket.status === "open" ? "destructive" :
                                                    ticket.status === "in_progress" ? "default" : "secondary"
                                            }
                                        >
                                            {ticket.status.replace("_", " ")}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            #{ticket.ticketNumber}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg leading-tight mt-2 block">
                                        {ticket.subject}
                                    </CardTitle>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                    {ticket.message}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                                    <div className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Priority: <span className="capitalize font-medium">{ticket.priority}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        Category: <span className="capitalize font-medium">{ticket.category}</span>
                                    </div>
                                    {ticket.lastReplyAt && (
                                        <div className="flex items-center gap-1 ml-auto text-blue-600">
                                            <Clock className="h-3 w-3" />
                                            Reply {formatDistanceToNow(new Date(ticket.lastReplyAt), { addSuffix: true })}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
