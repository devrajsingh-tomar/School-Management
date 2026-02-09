"use client";

import { useState, useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { studentSchema } from "@/lib/validators/student";
import { createStudent, updateStudent } from "@/lib/actions/student.actions";
import { seedMasterData } from "@/lib/actions/master.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ActionState } from "@/lib/types/actions";
import { Checkbox } from "@/components/ui/checkbox";

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
    initialData?: any;
}

export default function StudentForm({ initialData }: StudentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingClasses, setFetchingClasses] = useState(true);
    const [fetchingSections, setFetchingSections] = useState(false);
    const [fetchingCategories, setFetchingCategories] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [selectedClassId, setSelectedClassId] = useState<string>(
        initialData?.class?._id || initialData?.class || ""
    );

    const form = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema) as Resolver<StudentFormData>,
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
                status: "Admitted",
                address: {},
                admissionNumber: `ADM${new Date().getFullYear()}XXXX` // Preview of auto-generated format
            },
    });

    // 1. Initial Data Fetch
    useEffect(() => {
        const fetchBaseData = async () => {
            try {
                const [classesRes, categoriesRes] = await Promise.all([
                    fetch("/api/school/classes"),
                    fetch("/api/school/categories")
                ]);

                if (classesRes.ok) {
                    const classesData = await classesRes.json();
                    setClasses(classesData);
                }
                if (categoriesRes.ok) {
                    const categoriesData = await categoriesRes.json();
                    setCategories(categoriesData);
                }
            } catch (error) {
                toast.error("Failed to fetch master data");
            } finally {
                setFetchingClasses(false);
                setFetchingCategories(false);
            }
        };

        fetchBaseData();
    }, []);

    // 2. Fetch Sections when Class changes
    useEffect(() => {
        if (!selectedClassId) {
            setSections([]);
            return;
        }

        const fetchSections = async () => {
            setFetchingSections(true);
            try {
                const res = await fetch(`/api/school/sections?classId=${selectedClassId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSections(data);
                }
            } catch (error) {
                toast.error("Failed to fetch sections");
            } finally {
                setFetchingSections(false);
            }
        };

        fetchSections();
    }, [selectedClassId]);

    const handleSeedData = async () => {
        setSeeding(true);
        try {
            const res = await seedMasterData();
            if (res.success) {
                toast.success(res.message);
                // Refetch
                window.location.reload();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Seeding failed");
        } finally {
            setSeeding(false);
        }
    };

    const onSubmit = async (data: StudentFormData) => {
        setLoading(true);
        try {
            let result: ActionState<any>;
            if (initialData) {
                result = await updateStudent(initialData._id, data);
            } else {
                result = await createStudent(data);
            }

            if (result.success) {
                toast.success(result.message || "Student saved successfully");
                router.push("/school/students");
                router.refresh();
            } else {
                toast.error(result.message || "Something went wrong");
                if (result.errors) {
                    Object.keys(result.errors).forEach((key) => {
                        // @ts-ignore
                        form.setError(key, { message: result.errors[key][0] });
                    });
                }
            }
        } catch (err: any) {
            toast.error(err.message || "Unexpected Error");
        } finally {
            setLoading(false);
        }
    };

    if (!fetchingClasses && classes.length === 0) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing Master Data</AlertTitle>
                    <AlertDescription>
                        Please create classes first in Settings → Academics, or use the button below to initialize default data.
                    </AlertDescription>
                </Alert>
                <div className="flex justify-center p-8 border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4">
                        <p className="text-muted-foreground">No classes or categories found in your school.</p>
                        <Button onClick={handleSeedData} disabled={seeding}>
                            {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Initialize Master Data
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

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
                            <label className="text-sm font-medium leading-none">First Name</label>
                            <Input {...form.register("firstName")} placeholder="John" />
                            {form.formState.errors.firstName && <p className="text-red-500 text-xs">{form.formState.errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Last Name</label>
                            <Input {...form.register("lastName")} placeholder="Doe" />
                            {form.formState.errors.lastName && <p className="text-red-500 text-xs">{form.formState.errors.lastName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Email</label>
                            <Input {...form.register("email")} type="email" placeholder="student@example.com" />
                            {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Phone</label>
                            <Input {...form.register("phone")} placeholder="+91 99999 99999" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Date of Birth</label>
                            <Input
                                type="date"
                                {...form.register("dob", { valueAsDate: true })}
                                defaultValue={initialData?.dob ? format(new Date(initialData.dob), "yyyy-MM-dd") : ""}
                            />
                            {form.formState.errors.dob && <p className="text-red-500 text-xs">{form.formState.errors.dob.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Gender</label>
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
                            <label className="text-sm font-medium leading-none">Admission Number</label>
                            <Input {...form.register("admissionNumber")} placeholder={`ADM${new Date().getFullYear()}XXXX`} />
                            <p className="text-xs text-muted-foreground">Leave blank to auto-generate</p>
                            {form.formState.errors.admissionNumber && <p className="text-red-500 text-xs">{form.formState.errors.admissionNumber.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Roll Number</label>
                            <Input {...form.register("rollNumber")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Status</label>
                            <Select onValueChange={(val) => form.setValue("status", val as any)} defaultValue={form.getValues("status")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admitted">Admitted</SelectItem>
                                    <SelectItem value="Enquiry">Enquiry</SelectItem>
                                    <SelectItem value="Suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Class</label>
                            <Select
                                onValueChange={(val) => {
                                    form.setValue("class", val);
                                    setSelectedClassId(val);
                                    form.setValue("section", "");
                                }}
                                defaultValue={selectedClassId}
                            >
                                <SelectTrigger>
                                    {fetchingClasses ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Select Class" />}
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.class && <p className="text-red-500 text-xs">{form.formState.errors.class.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Section</label>
                            <Select
                                disabled={!selectedClassId || fetchingSections}
                                onValueChange={(val) => form.setValue("section", val)}
                                defaultValue={form.getValues("section")}
                            >
                                <SelectTrigger>
                                    {fetchingSections ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Select Section" />}
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.section && <p className="text-red-500 text-xs">{form.formState.errors.section.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Category</label>
                            <Select onValueChange={(val) => form.setValue("category", val)} defaultValue={form.getValues("category")}>
                                <SelectTrigger>
                                    {fetchingCategories ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Select Category" />}
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.category && <p className="text-red-500 text-xs">{form.formState.errors.category.message}</p>}
                        </div>
                    </div>

                    <div className="pt-6 border-t">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="createPortalAccess"
                                checked={form.watch("createPortalAccess")}
                                onCheckedChange={(val) => form.setValue("createPortalAccess", !!val)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="createPortalAccess" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Create Portal Access
                                </label>
                                <p className="text-xs text-muted-foreground">
                                    Automatically create login accounts for Student and Parent.
                                </p>
                            </div>
                        </div>

                        {form.watch("createPortalAccess") && (
                            <div className="mt-4 max-w-sm space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Portal Password (Default)</label>
                                    <Input
                                        {...form.register("loginPassword")}
                                        type="text"
                                        placeholder="Min 6 characters"
                                        className="h-10"
                                    />
                                    <p className="text-[10px] text-zinc-500">
                                        Both student and parent accounts will initially use this password.
                                    </p>
                                    {form.formState.errors.loginPassword && <p className="text-red-500 text-xs">{form.formState.errors.loginPassword.message}</p>}
                                </div>
                            </div>
                        )}
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
                        Save Student
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
