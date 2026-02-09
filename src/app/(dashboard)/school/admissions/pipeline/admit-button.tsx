"use client";

import { convertEnquiryToStudent } from "@/lib/actions/admissions.actions";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdmitButton({ enquiryId }: { enquiryId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAdmit = async () => {
        setLoading(true);
        try {
            const res = await convertEnquiryToStudent(enquiryId);
            if (res.success) {
                toast.success("Student Admitted Successfully!");
                router.refresh();
            } else {
                toast.error(res.message || "Failed to admit student");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
            onClick={handleAdmit}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
            Admit Student
        </Button>
    );
}
