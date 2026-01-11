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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { StaffProfileForm } from "@/components/forms/staff-profile-form";
import { Badge } from "@/components/ui/badge";
import { Edit, UserCog } from "lucide-react";
import { useState } from "react";

export function StaffList({ staffList, schoolId }: { staffList: any[]; schoolId: string }) {
    if (staffList.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No staff members found.</div>;
    }

    return (
        <div className="rounded-md border">
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
                                    <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
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
    );
}
