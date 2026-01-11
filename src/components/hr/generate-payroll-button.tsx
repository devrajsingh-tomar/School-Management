"use client";

import { Button } from "@/components/ui/button";
import { generatePayroll } from "@/lib/actions/hr.actions";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";

export function GeneratePayrollButton({ schoolId }: { schoolId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleGenerate() {
        setLoading(true);
        try {
            const res = await generatePayroll(schoolId, new Date()); // Generate for current month
            if (res.success) {
                toast.success(`Generated ${res.count} payslips`);
            } else {
                toast.error(res.error || "Failed to generate");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Generate {new Date().toLocaleString('default', { month: 'long' })} Payroll
        </Button>
    );
}
