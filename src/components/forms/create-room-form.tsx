"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createRoom } from "@/lib/actions/hostel.actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    hostelId: z.string().min(1, "Select a hostel"),
    roomNumber: z.string().min(1, "Room number is required"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    type: z.enum(["AC", "Non-AC"]),
});

export function CreateRoomForm({ hostels, schoolId, onSuccess }: { hostels: any[]; schoolId: string; onSuccess?: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hostelId: "",
            roomNumber: "",
            capacity: 4,
            type: "Non-AC",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await createRoom({
                schoolId,
                ...values,
            });

            if (result.success) {
                toast.success("Room created successfully");
                form.reset();
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Failed to create room");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="hostelId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select Hostel</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a hostel" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {hostels.map((h: any) => (
                                        <SelectItem key={h._id} value={h._id}>
                                            {h.name} ({h.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="roomNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="101" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Non-AC">Non-AC</SelectItem>
                                    <SelectItem value="AC">AC</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Room
                </Button>
            </form>
        </Form>
    );
}
