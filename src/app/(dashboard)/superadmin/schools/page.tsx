import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllSchools, getPlans } from "@/lib/actions/saas.actions";
import connectDB from "@/lib/db/connect";
import { SchoolsTable } from "@/components/admin/schools-table";

export default async function SchoolsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    await connectDB();

    const [schoolsRes, plansRes] = await Promise.all([
        getAllSchools(),
        getPlans(),
    ]);

    const schools = schoolsRes.success ? schoolsRes.data : [];
    const plans = plansRes.success ? plansRes.data : [];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Schools Management</h2>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                <SchoolsTable schools={schools} plans={plans} />
            </div>
        </div>
    );
}
