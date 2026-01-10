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
    const [error, setError] = useState("");
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
            }
            : {
                gender: "Male",
                status: "Enquiry",
            },
    } as any,

    const selectedClass = classes.find((c) => c._id === selectedClassId);
    const sections = selectedClass?.sections || [];

    const onSubmit = async (data: StudentFormData) => {
        setLoading(true);
        setError("");

        try {
            if (initialData) {
                await updateStudent(initialData._id, data);
            } else {
                await createStudent(data);
            }
            router.push("/school/students");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium">First Name</label>
                            <Input {...form.register("firstName")} placeholder="John" />
                            {form.formState.errors.firstName && (
                                <p className="text-red-500 text-xs mt-1">
                                    {form.formState.errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Last Name</label>
                            <Input {...form.register("lastName")} placeholder="Doe" />
                            {form.formState.errors.lastName && (
                                <p className="text-red-500 text-xs mt-1">
                                    {form.formState.errors.lastName.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Date of Birth</label>
                            <Input
                                type="date"
                                {...form.register("dob", { valueAsDate: true })}
                                // Format date for input value if initialData exists
                                defaultValue={
                                    initialData?.dob
                                        ? format(new Date(initialData.dob), "yyyy-MM-dd")
                                        : undefined
                                }
                            />
                            {form.formState.errors.dob && (
                                <p className="text-red-500 text-xs mt-1">
                                    {form.formState.errors.dob.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Gender</label>
                            <select
                                {...form.register("gender")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email (Optional)</label>
                            <Input {...form.register("email")} type="email" />
                            {form.formState.errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Phone</label>
                            <Input {...form.register("phone")} placeholder="1234567890" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Academic Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium">Admission Number</label>
                            <Input {...form.register("admissionNumber")} />
                            {form.formState.errors.admissionNumber && (
                                <p className="text-red-500 text-xs mt-1">
                                    {form.formState.errors.admissionNumber.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Roll Number</label>
                            <Input {...form.register("rollNumber")} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Class</label>
                            <select
                                {...form.register("class")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                onChange={(e) => {
                                    form.register("class").onChange(e);
                                    setSelectedClassId(e.target.value);
                                    form.setValue("section", ""); // Reset section
                                }}
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {form.formState.errors.class && (
                                <p className="text-red-500 text-xs mt-1">
                                    {form.formState.errors.class.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Section</label>
                            <select
                                {...form.register("section")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                disabled={!selectedClassId}
                            >
                                <option value="">Select Section</option>
                                {sections.map((s: any) => (
                                    <option key={s._id} value={s._id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">House</label>
                            <select
                                {...form.register("house")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select House</option>
                                {houses.map((h) => (
                                    <option key={h._id} value={h._id}>
                                        {h.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Category</label>
                            <select
                                {...form.register("category")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <select
                                {...form.register("status")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="Enquiry">Enquiry</option>
                                <option value="Admitted">Admitted</option>
                                <option value="Promoted">Promoted</option>
                                <option value="Passed">Passed</option>
                                <option value="TC">TC</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-sm font-medium">Street Address</label>
                            <Input {...form.register("address.street")} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">City</label>
                            <Input {...form.register("address.city")} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">State</label>
                            <Input {...form.register("address.state")} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Zip Code</label>
                            <Input {...form.register("address.zipCode")} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push("/school/students")}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Student" : "Create Student"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
