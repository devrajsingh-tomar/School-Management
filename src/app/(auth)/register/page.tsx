"use client";

import CreateSchoolForm from "@/components/forms/create-school-form";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Register your school</h1>
                <p className="text-sm text-slate-500">
                    Get started with a 14-day free trial. No credit card required.
                </p>
            </div>

            <div className="bg-white">
                <CreateSchoolForm />
            </div>

            <div className="pt-4 text-center">
                <p className="text-sm text-slate-500">
                    Already have a school account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-4"
                    >
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
