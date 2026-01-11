import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SchoolLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    const allowedRoles = ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "STAFF", "ACCOUNTANT"];
    // Expanded roles to allow staff access. 
    // RBAC should eventually be more granular (e.g. middleware or per-page).

    if (!session?.user) {
        redirect("/login");
    }

    return <>{children}</>;
}
