"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
    title: string;
    description: string;
    redirectTo: string;
    type?: "SUPERADMIN" | "SCHOOL" | "PORTAL";
}

export function LoginForm({ title, description, redirectTo, type }: LoginFormProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const identifier = formData.get("identifier") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                identifier,
                password,
                loginType: type,
                redirect: false,
            });

            if (result?.error) {
                // NextAuth might prefix the error or return a generic code
                // Try to extract the meaningful part or use a better fallback
                const errorMessage = result.error === "CredentialsSignin"
                    ? "Invalid credentials. Please try again."
                    : result.error;

                setError(errorMessage);
                setLoading(false);
            } else {
                router.refresh();
                router.push(redirectTo);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again later.");
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                <p className="text-sm text-slate-500">{description}</p>
            </div>

            {error && (
                <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <Label htmlFor="identifier">Email or Phone</Label>
                    <Input
                        id="identifier"
                        name="identifier"
                        placeholder="name@example.com or mobile"
                        required
                        className="h-11 shadow-sm border-slate-200 focus:ring-indigo-600 focus:border-indigo-600"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {type !== "SUPERADMIN" && (
                            <Link href="/forgot-password" title="Coming Soon" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="h-11 shadow-sm border-slate-200 focus:ring-indigo-600 focus:border-indigo-600"
                    />
                </div>

                <div className="flex items-center space-x-2 py-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm font-medium leading-none text-slate-600">
                        Remember me for 30 days
                    </label>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full font-bold shadow-md"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing you in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>
            </form>
        </div>
    );
}
