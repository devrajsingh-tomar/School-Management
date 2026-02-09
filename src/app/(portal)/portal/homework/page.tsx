import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Paperclip, User as UserIcon, Clock } from "lucide-react";
import { getStudentHomework } from "@/lib/actions/homework.actions";
import { formatDistanceToNow, isPast, format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomeworkPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/school/login");
    }

    const studentId = session.user.linkedStudentId;
    const schoolId = session.user.schoolId;

    if (!studentId || !schoolId) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Unable to load homework. Missing student or school information.
            </div>
        );
    }

    const homeworkList = await getStudentHomework(studentId, schoolId);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Homework & Assignments</h2>

            {homeworkList.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-violet-500" />
                            Assignments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="min-h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed border-2 rounded-lg">
                            No pending homework found.
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {homeworkList.map((hw: any) => {
                        const isOverdue = isPast(new Date(hw.dueDate));
                        return (
                            <Card key={hw._id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant={hw.type === "Project" ? "default" : "secondary"}>
                                            {hw.type}
                                        </Badge>
                                        <Badge variant="outline" className={isOverdue ? "text-red-500 border-red-200 bg-red-50" : "text-green-600 border-green-200 bg-green-50"}>
                                            {isOverdue ? "Past Due" : "Active"}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-2 line-clamp-2">{hw.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1 font-medium text-violet-600">
                                        <BookOpen className="h-3 w-3" />
                                        {hw.subject}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 pb-3">
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                        {hw.description}
                                    </p>
                                    <div className="space-y-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            <span>Due: {format(new Date(hw.dueDate), "dd/MM/yyyy")}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="h-3 w-3" />
                                            <span>Assigned by: {hw.teacher?.name || "Teacher"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            <span>Posted {formatDistanceToNow(new Date(hw.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    {hw.attachments && hw.attachments.length > 0 && (
                                        <div className="w-full space-y-2">
                                            <div className="h-px bg-gray-100 my-2" />
                                            <p className="text-xs font-semibold text-gray-500">Attachments:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {hw.attachments.map((link: string, i: number) => (
                                                    <Button key={i} variant="outline" size="sm" className="h-7 text-xs" asChild>
                                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                                            <Paperclip className="h-3 w-3 mr-1" />
                                                            View
                                                        </a>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
