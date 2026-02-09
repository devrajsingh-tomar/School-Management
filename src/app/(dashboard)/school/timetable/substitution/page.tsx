import { auth } from "@/auth";
import { getStaffList } from "@/lib/actions/hr.actions";
import { getSubstitutions } from "@/lib/actions/timetable.actions";
import { SubstitutionManager } from "./substitution-manager";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default async function SubstitutionPage({
    searchParams
}: {
    searchParams: Promise<{ date?: string }>
}) {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return null;

    const params = await searchParams;
    const dateStr = params.date || new Date().toISOString().split("T")[0];
    const { data: staff } = await getStaffList(schoolId);
    const teachers = staff.filter((s: any) => s.role === "Teacher" || s.role === "TEACHER");

    const initialSubs = await getSubstitutions(dateStr);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Substitution Management"
                description="Assign teachers for absent staff slots"
                showBackButton
                autoBreadcrumb
            >
                <div className="bg-white p-2 rounded-lg border flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" />
                    <input
                        type="date"
                        defaultValue={dateStr}
                        className="bg-transparent border-none outline-none text-sm font-medium"
                        onChange={(e) => {
                            window.location.href = `/school/timetable/substitution?date=${e.target.value}`;
                        }}
                    />
                </div>
            </PageHeader>

            <SubstitutionManager
                teachers={teachers}
                date={dateStr}
                initialSubs={initialSubs}
            />
        </div>
    );
}
