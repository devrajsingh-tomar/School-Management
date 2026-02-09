import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db/connect";
import StaffProfile from "@/lib/db/models/StaffProfile";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StaffProfileForm } from "@/components/forms/staff-profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, Calendar, User as UserIcon } from "lucide-react";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    await connectDB();
    const profile = await StaffProfile.findOne({
        school: session.user.schoolId,
        user: session.user.id
    }).lean();

    const user = session.user;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <PageHeader
                title="My Profile"
                description="Manage your account settings and professional information."
            />

            <div className="grid gap-6 md:grid-cols-12">
                {/* Account Overview */}
                <Card className="md:col-span-4 shadow-sm border-none bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-950">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 relative group w-24 h-24">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-xl mx-auto">
                                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                                <AvatarFallback className="text-2xl bg-indigo-600 text-white font-bold">
                                    {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-1 mt-1">
                            <Shield className="h-3 w-3" />
                            <Badge variant="secondary" className="uppercase text-[10px] font-bold tracking-tight">
                                {user.role?.replace("_", " ")}
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div className="truncate">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Email Address</p>
                                <p className="text-sm font-medium truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                <UserIcon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">User ID</p>
                                <p className="text-xs font-mono">{user.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Joined System</p>
                                <p className="text-sm font-medium">Recently</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Details Form */}
                <div className="md:col-span-8 space-y-6">
                    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Professional Information</CardTitle>
                            <CardDescription>
                                These details are used for HR, payroll, and academic records.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StaffProfileForm
                                schoolId={user.schoolId!}
                                userId={user.id}
                                initialData={JSON.parse(JSON.stringify(profile))}
                            />
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold">Security Tip</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Avoid sharing your school credentials with anyone. If you suspect your account has been compromised, please change your password immediately or contact the system administrator.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
