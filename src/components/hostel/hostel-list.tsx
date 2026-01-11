"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";

export function HostelList({ hostels }: { hostels: any[] }) {
    if (hostels.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No hostels found.</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hostels.map((hostel) => (
                <Card key={hostel._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {hostel.name}
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{hostel.capacity} <span className="text-sm font-normal text-muted-foreground">Beds</span></div>
                        <div className="flex items-center mt-2 space-x-2">
                            <Badge variant={hostel.type === "Boys" ? "default" : (hostel.type === "Girls" ? "destructive" : "secondary")}>
                                {hostel.type}
                            </Badge>
                            {hostel.address && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 overflow-hidden truncate">
                                    <MapPin size={10} /> {hostel.address}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
