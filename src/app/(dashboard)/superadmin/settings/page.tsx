import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>General Configuration</CardTitle>
                        <CardDescription>Global application settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Application Name</Label>
                            <Input defaultValue="EduFlow SaaS" />
                        </div>
                        <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input defaultValue="support@eduflow.io" />
                        </div>
                        <Button>Save Changes</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Maintenance</CardTitle>
                        <CardDescription>System maintenance controls.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div>
                                <div className="font-medium">Maintenance Mode</div>
                                <div className="text-sm text-slate-500">Disable access for all tenants</div>
                            </div>
                            <Button variant="destructive" size="sm">Enable</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
