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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { sendBulkMessage } from "@/lib/actions/communication.actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    content: z.string().min(1, "Message content is required"),
    channel: z.enum(["SMS", "WhatsApp"]),
    audience: z.enum(["Class", "Staff"]),
    targetClass: z.string().optional(),
});

export function SendMessageForm({
    classes,
    schoolId,
    authorId,
    onSuccess,
}: {
    classes: any[];
    schoolId: string;
    authorId: string;
    onSuccess?: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
            channel: "SMS",
            audience: "Class",
        },
    });

    const audience = form.watch("audience");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await sendBulkMessage({
                schoolId,
                authorId,
                ...values,
            });

            if (result.success) {
                toast.success(`Sent ${result.count} messages successfully`);
                form.reset();
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Failed to send messages");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="channel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Channel</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="SMS" id="sms" />
                                        <Label htmlFor="sms">SMS</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="WhatsApp" id="whatsapp" />
                                        <Label htmlFor="whatsapp">WhatsApp</Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="audience"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Recipient Group</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Class">Class (Specific Class)</SelectItem>
                                    <SelectItem value="Student">All Students</SelectItem>
                                    <SelectItem value="Parent">All Parents</SelectItem>
                                    <SelectItem value="Staff">All Staff</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {audience === "Class" && (
                    <FormField
                        control={form.control}
                        name="targetClass"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Target Class</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classes.map((c: any) => (
                                            <SelectItem key={c._id} value={c._id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message Content</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Type your message here..."
                                    className="resize-none h-32"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                {field.value.length} characters. (SMS limit is typically 160)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Message
                </Button>
            </form>
        </Form>
    );
}
