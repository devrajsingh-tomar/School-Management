
import { auth } from "@/auth";
import AttendanceFilter from "@/components/forms/attendance-filter"; // Reuse filter? Maybe overkill for single student. Just show list.
import { getSectionAttendance } from "@/lib/actions/attendance.actions"; // This fetches whole section.
// We need a new action: getStudentAttendance(studentId)

// Let's create `getStudentAttendance` in `attendance.actions.ts` first?
// Or just filter client side? Better server side. 

/* 
   Wait, I need to add `getStudentAttendance` to `attendance.actions.ts`.
   Existing `getSectionAttendance` returns { date, records: [{studentId, status}] }.
   Searching through all days for one student is inefficient if I query by section.
   Better query: DailyAttendance.find({ "records.student": studentId }).
*/

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, isSameDay } from "date-fns";
import { getStudentAttendance } from "@/lib/actions/attendance.actions";

export default async function StudentAttendancePage() {
    const session = await auth();
    if (!session?.user) return null;

    if (!session?.user?.schoolId) return null;

    const { records: attendance } = await getStudentAttendance(session.user.linkedStudentId || session.user.id, session.user.schoolId);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Attendance History</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attendance.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No records found.</td>
                            </tr>
                        ) : (
                            attendance.map((record: any) => (
                                <tr key={record._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {format(new Date(record.date), "dd/MM/yyyy")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === "PRESENT" ? "bg-green-100 text-green-800" :
                                            record.status === "ABSENT" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.remarks || "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
