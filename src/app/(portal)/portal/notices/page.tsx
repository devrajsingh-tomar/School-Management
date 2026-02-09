import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Megaphone, Info } from "lucide-react";
import { getStudentNotices } from "@/lib/actions/communication.actions";
import { formatDistanceToNow, format } from "date-fns";
import mongoose from "mongoose";

export default async function NoticesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/school/login");
    }

    const studentId = session.user.linkedStudentId;
    const schoolId = session.user.schoolId;

    if (!studentId || !schoolId) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Unable to load notices. Missing student or school information.
            </div>
        );
    }

    const notices = await getStudentNotices(studentId, schoolId);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Notices & Announcements</h2>

            {notices.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-orange-500" />
                            Notice Board
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="min-h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed border-2 rounded-lg">
                            No notices at this time.
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {notices.map((notice: any) => (
                        <Card key={notice._id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                notice.type === "Notice" ? "destructive" :
                                                    notice.type === "Announcement" ? "default" : "secondary"
                                            }
                                        >
                                            {notice.type}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(notice.createdAt), 'PPP')}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg leading-tight mt-2 block">
                                        {notice.title}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                                    {notice.content}
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Info className="h-3 w-3" />
                                        Posted {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                                    </span>
                                    {notice.audience && (
                                        <Badge variant="outline" className="text-[10px]">
                                            Audience: {notice.audience}
                                        </Badge>
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
