"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { studentSchema } from "@/lib/validators/student";
import { createStudent, updateStudent } from "@/lib/actions/student.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
    initialData?: any;
    classes: any[];
    houses: any[];
    categories: any[];
}

export default function StudentForm({
    initialData,
    classes,
    houses,
    categories,
}: StudentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string>(
        initialData?.class?._id || initialData?.class || ""
    );

    const form = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
        defaultValues: initialData
            ? {
                ...initialData,
                dob: initialData.dob ? new Date(initialData.dob) : undefined,
                class: initialData.class?._id || initialData.class,
                section: initialData.section?._id || initialData.section || "",
                house: initialData.house?._id || initialData.house || "",
                category: initialData.category?._id || initialData.category || "",
                address: initialData.address || {}
            }
            : {
                gender: "Male",
                status: "Enquiry",
                address: {}
            },
    });

    const selectedClass = classes.find((c) => c._id === selectedClassId);
    const sections = selectedClass?.sections || [];

    const onSubmit = async (data: StudentFormData) => {
        setLoading(true);
        try {
            if (initialData) {
                await updateStudent(initialData._id, data);
            } else {
                await createStudent(data);
            }
            toast.success("Student saved successfully");
            router.push("/school/students");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Basic details about the student.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">First Name</label>
                            <Input {...form.register("firstName")} placeholder="John" />
                            {form.formState.errors.firstName && <p className="text-red-500 text-xs">{form.formState.errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Last Name</label>
                            <Input {...form.register("lastName")} placeholder="Doe" />
                            {form.formState.errors.lastName && <p className="text-red-500 text-xs">{form.formState.errors.lastName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                            <Input {...form.register("email")} type="email" placeholder="student@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone</label>
                            <Input {...form.register("phone")} placeholder="+91 99999 99999" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Date of Birth</label>
                            <Input
                                type="date"
                                {...form.register("dob", { valueAsDate: true })}
                                defaultValue={initialData?.dob ? format(new Date(initialData.dob), "yyyy-MM-dd") : ""}
                            />
                            {form.formState.errors.dob && <p className="text-red-500 text-xs">{form.formState.errors.dob.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Gender</label>
                            <Select onValueChange={(val) => form.setValue("gender", val as any)} defaultValue={form.getValues("gender")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Academic Details</CardTitle>
                    <CardDescription>Class, Section, and Enrollment info.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Admission Number</label>
                            <Input {...form.register("admissionNumber")} />
                            {form.formState.errors.admissionNumber && <p className="text-red-500 text-xs">{form.formState.errors.admissionNumber.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Roll Number</label>
                            <Input {...form.register("rollNumber")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
                            <Select onValueChange={(val) => form.setValue("status", val as any)} defaultValue={form.getValues("status")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Enquiry">Enquiry</SelectItem>
                                    <SelectItem value="Admitted">Admitted</SelectItem>
                                    <SelectItem value="Suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Class</label>
                            <Select
                                onValueChange={(val) => {
                                    form.setValue("class", val); // zod check needs raw string
                                    setSelectedClassId(val);
                                    form.setValue("section", "");
                                }}
                                defaultValue={selectedClassId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Section</label>
                            <Select
                                disabled={!selectedClassId}
                                onValueChange={(val) => form.setValue("section", val)}
                                defaultValue={form.getValues("section")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
                            <Select onValueChange={(val) => form.setValue("category", val)} defaultValue={form.getValues("category")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium leading-none">Street Address</label>
                            <Input {...form.register("address.street")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">City</label>
                            <Input {...form.register("address.city")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">State</label>
                            <Input {...form.register("address.state")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Zip Code</label>
                            <Input {...form.register("address.zipCode")} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
