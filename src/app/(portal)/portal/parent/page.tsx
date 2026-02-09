import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    Calendar,
    BookOpen,
    Trophy,
    User,
    ChevronRight,
    IndianRupee,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ParentDashboard() {
    const session = await auth();
    if (!session?.user || session.user.role !== "PARENT") {
        redirect("/portal/login");
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Parent Dashboard: {session.user.name} 👋
                </h1>
                <p className="text-slate-500 text-sm">
                    Monitoring your child's academic progress.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Child Attendance" value="94%" description="Overall This Term" icon={<Calendar className="text-indigo-600" size={18} />} color="bg-indigo-50" />
                <StatCard title="Grades" value="A-" description="Average Performance" icon={<Trophy className="text-emerald-600" size={18} />} color="bg-emerald-50" />
                <StatCard title="Fee Balance" value="₹12,400" description="Due in 5 days" icon={<IndianRupee className="text-rose-600" size={18} />} color="bg-rose-50" isAlert />
                <StatCard title="Next Meeting" value="Oct 30" description="Parent-Teacher Meet" icon={<User className="text-violet-600" size={18} />} color="bg-violet-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Child's Recent Progress</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/portal/results">Full Reports <ChevronRight size={14} className="ml-1" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex gap-4 items-start">
                            <AlertCircle className="text-amber-600 shrink-0" size={20} />
                            <div>
                                <p className="text-sm font-bold text-amber-900">Fee Payment Reminder</p>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                    The second installment for the session 2024-25 is due on October 30th. Please pay online to avoid late fees.
                                </p>
                                <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700 text-xs font-bold px-4">Pay Now</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Teacher Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-300 italic">
                            "John is showing consistent improvement in Mathematics. He needs to participate more in class discussions."
                        </p>
                        <p className="text-xs font-bold text-indigo-400 mt-4">— Mr. Sharma (Class Teacher)</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, description, icon, color, isAlert }: any) {
    return (
        <Card className="shadow-sm border-slate-200 overflow-hidden group hover:border-indigo-200 transition-colors">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
                        {icon}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    <h3 className={`text-2xl font-bold ${isAlert ? 'text-rose-600' : 'text-slate-900'}`}>{value}</h3>
                    <p className="text-xs text-slate-400 font-medium">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
