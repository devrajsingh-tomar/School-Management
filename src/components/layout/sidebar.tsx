"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    UserPlus,
    BookOpen,
    Calendar,
    GraduationCap,
    Banknote,
    Clock,
    Bus,
    Briefcase,
    Library,
    Package,
    MessageSquare,
    BarChart3,
    Settings,
    Shield
} from "lucide-react";

const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/school", color: "text-sky-500" },
    { label: "Students", icon: Users, href: "/school/students", color: "text-violet-500" },
    { label: "Admissions", icon: UserPlus, href: "/school/admissions", color: "text-pink-700" },
    { label: "Academics", icon: BookOpen, href: "/school/academics", color: "text-orange-700" },
    { label: "Attendance", icon: Calendar, href: "/school/attendance", color: "text-emerald-500" },
    { label: "Exams & Results", icon: GraduationCap, href: "/school/exams", color: "text-green-700" },
    { label: "Fees & Accounts", icon: Banknote, href: "/school/finance", color: "text-emerald-700" },
    { label: "Timetable", icon: Clock, href: "/school/timetable", color: "text-gray-500" },
    { label: "Transport", icon: Bus, href: "/school/transport", color: "text-yellow-500" },
    { label: "HR & Payroll", icon: Briefcase, href: "/school/hr", color: "text-blue-700" },
    { label: "Library", icon: Library, href: "/school/library", color: "text-indigo-500" },
    { label: "Inventory", icon: Package, href: "/school/inventory", color: "text-rose-500" },
    { label: "Communication", icon: MessageSquare, href: "/school/communication", color: "text-teal-500" },
    { label: "Reports", icon: BarChart3, href: "/school/reports", color: "text-cyan-500" },
    { label: "Settings", icon: Settings, href: "/school/settings", color: "text-gray-700" },
    // Only verify Admin route conditionally or separate sidebar
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/school" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        {/* Logo Placeholder */}
                        <div className="bg-white/10 rounded-lg w-full h-full flex items-center justify-center font-bold">SM</div>
                    </div>
                    <h1 className="text-2xl font-bold">School SaaS</h1>
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
            <div className="px-3 py-2">
                <Link
                    href="/admin"
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
                >
                    <div className="flex items-center flex-1">
                        <Shield className="h-5 w-5 mr-3 text-red-500" />
                        Admin Panel
                    </div>
                </Link>
            </div>
        </div>
    );
}
