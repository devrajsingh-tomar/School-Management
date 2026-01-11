import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolsTable } from "@/components/admin/schools-table";
import { PlanManager } from "@/components/admin/plan-manager";
import { getAllSchools, getPlans, getSaaSMetrics } from "@/lib/actions/saas.actions";
import { seedPlans } from "@/lib/actions/subscription.actions";
import { connectDB } from "@/lib/db/connect";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";

export default async function AdminPage() {
    const session = await auth();
    // In real app, check for role: "SuperAdmin"
    // For demo, assuming any logged in user on this route is authorized or protected by middleware
    if (!session?.user) redirect("/login");

    await connectDB();

    const [schoolsRes, plansRes, metricsRes] = await Promise.all([
        getAllSchools(),
        getPlans(),
        getSaaSMetrics()
    ]);

    const schools = schoolsRes.success ? schoolsRes.data : [];
    const plans = plansRes.success ? plansRes.data : [];
    const metrics = metricsRes.success ? metricsRes.data : { totalSchools: 0, activeSchools: 0, totalUsers: 0, revenue: 0 };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">SaaS Administration</h2>
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalSchools}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{metrics.activeSchools}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{metrics.revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="schools" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="schools">Schools Management</TabsTrigger>
                    <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                </TabsList>
                <TabsContent value="schools" className="space-y-4">
                    <SchoolsTable schools={schools} plans={plans} />
                </TabsContent>
                <TabsContent value="plans" className="space-y-4">
                    <PlanManager plans={plans} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
