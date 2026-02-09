import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { Sidebar } from "@/components/layout/sidebar";
import { getFeatureFlags } from "@/lib/actions/feature-flag.actions";
import { SidebarProvider } from "@/context/SidebarContext";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

export default async function SchoolLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    const allowedRoles = ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "STAFF", "ACCOUNTANT", "LIBRARIAN", "TRANSPORT_MANAGER"];

    if (!session?.user) {
        redirect("/school/login");
    }

    // Check if user has school access
    const userRole = session.user.role?.toUpperCase();
    if (!allowedRoles.includes(userRole || "")) {
        redirect("/");
    }

    // Fetch feature flags
    const featureFlags = await getFeatureFlags();

    return (
        <SidebarProvider>
            <DashboardLayoutClient userRole={session.user.role} featureFlags={featureFlags}>
                {children}
            </DashboardLayoutClient>

            <Toaster position="top-right" />
        </SidebarProvider>
    );
}
