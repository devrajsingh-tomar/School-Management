import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTicket } from "@/lib/actions/support.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Clock, User, AlertCircle, Send } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { TicketReplyForm } from "@/components/support/ticket-reply-form";

export default async function PortalTicketDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/portal/login");
    }

    const ticket = await getTicket(id);

    if (!ticket) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Ticket not found.
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/portal/support">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Ticket Header & Original Message */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>#{ticket.ticketNumber}</span>
                                        <span>•</span>
                                        <span>{format(new Date(ticket.createdAt), "PPP")}</span>
                                    </div>
                                    <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                                </div>
                                <Badge
                                    variant={
                                        ticket.status === "open" ? "destructive" :
                                            ticket.status === "in_progress" ? "default" : "secondary"
                                    }
                                >
                                    {ticket.status.replace("_", " ")}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {ticket.message}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Replies */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Discussion History
                        </h3>
                        {ticket.replies && ticket.replies.length > 0 ? (
                            <div className="space-y-4">
                                {ticket.replies.map((reply: any, i: number) => (
                                    <Card key={i} className={`border-l-4 ${reply.isAdminReply ? "border-l-blue-500" : "border-l-green-500"}`}>
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${reply.isAdminReply ? "bg-blue-600" : "bg-green-600"}`}>
                                                        {reply.isAdminReply ? "ADM" : "YOU"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {reply.isAdminReply ? "Support Team" : "You"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap pl-10">
                                                {reply.message}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-slate-50 rounded-lg border border-dashed">
                                No replies yet. Our team will get back to you soon.
                            </div>
                        )}
                    </div>

                    {/* Reply Form */}
                    {ticket.status !== "closed" && (
                        <TicketReplyForm ticketId={ticket._id} />
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Category</span>
                                <span className="font-medium capitalize">{ticket.category}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Priority</span>
                                <Badge variant="outline">{ticket.priority}</Badge>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Status</span>
                                <span className="font-medium capitalize">{ticket.status.replace("_", " ")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated</span>
                                <span className="font-medium text-right">
                                    {formatDistanceToNow(new Date(ticket.lastReplyAt || ticket.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                                <AlertCircle className="h-4 w-4" />
                                Support Policy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-blue-600 space-y-2">
                            <p>We typically respond within 24 hours.</p>
                            <p>For urgent academic issues, please contact your class teacher directly.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
