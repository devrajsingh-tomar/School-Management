"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { StaffProfileForm } from "@/components/forms/staff-profile-form";
import { CreateStaffForm } from "@/components/forms/create-staff-form";
import { Badge } from "@/components/ui/badge";
import { Edit, UserCog, UserPlus, X } from "lucide-react";
import { useState } from "react";

export function StaffList({ staffList, schoolId }: { staffList: any[]; schoolId: string }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    if (staffList.length === 0 && !isCreateOpen) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No staff members found.</p>
                <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Add First Staff Member
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        className="w-full sm:max-w-[480px] p-0 flex flex-col gap-0"
                        side="right"
                    >
                        <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <SheetTitle>Add Staff</SheetTitle>
                                    <SheetDescription>Create a new staff account and profile.</SheetDescription>
                                </div>
                                <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </SheetClose>
                            </div>
                        </SheetHeader>
                        <CreateStaffForm onSuccess={() => setIsCreateOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <SheetTrigger asChild>
                        <PrimaryActionButton>
                            <UserPlus className="h-4 w-4" /> Add Staff Member
                        </PrimaryActionButton>
                    </SheetTrigger>
                    <SheetContent
                        className="w-full sm:max-w-[480px] p-0 flex flex-col gap-0"
                        side="right"
                    >
                        <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <SheetTitle>Add Staff</SheetTitle>
                                    <SheetDescription>Create a new staff account and profile.</SheetDescription>
                                </div>
                                <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </SheetClose>
                            </div>
                        </SheetHeader>
                        <CreateStaffForm onSuccess={() => setIsCreateOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staffList.map((staff) => (
                            <TableRow key={staff._id}>
                                <TableCell className="font-medium">
                                    {staff.name}
                                    <div className="text-xs text-muted-foreground">{staff.email}</div>
                                </TableCell>
                                <TableCell>{staff.role}</TableCell>
                                <TableCell>{staff.profile?.designation || "-"}</TableCell>
                                <TableCell>{staff.profile?.department || "-"}</TableCell>
                                <TableCell>
                                    {staff.profile ? (
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Profile Active</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Pending Setup</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <UserCog className="mr-2 h-4 w-4" /> Manage
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent
                                            className="w-full sm:max-w-[480px] overflow-y-auto"
                                            side="right"
                                        >
                                            <SheetHeader>
                                                <SheetTitle>Manage Staff Profile</SheetTitle>
                                                <SheetDescription>
                                                    Edit details for {staff.name}
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="mt-6">
                                                <StaffProfileForm
                                                    schoolId={schoolId}
                                                    userId={staff._id}
                                                    initialData={staff.profile}
                                                />
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
