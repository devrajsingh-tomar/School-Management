import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, FileText, Download } from "lucide-react";
import { getStudentFees } from "@/lib/actions/finance.actions";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default async function FeesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/school/login");
    }

    const studentId = session.user.linkedStudentId;
    const schoolId = session.user.schoolId;

    if (!studentId || !schoolId) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Unable to load fees. Missing student or school information.
            </div>
        );
    }

    const { breakdown, summary, history } = await getStudentFees(studentId, schoolId);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Fees & Payments</h2>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Outstanding Card */}
                <Card className={summary.balanceDue > 0 ? "border-l-4 border-l-red-500" : "border-l-4 border-l-green-500"}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-emerald-700" />
                            Outstanding Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${summary.balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                            ₹{summary.balanceDue.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {summary.balanceDue > 0 ? "Due immediately" : "No dues pending"}
                        </p>

                        <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Total Fees:</span>
                                <span>₹{summary.totalFees.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Discounts:</span>
                                <span>-₹{summary.totalDiscount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span>Net Payable:</span>
                                <span>₹{summary.netPayable.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-blue-600">
                                <span>Total Paid:</span>
                                <span>-₹{summary.totalPaid.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                    {summary.balanceDue > 0 && (
                        <CardFooter>
                            <Button className="w-full">
                                Pay Now (Coming Soon)
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Payment History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Payment History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <div className="min-h-[150px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed border-2 rounded-lg">
                                No recent transactions.
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {history.map((payment: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-sm">{payment.receiptNumber}</p>
                                            <p className="text-xs text-gray-500">{format(new Date(payment.date), 'PPP')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-700">₹{payment.amountPaid}</p>
                                            <Badge variant="outline" className="text-[10px] h-5">{payment.method}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Fee Structure Table could go here */}
            <Card>
                <CardHeader>
                    <CardTitle>Fee Structure Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b text-gray-500">
                                <tr>
                                    <th className="p-3 font-medium">Fee Type</th>
                                    <th className="p-3 font-medium">Frequency</th>
                                    <th className="p-3 font-medium text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {breakdown.map((item: any, i: number) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50">
                                        <td className="p-3">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.type}</div>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant="secondary" className="font-normal">{item.frequency}</Badge>
                                        </td>
                                        <td className="p-3 text-right font-medium">
                                            ₹{item.amount.toLocaleString()}
                                            {item.discountApplied > 0 && (
                                                <div className="text-xs text-green-600">
                                                    -₹{item.discountApplied} off
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
