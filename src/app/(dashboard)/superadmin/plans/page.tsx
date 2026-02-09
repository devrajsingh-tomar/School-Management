import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPlans } from "@/lib/actions/saas.actions";
import { seedPlans } from "@/lib/actions/subscription.actions";
import connectDB from "@/lib/db/connect";
import { PlanManager } from "@/components/admin/plan-manager";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default async function PlansPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    await connectDB();

    const plansRes = await getPlans();
    const plans = plansRes.success ? plansRes.data : [];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Plans & Subscriptions</h2>
                <form action={async () => {
                    "use server";
                    await seedPlans();
                }}>
                    <Button type="submit" variant="outline" size="sm">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Reset/Seed Plans
                    </Button>
                </form>
            </div>
            <div className="space-y-4">
                <PlanManager plans={plans} />
            </div>
        </div>
    );
}
