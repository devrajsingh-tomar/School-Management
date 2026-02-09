import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSchoolDetails } from "@/lib/actions/school.actions";
import { SchoolSettingsClient } from "./school-settings-client";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/school/login");
    }

    // Only school users can access settings
    if (!session.user.schoolId) {
        redirect("/");
    }

    const schoolData = await getSchoolDetails();

    return <SchoolSettingsClient initialData={schoolData} />;
}
