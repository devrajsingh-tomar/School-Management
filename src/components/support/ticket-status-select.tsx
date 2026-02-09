"use client";

import { useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTicketStatus } from "@/lib/actions/support.actions";
import toast from "react-hot-toast";

export function TicketStatusSelect({
    ticketId,
    currentStatus
}: {
    ticketId: string;
    currentStatus: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(currentStatus);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        startTransition(async () => {
            try {
                await updateTicketStatus(ticketId, value);
                toast.success(`Status updated to ${value.replace("_", " ")}`);
            } catch (error) {
                toast.error("Failed to update status");
                setStatus(currentStatus); // Revert on error
            }
        });
    };

    return (
        <Select
            value={status}
            onValueChange={handleStatusChange}
            disabled={isPending}
        >
            <SelectTrigger className={
                status === "open" ? "border-green-300 bg-green-50 text-green-900 font-medium" :
                    status === "in_progress" ? "border-yellow-300 bg-yellow-50 text-yellow-900 font-medium" :
                        "border-gray-300 bg-gray-50 text-gray-900 font-medium"
            }>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="open">🟢 Open</SelectItem>
                <SelectItem value="in_progress">🟡 In Progress</SelectItem>
                <SelectItem value="closed">⚪ Closed</SelectItem>
            </SelectContent>
        </Select>
    );
}
