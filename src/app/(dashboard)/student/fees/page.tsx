
import { auth } from "@/auth";
import { getStudentFees } from "@/lib/actions/finance.actions";
import { format } from "date-fns";

export default async function StudentFeesPage() {
    const session = await auth();
    if (!session?.user?.schoolId) return null;

    const data = await getStudentFees(session.user.id, session.user.schoolId);
    // Need classId to know which fees apply. 
    // Wait, User model has class/section. `session.user` might not have it unless I extended session callback.
    // I should check `auth.ts`. 

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Fee Status</h1>

            <div className="bg-white p-6 rounded shadow">
                <h3 className="tex-lg font-bold mb-4">Payment History & Dues</h3>
                {data.fees.length === 0 ? (
                    <p className="text-gray-500">No fee structures found for your class.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {data.fees.map((fee: any) => {
                            const payment = data.payments.find((p: any) => p.feeStructure === fee._id);
                            const isPaid = payment && payment.amountPaid >= fee.amount;
                            return (
                                <li key={fee._id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{fee.name}</p>
                                        <p className="text-sm text-gray-500">Due: {format(new Date(fee.dueDate), "dd/MM/yyyy")}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">${fee.amount}</p>
                                        {isPaid ? (
                                            <span className="text-green-600 text-sm font-bold">PAID</span>
                                        ) : payment ? (
                                            <span className="text-yellow-600 text-sm font-bold">PARTIAL ({payment.amountPaid})</span>
                                        ) : (
                                            <span className="text-red-600 text-sm font-bold">UNPAID</span>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
