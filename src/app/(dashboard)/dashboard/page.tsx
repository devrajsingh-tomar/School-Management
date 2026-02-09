
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const role = session.user.role?.toUpperCase();
    console.log("Dashboard redirector, role:", role);

    switch (role) {
        case "SUPER_ADMIN":
            redirect("/superadmin");
        case "SCHOOL_ADMIN":
        case "PRINCIPAL":
        case "TEACHER":
        case "STAFF":
        case "ACCOUNTANT":
            redirect("/school");
        case "STUDENT":
        case "PARENT":
            redirect("/portal");
        default:
            return (
                <div className="p-8">
                    <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
                    <p>Your role ({role}) does not have a specific dashboard yet.</p>
                </div>
            );
    }
}
