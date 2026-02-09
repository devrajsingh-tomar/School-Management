
import AttendanceFilter from "@/components/forms/attendance-filter";
import AttendanceTracker from "@/components/forms/attendance-tracker";
import { getClasses } from "@/lib/actions/academic.actions";
import { getSectionAttendance } from "@/lib/actions/attendance.actions";
import { getSchoolUsers } from "@/lib/actions/user.actions";
import { PageHeader } from "@/components/ui/page-header";

export default async function TeacherAttendancePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const classes = await getClasses();

    // Future Enhancement: Filter `classes` to only those taught by the logged-in teacher.

    const params = await searchParams;
    const classId = params.classId;
    const sectionId = params.sectionId;
    const date = params.date;

    const isReady = classId && sectionId && date;

    let students: any[] = [];
    let existingAttendance: any = null;

    if (isReady) {
        students = await getSchoolUsers("STUDENT", sectionId as string);
        existingAttendance = await getSectionAttendance(sectionId as string, date as string);
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Take Attendance"
                description="Select a class and section to mark attendance"
                autoBreadcrumb
            />

            <AttendanceFilter classes={classes} />

            {isReady ? (
                students.length > 0 ? (
                    <AttendanceTracker
                        classId={classId as string}
                        sectionId={sectionId as string}
                        date={date as string}
                        users={students}
                        existingAttendance={existingAttendance}
                    />
                ) : (
                    <div className="bg-yellow-50 p-4 rounded text-yellow-800">
                        No students found in this section.
                    </div>
                )
            ) : null}
        </div>
    );
}
