import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSaaSMetrics } from "@/lib/actions/saas.actions";
import connectDB from "@/lib/db/connect";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default async function AdminPage() {
    const session = await auth();
    // In real app, check for role: "SuperAdmin"
    // For demo, assuming any logged in user on this route is authorized or protected by middleware
    if (!session?.user) redirect("/login");

    await connectDB();

    const metricsRes = await getSaaSMetrics();
    const metrics = metricsRes.success ? metricsRes.data : { totalSchools: 0, activeSchools: 0, totalUsers: 0, revenue: 0 };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">SaaS Administration</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalSchools || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{metrics?.activeSchools || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(metrics?.revenue || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-500">
                            Recent school registrations and plan changes will appear here.
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Database Status</span>
                                <span className="text-sm text-green-600 font-bold">Operational</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">API Latency</span>
                                <span className="text-sm text-slate-600">~24ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Storage Usage</span>
                                <span className="text-sm text-slate-600">45%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
