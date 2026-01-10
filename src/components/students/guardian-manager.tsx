"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createGuardian } from "@/lib/actions/guardian.actions";
import { addGuardianToStudent, removeGuardianFromStudent } from "@/lib/actions/student.actions";
import { guardianSchema } from "@/lib/validators/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Plus } from "lucide-react";

type GuardianFormData = z.infer<typeof guardianSchema>;

export default function GuardianManager({
    studentId,
    guardians,
}: {
    studentId: string;
    guardians: any[];
}) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<GuardianFormData>({
        resolver: zodResolver(guardianSchema),
        defaultValues: {
            relationship: "Father",
        },
    });

    const onSubmit = async (data: GuardianFormData) => {
        setLoading(true);
        try {
            // 1. Create Guardian
            const newGuardian = await createGuardian(data);
            // 2. Link to Student
            await addGuardianToStudent(studentId, newGuardian._id);

            form.reset();
            setShowForm(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to add guardian");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (guardianId: string) => {
        if (!confirm("Are you sure you want to remove this guardian?")) return;
        try {
            await removeGuardianFromStudent(studentId, guardianId);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to remove guardian");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Guardians</h3>
                <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Guardian
                </Button>
            </div>

            {showForm && (
                <div className="border p-4 rounded-md bg-gray-50">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input {...form.register("firstName")} placeholder="First Name" />
                            <Input {...form.register("lastName")} placeholder="Last Name" />
                            <Input {...form.register("phone")} placeholder="Phone" />
                            <Input {...form.register("email")} placeholder="Email" />
                            <Input {...form.register("relationship")} placeholder="Relationship" />
                            <Input {...form.register("occupation")} placeholder="Occupation" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Save
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-2">
                {guardians.length === 0 ? (
                    <p className="text-sm text-gray-500">No guardians linked.</p>
                ) : (
                    guardians.map((g) => (
                        <div key={g._id} className="flex justify-between items-center border p-3 rounded-md">
                            <div>
                                <p className="font-medium">{g.firstName} {g.lastName} <span className="text-xs text-gray-500">({g.relationship})</span></p>
                                <p className="text-sm text-gray-500">{g.phone} • {g.email}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleRemove(g._id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
