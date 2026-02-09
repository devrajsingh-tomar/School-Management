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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createOrUpdateStaffProfile } from "@/lib/actions/hr.actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    designation: z.string().min(1, "Designation is required"),
    department: z.string().min(1, "Department is required"),
    joiningDate: z.string(), // We'll parse to Date
    basic: z.number().min(0),
    allowances: z.number().min(0),
    deductions: z.number().min(0),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    ifsc: z.string().optional(),
});

export function StaffProfileForm({
    schoolId,
    userId,
    initialData,
    onSuccess
}: {
    schoolId: string;
    userId: string;
    initialData?: any;
    onSuccess?: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            designation: initialData?.designation || "",
            department: initialData?.department || "",
            joiningDate: initialData?.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            basic: initialData?.salaryStructure?.basic || 0,
            allowances: initialData?.salaryStructure?.allowances || 0,
            deductions: initialData?.salaryStructure?.deductions || 0,
            accountNumber: initialData?.bankDetails?.accountNumber || "",
            bankName: initialData?.bankDetails?.bankName || "",
            ifsc: initialData?.bankDetails?.ifsc || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await createOrUpdateStaffProfile({
                schoolId,
                userId,
                designation: values.designation,
                department: values.department,
                joiningDate: new Date(values.joiningDate),
                salaryStructure: {
                    basic: values.basic,
                    allowances: values.allowances,
                    deductions: values.deductions,
                },
                bankDetails: {
                    accountNumber: values.accountNumber || "",
                    bankName: values.bankName || "",
                    ifsc: values.ifsc || "",
                },
            });

            if (result.success) {
                toast.success("Profile updated successfully");
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.error || "Failed to update profile");
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <FormControl>
                                    <Input placeholder="Senior Teacher" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input placeholder="Science" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="joiningDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Joining Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="border p-4 rounded-md space-y-4">
                    <h3 className="font-medium text-sm">Salary Structure</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="basic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Basic</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
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
                            name="allowances"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Allowances</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
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
                            name="deductions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deductions</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="border p-4 rounded-md space-y-4">
                    <h3 className="font-medium text-sm">Bank Details</h3>
                    <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="HDFC Bank" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account No</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ifsc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>IFSC Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="HDFC000123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                </Button>
            </form>
        </Form>
    );
}
