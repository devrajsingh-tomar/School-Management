import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { getFeatureFlags, initializeFeatureFlags } from "@/lib/actions/feature-flag.actions";
import { FeatureToggle } from "@/components/admin/feature-toggle";

export default async function FeatureFlagsPage() {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
        redirect("/school");
    }

    // Auto-init for first run
    const flags = await getFeatureFlags();
    if (flags.length === 0) {
        await initializeFeatureFlags();
        // re-fetch (simplest way, albeit one extra DB call on cold start)
        return redirect("/superadmin/features");
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Feature Flags</h1>
                <p className="text-gray-500">Enable or disable system-wide modules and experimental features. Changes affect all schools.</p>
            </div>

            <Separator />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Modules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {flags.map((flag: any) => (
                            <div key={flag._id}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-medium">{flag.name}</Label>
                                        <p className="text-sm text-gray-500">{flag.description}</p>
                                        <p className="text-xs text-gray-400 font-mono">{flag.key}</p>
                                    </div>
                                    <FeatureToggle id={flag._id} isEnabled={flag.isEnabled} />
                                </div>
                                <Separator className="mt-6" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
