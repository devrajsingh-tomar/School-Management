import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    LayoutDashboard,
    CalendarCheck,
    BookOpen,
    CreditCard,
    Bell,
    User,
    LogOut,
    School,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { UserAccountNav } from "@/components/layout/user-account-nav";

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/portal/login");

    // Only Students and Parents can access
    if (!["STUDENT", "PARENT"].includes(session.user.role || "")) {
        redirect("/dashboard");
    }

    const navigation = [
        { name: 'Overview', href: session.user.role === "STUDENT" ? "/portal/student" : "/portal/parent", icon: LayoutDashboard },
        { name: 'Attendance', href: '/portal/attendance', icon: CalendarCheck },
        { name: 'Academics', href: '/portal/academics', icon: BookOpen },
        { name: 'Fees', href: '/portal/fees', icon: CreditCard },
        { name: 'Notices', href: '/portal/notices', icon: Bell },
        { name: 'Support', href: '/portal/support', icon: MessageSquare },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 hidden md:block">
                <PortalSidebar user={session.user} />
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                <header className="sticky top-0 z-40 h-16 border-b bg-white/80 backdrop-blur-md px-6 flex items-center justify-end md:justify-between">
                    <div className="hidden md:block">
                        <h1 className="text-lg font-semibold text-slate-900 capitalize italic">
                            {session.user.role?.toLowerCase()} Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative h-8 w-8 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                        <UserAccountNav user={session.user} />
                    </div>
                </header>

                <main className="p-4 md:p-8 flex-1">
                    {children}
                </main>
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-white border-t flex items-center justify-around px-4">
                {navigation.slice(0, 5).map((item) => (
                    <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors">
                        <item.icon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{item.name}</span>
                    </Link>
                ))}
                <Link href="/portal/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors">
                    <User size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Profile</span>
                </Link>
            </div>
        </div>
    );
}
