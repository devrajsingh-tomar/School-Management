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
    FormDescription,
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
import { issueBook } from "@/lib/actions/library.actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { addDays, format } from "date-fns";

const formSchema = z.object({
    bookId: z.string().min(1, "Select a book"),
    userId: z.string().min(1, "Select a user"),
    days: z.number().min(1, "Minimum 1 day").max(30, "Max 30 days"),
});

export function IssueBookForm({
    books,
    users, // We will pass a simplified list of users for now
    schoolId,
    issuerId,
    onSuccess
}: {
    books: any[];
    users: any[];
    schoolId: string;
    issuerId: string;
    onSuccess?: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bookId: "",
            userId: "",
            days: 7,
        },
    });

    const days = form.watch("days");
    const returnDate = addDays(new Date(), days || 0);

    // Filter only available books
    const availableBooks = books.filter(b => b.availableCopies > 0);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await issueBook({
                schoolId,
                issuedById: issuerId,
                bookId: values.bookId,
                userId: values.userId,
                expectedReturnDate: addDays(new Date(), values.days),
            });

            if (result.success) {
                toast.success("Book issued successfully");
                form.reset();
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Failed to issue book");
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
                    name="userId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select User</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select student or staff" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.map((u: any) => (
                                        <SelectItem key={u._id} value={u._id}>
                                            {u.name} ({u.role})
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
                    name="bookId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select Book</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select book to issue" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableBooks.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">No books available</div>
                                    ) : (
                                        availableBooks.map((b: any) => (
                                            <SelectItem key={b._id} value={b._id}>
                                                {b.title} (Copies: {b.availableCopies})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="days"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Issue Duration (Days)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormDescription>
                                Due Date: {format(returnDate, "PPP")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Issue Book
                </Button>
            </form>
        </Form>
    );
}
