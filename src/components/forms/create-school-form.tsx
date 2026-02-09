"use client";

import { useActionState } from "react";
import { createSchool, CreateSchoolState } from "@/lib/actions/school.actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, School, Globe, Shield } from "lucide-react";
import Link from "next/link";

const initialState: CreateSchoolState = { message: "", errors: {} };

export default function CreateSchoolForm() {
    const [state, formAction, isPending] = useActionState(createSchool, initialState);

    return (
        <form action={formAction} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <School size={20} />
                    <h3 className="text-lg font-bold tracking-tight">Institutional Information</h3>
                </div>

                {state.message && (
                    <div className={cn(
                        "rounded-lg p-4 text-sm font-medium border flex items-center gap-3",
                        state.errors && Object.keys(state.errors).length > 0
                            ? "bg-rose-50 border-rose-100 text-rose-800"
                            : "bg-emerald-50 border-emerald-100 text-emerald-800"
                    )}>
                        <div className={cn("h-2 w-2 rounded-full", state.errors && Object.keys(state.errors).length > 0 ? "bg-rose-500" : "bg-emerald-500")} />
                        {state.message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">School Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. St. Andrews Global School"
                            required
                            className="h-11 shadow-sm border-slate-200 focus:ring-indigo-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug" className="flex items-center gap-1">
                            <Globe size={14} className="text-slate-400" />
                            Subdomain Slug
                        </Label>
                        <div className="flex items-center">
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="st-andrews"
                                required
                                className="h-11 rounded-r-none border-r-0 shadow-sm border-slate-200 focus:ring-indigo-600"
                            />
                            <div className="h-11 px-3 flex items-center bg-slate-50 border border-slate-200 border-l-0 rounded-r-md text-slate-500 text-sm font-medium">
                                .eduflow.io
                            </div>
                        </div>
                        {state.errors?.slug && <p className="text-xs font-bold text-rose-600 mt-1">{state.errors.slug}</p>}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="contactEmail">School Contact Email</Label>
                        <Input
                            id="contactEmail"
                            type="email"
                            name="contactEmail"
                            placeholder="info@yourschool.com"
                            required
                            className="h-11 shadow-sm border-slate-200 focus:ring-indigo-600"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="subscriptionPlan">Choose Your Plan</Label>
                        <select
                            id="subscriptionPlan"
                            name="subscriptionPlan"
                            className="flex h-11 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer"
                        >
                            <option value="FREE">Free Trial (14 Days)</option>
                            <option value="BASIC">Basic Growth Plan</option>
                            <option value="PREMIUM">Enterprise Premium</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <div className="flex items-center gap-2 text-indigo-600 mb-6 font-bold">
                    <Shield size={20} />
                    <h3 className="text-lg tracking-tight">Super Admin Setup</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="adminName">Full Name</Label>
                        <Input
                            id="adminName"
                            name="adminName"
                            placeholder="John Doe"
                            required
                            className="h-11 shadow-sm border-slate-200 focus:ring-indigo-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adminEmail">Admin Login Email</Label>
                        <Input
                            id="adminEmail"
                            type="email"
                            name="adminEmail"
                            placeholder="admin@school.com"
                            required
                            className="h-11 shadow-sm border-slate-200 focus:ring-indigo-600"
                        />
                        {state.errors?.adminEmail && <p className="text-xs font-bold text-rose-600 mt-1">{state.errors.adminEmail}</p>}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="adminPassword">Master Password</Label>
                        <Input
                            id="adminPassword"
                            type="password"
                            name="adminPassword"
                            placeholder="••••••••"
                            required
                            className="h-11 shadow-sm border-slate-200 focus:ring-indigo-600"
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Provisioning School...
                    </>
                ) : (
                    "Register School & Get Access"
                )}
            </Button>

            <p className="text-center text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                By registering, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>. Your data is encrypted and secure.
            </p>
        </form>
    );
}
