
import AttendanceFilter from "@/components/forms/attendance-filter";
import AttendanceTracker from "@/components/forms/attendance-tracker";
import { getClasses } from "@/lib/actions/academic.actions";
import { getSectionAttendance } from "@/lib/actions/attendance.actions";
import { getSchoolUsers } from "@/lib/actions/user.actions";

export default async function TeacherAttendancePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) {
    const classes = await getClasses();

    // Future Enhancement: Filter `classes` to only those taught by the logged-in teacher.

    const classId = searchParams.classId;
    const sectionId = searchParams.sectionId;
    const date = searchParams.date;

    const isReady = classId && sectionId && date;

    let students: any[] = [];
    let existingAttendance: any = null;

    if (isReady) {
        students = await getSchoolUsers("STUDENT", sectionId as string);
        existingAttendance = await getSectionAttendance(sectionId as string, date as string);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Take Attendance</h1>
            <p className="text-sm text-gray-500">Select a class and section to mark attendance.</p>

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
