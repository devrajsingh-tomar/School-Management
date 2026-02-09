import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Billing & Invoices</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>View all recent invoices and payment statuses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                        No invoices generated yet.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
