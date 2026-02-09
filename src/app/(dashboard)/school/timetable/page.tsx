import Link from "next/link";
import { Clock, Calendar, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TimetablePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Timetable Management"
                description="Manage class schedules and teacher assignments."
            >
                <Button asChild>
                    <Link href="/school/timetable/manage">
                        <Plus className="mr-2 h-4 w-4" /> Manage Timetable
                    </Link>
                </Button>
            </PageHeader>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-indigo-600" />
                            Active Schedules
                        </CardTitle>
                        <CardDescription>
                            Overview of current class timings and teacher availability.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg bg-gray-50">
                        <p className="text-muted-foreground">Select a class to view its timetable</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-emerald-600" />
                            Academic Calendar
                        </CardTitle>
                        <CardDescription>
                            Important dates, exams, and holidays.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg bg-gray-50">
                        <p className="text-muted-foreground">No upcoming events scheduled</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
