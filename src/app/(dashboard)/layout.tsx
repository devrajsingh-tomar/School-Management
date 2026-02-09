import { auth } from "@/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout does NOT render any sidebar
    // Each route group (school, superadmin, portal) handles its own layout
    return <>{children}</>;
}
