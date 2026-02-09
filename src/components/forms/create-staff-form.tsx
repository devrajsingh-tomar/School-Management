"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSchema, StaffFormData } from "@/lib/validators/staff";
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createStaffAccount } from "@/lib/actions/staff.actions";
import { useState } from "react";
import { Loader2, ShieldCheck, Briefcase, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Strict type for form values to match schema expectations exactly
type StaffFormValues = {
    name: string;
    role: "TEACHER" | "ACCOUNTANT" | "LIBRARIAN" | "TRANSPORT_MANAGER" | "STAFF";
    email?: string;
    phone?: string;
    password: string;
    designation: string;
    department: string;
    joiningDate: Date;
    basicSalary: number;
};

export function CreateStaffForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            name: "",
            email: undefined,
            phone: undefined,
            role: "TEACHER",
            password: Math.random().toString(36).slice(-8),
            designation: "",
            department: "",
            joiningDate: new Date(),
            basicSalary: 0,
        },
    });

    async function onSubmit(values: StaffFormValues) {
        setIsSubmitting(true);
        try {
            const result = await createStaffAccount(values);

            if (result.success) {
                toast.success(result.message);
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.message || "Failed to create staff account");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-700">
                            <h3 className="text-sm font-semibold uppercase tracking-wider">Basic Information</h3>
                        </div>
                        <Separator />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@school.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="99999 88888" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="TEACHER">Teacher</SelectItem>
                                            <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                            <SelectItem value="LIBRARIAN">Librarian</SelectItem>
                                            <SelectItem value="TRANSPORT_MANAGER">Transport Manager</SelectItem>
                                            <SelectItem value="STAFF">General Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Login Credentials Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <ShieldCheck size={18} />
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Login Credentials</h3>
                        </div>
                        <Separator />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Auto-generated password. You can customize it if needed.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Job Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-violet-600">
                            <Briefcase size={18} />
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Job Details</h3>
                        </div>
                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            <Input placeholder="Mathematics" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Salary Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <DollarSign size={18} />
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Salary</h3>
                        </div>
                        <Separator />

                        <FormField
                            control={form.control}
                            name="basicSalary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Basic Salary</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="50000"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="border-t bg-white px-6 py-4 flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onSuccess?.()}
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Staff Account
                    </Button>
                </div>
            </form>
        </Form>
    );
}
