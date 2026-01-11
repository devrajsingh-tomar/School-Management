import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader title="School Settings" description="Manage school profile and configurations." />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>General Profile</CardTitle>
                        <CardDescription>Update school details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label>School Name</Label>
                            <Input defaultValue="Springfield High" />
                        </div>
                        <div className="space-y-1">
                            <Label>Contact Email</Label>
                            <Input defaultValue="admin@springfield.edu" />
                        </div>
                        <Button>Save Changes</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Theme & Branding</CardTitle>
                        <CardDescription>Customize appearance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-600 ring-2 ring-offset-2 ring-blue-600"></div>
                                <div className="h-8 w-8 rounded-full bg-green-600 cursor-pointer"></div>
                                <div className="h-8 w-8 rounded-full bg-red-600 cursor-pointer"></div>
                            </div>
                        </div>
                        <Button variant="outline">Reset to Default</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
