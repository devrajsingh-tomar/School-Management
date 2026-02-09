"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);

    if (submitted) {
        return (
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
                    <p className="text-sm text-slate-500">
                        We've sent a password reset link to your registered email address.
                    </p>
                </div>
                <Button variant="outline" className="w-full h-11" asChild>
                    <Link href="/login">Return to login</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Forgot password?</h1>
                <p className="text-sm text-slate-500">
                    No worries, we'll send you reset instructions.
                </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@school.com"
                        required
                        className="h-11 shadow-sm border-slate-200"
                    />
                </div>
                <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold">
                    Reset Password
                </Button>
            </form>

            <div className="pt-4 text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
                >
                    <ArrowLeft size={16} />
                    Back to login
                </Link>
            </div>
        </div>
    );
}
