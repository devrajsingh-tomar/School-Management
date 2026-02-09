"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ChangePasswordForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const currentPassword = formData.get("current") as string;
        const newPassword = formData.get("new") as string;
        const confirmPassword = formData.get("confirm") as string;

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const result = await changePassword({ currentPassword, newPassword });
            if (result.success) {
                toast.success("Password updated successfully");
                (event.target as HTMLFormElement).reset();
            } else {
                toast.error(result.message || "Failed to update password");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" name="current" type="password" placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" name="new" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 font-bold mt-2 shadow-md"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                    </>
                ) : (
                    "Update Password"
                )}
            </Button>
        </form>
    );
}
