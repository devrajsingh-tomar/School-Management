import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTicket } from "@/lib/actions/support.actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketReplyForm } from "@/components/support/ticket-reply-form";
import { formatDistanceToNow } from "date-fns";
import { Clock, User, School, Mail, Shield } from "lucide-react";
import { TicketStatusSelect } from "../../../../../components/support/ticket-status-select";

export default async function SuperAdminTicketDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    console.log("ROUTE PARAM ID =", id);

    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
        redirect("/school/login");
    }

    let ticket;
    try {
        ticket = await getTicket(id);
    } catch (error) {
        redirect("/superadmin/support");
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title={ticket.ticketNumber}
                description="Ticket Details & Management"
                showBackButton
                autoBreadcrumb
            />

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Ticket Content */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg">{ticket.subject}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="text-gray-800 whitespace-pre-wrap">{ticket.message}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conversation */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Conversation</h3>
                        {ticket.replies && ticket.replies.length > 0 ? (
                            ticket.replies.map((reply: any, index: number) => (
                                <Card key={index} className={reply.isAdminReply ? "border-l-4 border-l-blue-500 bg-blue-50/10" : "bg-white"}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${reply.isAdminReply ? "bg-blue-100" : "bg-gray-100"
                                                    }`}>
                                                    {reply.isAdminReply ? (
                                                        <Shield className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        {reply.userName}
                                                        {reply.isAdminReply && (
                                                            <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                                Admin Response
                                                            </Badge>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {reply.userRole}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 italic border rounded-lg border-dashed">
                                No replies yet
                            </div>
                        )}
                    </div>

                    {/* Reply Form */}
                    <Card>
                        <CardHeader>
                            <h3 className="font-semibold">Post Admin Reply</h3>
                        </CardHeader>
                        <CardContent>
                            <TicketReplyForm ticketId={ticket._id} />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Status & Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase text-gray-500">
                                Ticket Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Status</label>
                                <TicketStatusSelect
                                    ticketId={ticket._id}
                                    currentStatus={ticket.status}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Priority</label>
                                <Badge variant="outline" className={
                                    ticket.priority === 'urgent' ? 'text-red-600 border-red-200 bg-red-50' :
                                        ticket.priority === 'high' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                                            ''
                                }>
                                    {ticket.priority.toUpperCase()}
                                </Badge>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Category</label>
                                <Badge variant="outline">
                                    {ticket.category.replace("_", " ")}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase text-gray-500">
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                    <p className="font-medium text-sm">{ticket.userName}</p>
                                    <p className="text-xs text-gray-500">{ticket.userRole}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-blue-600 hover:underline">{ticket.userEmail}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <School className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                    <p className="font-medium text-sm">
                                        {ticket.schoolId?.name || "Independent User"}
                                    </p>
                                    {ticket.schoolId && (
                                        <p className="text-xs text-gray-500">School Tenant</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
