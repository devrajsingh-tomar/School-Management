"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backupData, updatePermissions } from "@/lib/actions/settings.actions";
import { toast } from "sonner";
import { Download, Save } from "lucide-react";
import { useState } from "react";

const ROLES = ["Admin", "Teacher", "Student", "Parent", "Accountant"];
const PERMISSIONS = [
    "manage_students",
    "manage_staff",
    "manage_finance",
    "view_reports",
    "manage_hostel",
    "manage_library"
];

// Mock initial data or fetch via props
const INITIAL_PERMISSIONS = {
    "Admin": [...PERMISSIONS], // All
    "Teacher": ["manage_students", "view_reports"],
    "Accountant": ["manage_finance"],
    "Student": [],
    "Parent": []
};

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>

            <Tabs defaultValue="permissions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
                    <TabsTrigger value="backup">Data Backup</TabsTrigger>
                </TabsList>

                <TabsContent value="permissions">
                    <PermissionsMatrix />
                </TabsContent>

                <TabsContent value="backup">
                    <BackupPanel />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PermissionsMatrix() {
    // Stateto track changes. In real app, fetch from DB.
    const [matrix, setMatrix] = useState<Record<string, string[]>>(INITIAL_PERMISSIONS);
    const [saving, setSaving] = useState(false);

    function togglePermission(role: string, perm: string) {
        setMatrix(prev => {
            const current = prev[role] || [];
            const updated = current.includes(perm)
                ? current.filter(p => p !== perm)
                : [...current, perm];
            return { ...prev, [role]: updated };
        });
    }

    async function handleSave() {
        setSaving(true);
        try {
            // Save all roles
            await Promise.all(Object.entries(matrix).map(([role, perms]) =>
                updatePermissions(role, perms)
            ));
            toast.success("Permissions updated successfully");
        } catch (error) {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Role Permission Matrix</CardTitle>
                <CardDescription>Configure what each role can access.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted">
                            <tr>
                                <th className="px-6 py-3">Permission</th>
                                {ROLES.map(role => <th key={role} className="px-6 py-3">{role}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {PERMISSIONS.map(perm => (
                                <tr key={perm} className="border-b">
                                    <td className="px-6 py-4 font-medium">{perm}</td>
                                    {ROLES.map(role => (
                                        <td key={`${role}-${perm}`} className="px-6 py-4 text-center">
                                            <Checkbox
                                                checked={(matrix[role] || []).includes(perm)}
                                                onCheckedChange={() => togglePermission(role, perm)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function BackupPanel() {
    const [loading, setLoading] = useState(false);

    async function handleBackup() {
        setLoading(true);
        try {
            // Hardcoded schoolId for demo, in real component pass from props
            const res = await backupData("mock_school_id");
            if (res.success && res.data) {
                const blob = new Blob([res.data], { type: "application/json" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `backup-${new Date().toISOString()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Backup downloaded");
            } else {
                toast.error("Backup failed");
            }
        } catch (e) {
            toast.error("Error creating backup");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data Backup</CardTitle>
                <CardDescription>Download a JSON dump of your critical data.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleBackup} disabled={loading} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Download System Backup
                </Button>
            </CardContent>
        </Card>
    );
}
