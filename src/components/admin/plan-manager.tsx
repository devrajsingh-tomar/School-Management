"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { createPlan } from "@/lib/actions/saas.actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function PlanManager({ plans }: { plans: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const data = {
                name: formData.get("name"),
                price: parseFloat(formData.get("price") as string),
                limits: {
                    users: parseInt(formData.get("limitUsers") as string),
                    storage: parseInt(formData.get("limitStorage") as string),
                },
                features: (formData.get("features") as string)?.split(",").map(s => s.trim()),
                isActive: true
            };

            const res = await createPlan(data);
            if (res.success) {
                toast.success("Plan created successfully");
                setOpen(false);
            } else {
                toast.error(res.error || "Failed");
            }
        } catch (err) {
            toast.error("Error creating plan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create New Plan</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Subscription Plan</DialogTitle>
                            <DialogDescription>
                                Define limits and pricing for a new tier.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" name="name" className="col-span-3" placeholder="e.g. Gold" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Price</Label>
                                <Input id="price" name="price" type="number" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="limitUsers" className="text-right">Max Users</Label>
                                <Input id="limitUsers" name="limitUsers" type="number" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="limitStorage" className="text-right">Storage (GB)</Label>
                                <Input id="limitStorage" name="limitStorage" type="number" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="features" className="text-right">Features</Label>
                                <Input id="features" name="features" className="col-span-3" placeholder="HR, Reports, Transport" />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>Create Plan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan._id}>
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>₹{plan.price} / month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>{plan.limits.users}</strong> Users Limit</li>
                                <li><strong>{plan.limits.storage}</strong> GB Storage</li>
                                {plan.features.map((f: string) => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
