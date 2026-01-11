"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Activity, BookOpen, CreditCard, CalendarCheck } from "lucide-react";

export function StudentTimeline({ events }: { events: any[] }) {
    if (!events || events.length === 0) return <div className="text-center p-4 text-muted-foreground">No recent activity</div>;

    function getIcon(type: string) {
        switch (type) {
            case "ATTENDANCE": return <CalendarCheck className="h-4 w-4" />;
            case "FEE": return <CreditCard className="h-4 w-4" />;
            case "RESULT": return <BookOpen className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    }

    return (
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="relative border-l border-gray-200 ml-3">
                {events.map((event, index) => (
                    <div key={index} className="mb-8 ml-6">
                        <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-gray-200">
                            {getIcon(event.type)}
                        </span>
                        <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                            {event.title}
                            {index === 0 && (
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">Latest</span>
                            )}
                        </h3>
                        <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                            {format(new Date(event.date), "PPP p")}
                        </time>
                        <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                            {event.details}
                        </p>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
