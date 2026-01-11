import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAnnouncementForm } from "@/components/forms/create-announcement-form";
import { SendMessageForm } from "@/components/forms/send-message-form";
import { AnnouncementList } from "@/components/communication/announcement-list";
import { MessageLogsTable } from "@/components/communication/message-logs-table";
import { getAnnouncements, getMessageLogs } from "@/lib/actions/communication.actions";
import { getClasses } from "@/lib/actions/academic.actions";
import { connectDB } from "@/lib/db/connect";

export default async function CommunicationPage() {
    const session = await auth();
    if (!session?.user || !session.user.schoolId) redirect("/login");

    await connectDB();

    const [announcementsRes, logsRes, classes] = await Promise.all([
        getAnnouncements(session.user.schoolId),
        getMessageLogs(session.user.schoolId),
        getClasses(),
    ]);

    const announcements = announcementsRes.success ? announcementsRes.data : [];
    const logs = logsRes.success ? logsRes.data : [];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Communication Hub</h2>
            </div>

            <Tabs defaultValue="notices" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="notices">Notices & Announcements</TabsTrigger>
                    <TabsTrigger value="send">Send Message</TabsTrigger>
                    <TabsTrigger value="logs">Message Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="notices" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Active Notices</CardTitle>
                                <CardDescription>
                                    View and manage school-wide and class-specific notices.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AnnouncementList announcements={announcements} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Create New</CardTitle>
                                <CardDescription>
                                    Post a new notice or announcement to the app.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateAnnouncementForm
                                    classes={classes}
                                    schoolId={session.user.schoolId}
                                    authorId={session.user.id}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="send" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Bulk Message</CardTitle>
                            <CardDescription>
                                Send SMS or WhatsApp messages to classes or staff groups.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="max-w-2xl">
                            <SendMessageForm
                                classes={classes}
                                schoolId={session.user.schoolId}
                                authorId={session.user.id}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Logs</CardTitle>
                            <CardDescription>
                                History of sent SMS and WhatsApp messages.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MessageLogsTable logs={logs} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
