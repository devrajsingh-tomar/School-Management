import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTicket } from "@/lib/actions/support.actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketReplyForm } from "@/components/support/ticket-reply-form";
import { formatDistanceToNow } from "date-fns";
import { Clock, User } from "lucide-react";

export default async function TicketDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/school/login");
    }

    let ticket;
    try {
        ticket = await getTicket(id);
    } catch (error) {
        redirect("/school/support");
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title={ticket.ticketNumber}
                description={ticket.subject}
                showBackButton
                autoBreadcrumb
            />

            {/* Ticket Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
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
                            <Badge variant="outline">
                                {ticket.category.replace("_", " ")}
                            </Badge>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Conversation */}
            <div className="space-y-4">
                {/* Original Message */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{ticket.userName}</p>
                                <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                    </CardContent>
                </Card>

                {/* Replies */}
                {ticket.replies && ticket.replies.length > 0 && (
                    <>
                        {ticket.replies.map((reply: any, index: number) => (
                            <Card key={index} className={reply.isAdminReply ? "border-l-4 border-l-blue-500" : ""}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${reply.isAdminReply ? "bg-blue-100" : "bg-gray-100"
                                            }`}>
                                            <User className={`h-4 w-4 ${reply.isAdminReply ? "text-blue-600" : "text-gray-600"
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {reply.userName}
                                                {reply.isAdminReply && (
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        Support Team
                                                    </Badge>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </>
                )}
            </div>

            {/* Reply Form */}
            {ticket.status !== "closed" && (
                <Card>
                    <CardHeader>
                        <h3 className="font-semibold">Add Reply</h3>
                    </CardHeader>
                    <CardContent>
                        <TicketReplyForm ticketId={ticket._id} />
                    </CardContent>
                </Card>
            )}

            {ticket.status === "closed" && (
                <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">
                            This ticket has been closed. If you need further assistance, please create a new ticket.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
