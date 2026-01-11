"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users2, AirVent } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { getRooms } from "@/lib/actions/hostel.actions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function RoomGrid({ hostels }: { hostels: any[] }) {
    const [selectedHostel, setSelectedHostel] = useState<string>(hostels.length > 0 ? hostels[0]._id : "");
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedHostel) return;
        async function fetchRooms() {
            setLoading(true);
            const res = await getRooms(selectedHostel);
            if (res.success) {
                setRooms(res.data);
            }
            setLoading(false);
        }
        fetchRooms();
    }, [selectedHostel]);

    if (hostels.length === 0) {
        return <div className="text-center text-muted-foreground">No hostels available. Create one first.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Select Hostel:</span>
                <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Hostel" />
                    </SelectTrigger>
                    <SelectContent>
                        {hostels.map((h) => (
                            <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="text-sm text-muted-foreground p-4">Loading rooms...</div>
            ) : rooms.length === 0 ? (
                <div className="text-sm text-muted-foreground border rounded-lg p-8 text-center bg-gray-50">
                    No rooms found in this hostel.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {rooms.map((room) => {
                        const occupancyPercent = (room.occupied / room.capacity) * 100;
                        const isFull = room.occupied >= room.capacity;
                        return (
                            <Card key={room._id} className={`${isFull ? "bg-gray-50 opacity-80" : "bg-white"}`}>
                                <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                                    <Badge variant="outline">{room.roomNumber}</Badge>
                                    {room.type === "AC" && <AirVent size={14} className="text-blue-500" />}
                                </CardHeader>
                                <CardContent className="p-3 pt-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                        <span className="flex items-center gap-1"><Users2 size={12} /> {room.occupied}/{room.capacity}</span>
                                        <span>{isFull ? "Full" : "Available"}</span>
                                    </div>
                                    <Progress value={occupancyPercent} className={`h-2 ${isFull ? "bg-gray-200" : ""}`} />
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
