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
import { adjustStock } from "@/lib/actions/inventory.actions";
import { useState } from "react";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const formSchema = z.object({
    itemId: z.string().min(1, "Select an item"),
    type: z.enum(["IN", "OUT"]),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    reference: z.string().optional(),
});

export function StockAdjustmentForm({
    items,
    schoolId,
    userId,
    defaultType = "IN",
    onSuccess
}: {
    items: any[];
    schoolId: string;
    userId: string;
    defaultType?: "IN" | "OUT";
    onSuccess?: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemId: "",
            type: defaultType,
            quantity: 1,
            reference: "",
        },
    });

    const type = form.watch("type");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await adjustStock({
                schoolId,
                userId,
                ...values,
            });

            if (result.success) {
                toast.success(`Stock ${values.type === "IN" ? "Added" : "Issued"} successfully`);
                form.reset({
                    ...form.getValues(),
                    quantity: 1,
                    reference: "",
                });
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Failed to update stock");
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
                    name="itemId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select Item</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select inventory item" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {items.map((item: any) => (
                                        <SelectItem key={item._id} value={item._id}>
                                            {item.name} (Cur: {item.quantity} {item.unit})
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
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Transaction Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="IN">Stock IN (Restock)</SelectItem>
                                    <SelectItem value="OUT">Stock OUT (Issue/Consume)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
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
                    <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder={type === "IN" ? "PO #1234" : "Issued to Class 5A"} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full ${type === "OUT" ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : type === "IN" ? (
                        <ArrowLeft className="mr-2 h-4 w-4 rotate-[-45deg]" />
                    ) : (
                        <ArrowRight className="mr-2 h-4 w-4 rotate-[-45deg]" />
                    )}
                    {type === "IN" ? "Add Stock" : "Issue Stock"}
                </Button>
            </form>
        </Form>
    );
}
