"use client";

import { useTransition } from "react";
import { toggleFeatureFlag } from "@/lib/actions/feature-flag.actions";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function FeatureToggle({ id, isEnabled }: { id: string, isEnabled: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        startTransition(async () => {
            const res = await toggleFeatureFlag(id, checked);
            if (res.success) {
                toast.success(checked ? "Feature enabled" : "Feature disabled");
            } else {
                toast.error(res.message || "Failed to toggle feature");
            }
        });
    };

    return (
        <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isPending}
        />
    );
}
