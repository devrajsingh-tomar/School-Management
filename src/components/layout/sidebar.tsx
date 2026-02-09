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
    Shield,
    Download,
    School,
    ToggleRight,
    LifeBuoy
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

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
    { label: "Help & Support", icon: LifeBuoy, href: "/school/support", color: "text-blue-500" },
    { label: "Settings", icon: Settings, href: "/school/settings", color: "text-gray-700" },
];

const adminRoutes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/superadmin", color: "text-sky-500" },
    { label: "Schools", icon: School, href: "/superadmin/schools", color: "text-violet-500" },
    { label: "Plans", icon: Package, href: "/superadmin/plans", color: "text-pink-700" },
    { label: "Subscriptions", icon: UserPlus, href: "/superadmin/subscriptions", color: "text-orange-700" },
    { label: "Billing", icon: Banknote, href: "/superadmin/billing", color: "text-emerald-500" },
    { label: "Usage & Limits", icon: BarChart3, href: "/superadmin/usage", color: "text-green-700" },
    { label: "Feature Flags", icon: ToggleRight, href: "/superadmin/features", color: "text-purple-600" },
    { label: "Support", icon: Shield, href: "/superadmin/support", color: "text-blue-700" },
    { label: "System Settings", icon: Settings, href: "/superadmin/settings", color: "text-gray-700" },
];

export function Sidebar({ forceExpanded = false, userRole = "GUEST", featureFlags = [] }: { forceExpanded?: boolean, userRole?: string, featureFlags?: any[] }) {
    const pathname = usePathname();
    const { isCollapsed: globalIsCollapsed } = useSidebar();
    const isCollapsed = forceExpanded ? false : globalIsCollapsed;

    // Map routes to Feature Flag keys
    const routeMap: Record<string, string> = {
        "/school/hr": "hr_payroll",
        "/school/transport": "transport",
        "/school/library": "library",
        "/school/inventory": "inventory",
        // Add more as needed
    };

    // Role-based route filtering
    const visibleRoutes = routes.filter(route => {
        // 1. Check Feature Flags
        const flagKey = routeMap[route.href];
        if (flagKey) {
            const flag = featureFlags?.find(f => f.key === flagKey);
            // If flag exists and is disabled, hide route
            // If flag doesn't exist, assume enabled (default fallback) or strict? 
            // Let's assume enabled if not present to avoid hiding everything on error
            if (flag && !flag.isEnabled) return false;
        }

        const r = userRole?.toUpperCase();

        if (r === "SCHOOL_ADMIN" || r === "SUPER_ADMIN") return true;

        if (r === "TEACHER" || r === "STAFF") {
            // Teacher: Dashboard, Students, Academics, Attendance, Exams, Timetable, Communication
            // Block: Fees, HR, Inventory, Settings, Library, Transport, Admissions, Reports
            const allowed = ["/school", "/school/students", "/school/academics", "/school/attendance", "/school/exams", "/school/timetable", "/school/communication"];
            return allowed.some(path => route.href === path || route.href.startsWith(path + "/"));
        }

        if (r === "ACCOUNTANT") {
            // Accountant: Dashboard, Students, Fees, Reports
            const allowed = ["/school", "/school/students", "/school/finance", "/school/reports"];
            return allowed.some(path => route.href === path || route.href.startsWith(path + "/"));
        }

        if (r === "LIBRARIAN") {
            // Librarian: Library, Students
            const allowed = ["/school", "/school/library", "/school/students"];
            const safeAllowed = ["/school", "/school/library", "/school/students"];
            return safeAllowed.some(path => route.href === path || route.href.startsWith(path + "/"));
        }

        if (r === "TRANSPORT_MANAGER") {
            // TransportManager: Transport, Students
            const safeAllowed = ["/school", "/school/transport", "/school/students"];
            return safeAllowed.some(path => route.href === path || route.href.startsWith(path + "/"));
        }

        return false; // Default block for unknown roles
    });

    const activeRoutes = pathname?.startsWith("/superadmin") ? adminRoutes : visibleRoutes;

    return (
        <div className={cn(
            "flex flex-col h-full bg-[#111827] text-white border-r border-white/5 transition-all duration-300",
            isCollapsed ? "w-[72px]" : "w-full"
        )}>
            <div className="py-4 flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                <Link href={userRole === "SUPER_ADMIN" ? "/superadmin" : "/school"} className={cn(
                    "flex items-center mb-10 transition-all",
                    isCollapsed ? "justify-center" : "pl-6"
                )}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 shrink-0">
                        <School size={24} />
                    </div>
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold ml-3 tracking-tight truncate animate-in fade-in duration-500">
                            EduFlow<span className="text-indigo-400">SaaS</span>
                        </h1>
                    )}
                </Link>

                <div className="space-y-1 px-3">
                    {activeRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all items-center",
                                pathname === route.href || (route.href !== "/school" && route.href !== "/superadmin" && pathname?.startsWith(route.href))
                                    ? "text-white bg-white/10 shadow-sm shadow-black/20"
                                    : "text-zinc-400",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? route.label : ""}
                        >
                            <route.icon className={cn(
                                "h-5 w-5 transition-all",
                                route.color,
                                !isCollapsed && "mr-3"
                            )} />
                            {!isCollapsed && (
                                <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300 text-[13px]">
                                    {route.label}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="p-3 border-t border-white/5 space-y-1">
                {/* Only show Admin Panel link if user is SUPER_ADMIN */}
                {userRole === "SUPER_ADMIN" && (
                    <Link
                        href={pathname?.startsWith("/superadmin") ? "/school" : "/superadmin"}
                        className={cn(
                            "text-sm group flex p-3 w-full font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all text-zinc-400 items-center",
                            isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? (pathname?.startsWith("/superadmin") ? "School Dashboard" : "SuperAdmin Panel") : ""}
                    >
                        {pathname?.startsWith("/superadmin") ? (
                            <LayoutDashboard className={cn("h-5 w-5 text-indigo-500", !isCollapsed && "mr-3")} />
                        ) : (
                            <Shield className={cn("h-5 w-5 text-red-500", !isCollapsed && "mr-3")} />
                        )}

                        {!isCollapsed && <span className="truncate animate-in fade-in duration-300">{pathname?.startsWith("/superadmin") ? "School Dashboard" : "SuperAdmin Panel"}</span>}
                    </Link>
                )}

                {!isCollapsed ? (
                    <Link
                        href="/api/finance/export"
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-600/20 transition-all text-sm font-semibold justify-center mt-2 group overflow-hidden"
                    >
                        <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                        <span>Export Data</span>
                    </Link>
                ) : (
                    <Link
                        href="/api/finance/export"
                        className="flex h-10 w-10 items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-600/20 transition-all mt-2 mx-auto"
                        title="Export Data"
                    >
                        <Download size={18} />
                    </Link>
                )}
            </div>
        </div>
    );
}
