"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteAnnouncement } from "@/lib/actions/communication.actions";
import { toast } from "sonner";
import { format } from "date-fns";

export function AnnouncementList({ announcements }: { announcements: any[] }) {

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this?")) return;
        const res = await deleteAnnouncement(id);
        if (res.success) {
            toast.success("Deleted successfully");
        } else {
            toast.error("Failed to delete");
        }
    }

    if (announcements.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No announcements found.</div>;
    }

    return (
        <div className="space-y-4">
            {announcements.map((a) => (
                <Card key={a._id} className="relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${a.type === 'Notice' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                    <CardHeader className="pl-6 pb-2">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {a.title}
                                    <Badge variant={a.type === 'Notice' ? 'destructive' : 'default'}>
                                        {a.type}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    To: {a.audience}
                                    {a.targetClass && ` (${a.targetClass.name})`} •
                                    By: {a.author?.name} •
                                    {format(new Date(a.createdAt), "PPP")}
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(a._id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-6">
                        <p className="whitespace-pre-wrap text-sm">{a.content}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
