
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const role = session.user.role;

    switch (role) {
        case "SUPER_ADMIN":
            redirect("/admin/schools");
        case "SCHOOL_ADMIN":
        case "PRINCIPAL":
            redirect("/school");
        case "TEACHER":
            redirect("/teacher");
        case "STUDENT":
            redirect("/student");
        case "PARENT":
            redirect("/parent"); // Future
        default:
            // Fallback for unhandled roles
            return (
                <div className="p-8">
                    <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
                    <p>Your role ({role}) does not have a specific dashboard yet.</p>
                </div>
            );
    }
}
