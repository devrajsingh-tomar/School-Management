import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PortalPage() {
    const session = await auth();

    if (session?.user?.role === "STUDENT") {
        redirect("/portal/student");
    } else if (session?.user?.role === "PARENT") {
        redirect("/portal/parent");
    } else {
        redirect("/portal/login");
    }

    return null;
}
