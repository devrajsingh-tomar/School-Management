import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginSelectorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-sm border-slate-200">
                <CardHeader className="text-center space-y-2 pb-8 pt-8">
                    <h1 className="text-2xl font-bold text-slate-900">Welcome to EduFlow</h1>
                    <p className="text-sm text-slate-500">Choose how you want to sign in</p>
                </CardHeader>

                <CardContent className="space-y-3 pb-8">
                    <Button
                        asChild
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-base font-semibold"
                    >
                        <Link href="/school/login">School / Staff Login</Link>
                    </Button>

                    <Button
                        asChild
                        className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-base font-semibold"
                    >
                        <Link href="/portal/login">Student / Parent Login</Link>
                    </Button>

                    <div className="pt-4 text-center">
                        <Link
                            href="/superadmin/login"
                            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            SuperAdmin Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
