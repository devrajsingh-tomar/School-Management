import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import Student from "@/lib/db/models/Student";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCircle, Shield, KeyRound, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ActionState } from "@/lib/types/actions";
import { ChangePasswordForm } from "@/components/forms/change-password-form";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) redirect("/portal/login");

    await connectDB();
    const userDoc = await User.findById(session.user.id).populate({
        path: "linkedStudentId",
        strictPopulate: false
    });
    if (!userDoc) redirect("/portal/login");

    let studentData: any = null;
    if (userDoc?.linkedStudentId) {
        studentData = userDoc.linkedStudentId;
    } else if (userDoc?.children && (userDoc.children as any).length > 0) {
        // For parents, get first child as primary linked student for now
        studentData = await Student.findById((userDoc.children as any)[0]).populate("class section");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile & Security</h1>
                <p className="text-slate-500 text-sm">Manage your account information and password.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Info */}
                <Card className="md:col-span-2 shadow-sm border-slate-200">
                    <CardHeader className="border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <UserCircle size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                                <CardDescription>Basic details about your account.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider">Full Name</Label>
                                <p className="text-sm font-semibold text-slate-900">{userDoc?.name}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider">Account Role</Label>
                                <p className="text-sm font-semibold text-slate-900 capitalize">{userDoc?.role?.toLowerCase()}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider">Email Address</Label>
                                <p className="text-sm font-semibold text-slate-900">{userDoc?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider">Phone Number</Label>
                                <p className="text-sm font-semibold text-slate-900">{userDoc?.phone || "Not provided"}</p>
                            </div>
                        </div>

                        {studentData && (
                            <div className="pt-6 border-t border-slate-100">
                                <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-4">Linked Student Details</Label>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-slate-200 text-indigo-600 font-bold shadow-sm">
                                        {studentData.firstName?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">{studentData.firstName} {studentData.lastName}</p>
                                        <p className="text-xs text-slate-500 font-medium">ADMISSION NO: {studentData.admissionNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded italic">
                                            {(studentData.class as any)?.name || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Password Change */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <KeyRound size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Security</CardTitle>
                                <CardDescription>Update your password.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ChangePasswordForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
