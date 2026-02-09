"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { updateSchoolWebsite, updateSchoolThemeColor } from "@/lib/actions/school.actions";

interface SchoolSettingsClientProps {
    initialData: {
        name: string;
        contactEmail: string;
        websiteUrl?: string;
        settings: {
            themeColor: string;
        };
        subscriptionPlan?: string;
    };
}

export function SchoolSettingsClient({ initialData }: SchoolSettingsClientProps) {
    const { data: session } = useSession();
    const [isPending, startTransition] = useTransition();
    const [websiteUrl, setWebsiteUrl] = useState(initialData.websiteUrl || "");
    const [themeColor, setThemeColor] = useState(initialData.settings.themeColor);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [themeError, setThemeError] = useState<string | null>(null);
    const [themeSuccess, setThemeSuccess] = useState(false);

    const isAdmin = session?.user?.role === "SCHOOL_ADMIN";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            try {
                const result = await updateSchoolWebsite(websiteUrl);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } catch (err: any) {
                setError(err.message || "Failed to update website URL");
            }
        });
    };

    const handleThemeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setThemeError(null);
        setThemeSuccess(false);

        startTransition(async () => {
            try {
                const result = await updateSchoolThemeColor(themeColor);
                setThemeSuccess(true);
                setTimeout(() => setThemeSuccess(false), 3000);
            } catch (err: any) {
                setThemeError(err.message || "Failed to update theme color");
            }
        });
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="School Settings"
                description="Manage your school's configuration and preferences"
                showBackButton
                autoBreadcrumb
            />

            <div className="grid gap-6">
                {/* General Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>
                            Basic details about your school
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="schoolName">School Name</Label>
                            <Input
                                id="schoolName"
                                value={initialData.name}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Contact support to change your school name
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={initialData.contactEmail}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="websiteUrl">
                                    School Website URL
                                    {!isAdmin && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            (Read-only)
                                        </span>
                                    )}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="websiteUrl"
                                        type="url"
                                        placeholder="https://yourschool.com"
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        disabled={!isAdmin || isPending}
                                        className={!isAdmin ? "bg-muted" : ""}
                                    />
                                    {websiteUrl && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            asChild
                                        >
                                            <a
                                                href={websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    This URL will be shown in the "View Website" button in the header
                                </p>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert className="border-green-200 bg-green-50 text-green-900">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription>Website URL updated successfully!</AlertDescription>
                                </Alert>
                            )}

                            {isAdmin && (
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Branding */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branding</CardTitle>
                        <CardDescription>
                            Customize your school's appearance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleThemeSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="themeColor">
                                    Theme Color
                                    {!isAdmin && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            (Read-only)
                                        </span>
                                    )}
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="themeColor"
                                        type="color"
                                        value={themeColor}
                                        onChange={(e) => setThemeColor(e.target.value)}
                                        disabled={!isAdmin || isPending}
                                        className="w-20 h-10 cursor-pointer"
                                    />
                                    <Input
                                        value={themeColor}
                                        onChange={(e) => setThemeColor(e.target.value)}
                                        disabled={!isAdmin || isPending}
                                        placeholder="#4F46E5"
                                        className={!isAdmin ? "bg-muted" : ""}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Choose a primary color for your school's dashboard theme
                                </p>
                            </div>

                            {themeError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{themeError}</AlertDescription>
                                </Alert>
                            )}

                            {themeSuccess && (
                                <Alert className="border-green-200 bg-green-50 text-green-900">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription>Theme color updated successfully!</AlertDescription>
                                </Alert>
                            )}

                            {isAdmin && (
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Theme Color
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Subscription */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription</CardTitle>
                        <CardDescription>
                            Your current subscription plan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <Label>Current Plan</Label>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    {initialData.subscriptionPlan || "FREE"}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Contact support to upgrade your plan
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
