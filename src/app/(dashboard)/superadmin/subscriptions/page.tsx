import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SubscriptionsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Subscriptions</CardTitle>
                    <CardDescription>View and manage active subscriptions across all tenants.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                        No active subscriptions found.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
