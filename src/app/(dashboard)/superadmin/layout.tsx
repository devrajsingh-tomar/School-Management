import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { SidebarProvider } from "@/context/SidebarContext";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Protect SuperAdmin routes
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
        redirect("/school/login");
    }

    return (
        <SidebarProvider>
            <DashboardLayoutClient userRole="SUPER_ADMIN">
                {children}
            </DashboardLayoutClient>
        </SidebarProvider>
    );
}
