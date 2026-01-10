"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";

export default function StudentListFilters({
    classes,
}: {
    classes: any[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [text, setText] = useState(searchParams.get("search") || "");
    const [query] = useDebounce(text, 500);
    const [status, setStatus] = useState(searchParams.get("status") || "");
    const [classId, setClassId] = useState(searchParams.get("classId") || "");

    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (query) params.set("search", query);
        else params.delete("search");

        if (status) params.set("status", status);
        else params.delete("status");

        if (classId) params.set("classId", classId);
        else params.delete("classId");

        params.set("page", "1"); // Reset page on filter change

        router.push(`/school/students?${params.toString()}`);
    }, [query, status, classId, router, searchParams]);

    const handleExport = () => {
        window.location.href = "/api/students/export";
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                    <option value="">All Status</option>
                    <option value="Enquiry">Enquiry</option>
                    <option value="Admitted">Admitted</option>
                    <option value="Promoted">Promoted</option>
                    <option value="Passed">Passed</option>
                    <option value="TC">TC</option>
                </select>
            </div>

            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
        </div>
    );
}
