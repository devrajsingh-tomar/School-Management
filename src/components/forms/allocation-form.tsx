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
import { toast } from "sonner";
import { allocateRoom, getRooms } from "@/lib/actions/hostel.actions";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    hostelId: z.string().min(1, "Select a hostel"), // Used for filtering rooms
    roomId: z.string().min(1, "Select a room"),
    studentId: z.string().min(1, "Select a student"),
});

export function AllocationForm({
    schoolId,
    hostels,
    students, // Pass simple list of students
    onSuccess
}: {
    schoolId: string;
    hostels: any[];
    students: any[];
    onSuccess?: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hostelId: "",
            roomId: "",
            studentId: "",
        },
    });

    const selectedHostelId = form.watch("hostelId");

    // Fetch rooms when hostel changes
    useEffect(() => {
        if (!selectedHostelId) {
            setRooms([]);
            return;
        }
        async function fetch() {
            setLoadingRooms(true);
            const res = await getRooms(selectedHostelId);
            if (res.success) {
                // Filter only rooms having space
                setRooms(res.data.filter((r: any) => r.occupied < r.capacity));
            }
            setLoadingRooms(false);
        }
        fetch();
    }, [selectedHostelId]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await allocateRoom({
                schoolId,
                studentId: values.studentId,
                roomId: values.roomId,
            });

            if (result.success) {
                toast.success("Room allocated successfully");
                form.reset({
                    hostelId: values.hostelId, // Keep hostel selected
                    roomId: "",
                    studentId: "",
                });
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Failed to allocate room");
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
                    name="studentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Student</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {students.map((s: any) => (
                                        <SelectItem key={s._id} value={s._id}>
                                            {s.name} ({s.class?.name || "No Class"})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="hostelId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hostel</FormLabel>
                            <Select onValueChange={(val) => {
                                field.onChange(val);
                                form.setValue("roomId", ""); // Reset room when hostel changes
                            }} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select hostel" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {hostels.map((h: any) => (
                                        <SelectItem key={h._id} value={h._id}>
                                            {h.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="roomId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedHostelId || loadingRooms}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingRooms ? "Loading rooms..." : "Select room"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {rooms.length === 0 && !loadingRooms ? (
                                        <div className="p-2 text-sm text-muted-foreground">No available rooms</div>
                                    ) : (
                                        rooms.map((r: any) => (
                                            <SelectItem key={r._id} value={r._id}>
                                                {r.roomNumber} ({r.capacity - r.occupied} beds left)
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Allocate
                </Button>
            </form>
        </Form>
    );
}
