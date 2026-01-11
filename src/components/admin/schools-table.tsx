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
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldAlert, ShieldCheck, Settings } from "lucide-react";
import { updateSchoolStatus } from "@/lib/actions/saas.actions";
import { toast } from "sonner";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export function SchoolsTable({ schools, plans }: { schools: any[], plans: any[] }) {

    async function handleStatusChange(schoolId: string, newStatus: "Active" | "Suspended") {
        const res = await updateSchoolStatus(schoolId, newStatus);
        if (res.success) {
            toast.success(`School ${newStatus}`);
        } else {
            toast.error("Failed to update status");
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>School Name</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>User Usage</TableHead>
                        <TableHead>Storage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schools.map((school) => {
                        const userLimit = school.limits?.users || 50;
                        const userCount = school.userCount || 0;
                        const usagePercent = (userCount / userLimit) * 100;

                        return (
                            <TableRow key={school._id}>
                                <TableCell className="font-medium">
                                    {school.name}
                                    <div className="text-xs text-muted-foreground">{school.slug}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{school.plan || "Free"}</Badge>
                                </TableCell>
                                <TableCell className="w-[200px]">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>{userCount} / {userLimit}</span>
                                        <span>{usagePercent.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={usagePercent} className={usagePercent > 90 ? "bg-red-100" : ""} />
                                </TableCell>
                                <TableCell>
                                    {school.limits?.storage || 1} GB
                                </TableCell>
                                <TableCell>
                                    <Badge variant={school.status === "Active" ? "default" : "destructive"}>
                                        {school.status || "Active"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleStatusChange(school._id, "Active")}>
                                                <ShieldCheck className="mr-2 h-4 w-4" /> Activate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(school._id, "Suspended")} className="text-red-600">
                                                <ShieldAlert className="mr-2 h-4 w-4" /> Suspend
                                            </DropdownMenuItem>
                                            {/* Feature: Add Plan Change Dialog here later */}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
