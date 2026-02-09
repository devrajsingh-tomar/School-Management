"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    GraduationCap,
    Banknote,
    MessageSquare,
    User,
    Settings,
    BookOpen,
    Clock
} from "lucide-react";

export function PortalSidebar({ user }: { user: any }) {
    const pathname = usePathname();
    const role = user?.role?.toUpperCase();

    const routes = [
        {
            label: "Overview",
            icon: LayoutDashboard,
            href: role === "STUDENT" ? "/portal/student" : "/portal/parent",
            color: "text-sky-500"
        },
        { label: "Attendance", icon: Calendar, href: "/portal/attendance", color: "text-emerald-500" },
        { label: "Homework", icon: BookOpen, href: "/portal/homework", color: "text-violet-500" },
        { label: "Results", icon: GraduationCap, href: "/portal/results", color: "text-pink-500" },
        { label: "Fees", icon: Banknote, href: "/portal/fees", color: "text-emerald-700" },
        { label: "Notices", icon: MessageSquare, href: "/portal/notices", color: "text-teal-500" },
        { label: "Support", icon: MessageSquare, href: "/portal/support", color: "text-blue-500" },
    ];

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href={role === "STUDENT" ? "/portal/student" : "/portal/parent"} className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <div className="bg-white/10 rounded-lg w-full h-full flex items-center justify-center font-bold">SP</div>
                    </div>
                    <h1 className="text-xl font-bold">Portal</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href || pathname?.startsWith(route.href + "/")
                                    ? "text-white bg-white/10"
                                    : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-4 border-t border-white/10">
                <p className="text-xs text-zinc-500 px-3">Student & Parent Portal v1.0</p>
            </div>
        </div>
    );
}
