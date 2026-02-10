import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffList } from "@/components/hr/staff-list";
import { CreateLeaveForm } from "@/components/forms/create-leave-form";
import { LeaveRequestList } from "@/components/hr/leave-request-list";
import { PayrollTable } from "@/components/hr/payroll-table";
import { GeneratePayrollButton } from "@/components/hr/generate-payroll-button";
import { getStaffList, getLeaveRequests, getPayrolls } from "@/lib/actions/hr.actions";
import connectDB from "@/lib/db/connect";

export const dynamic = "force-dynamic";

export default async function HRPage() {
    const session = await auth();
    if (!session?.user || !session.user.schoolId) redirect("/login");

    await connectDB();

    const [staffRes, leavesRes, payrollsRes] = await Promise.all([
        getStaffList(session.user.schoolId),
        getLeaveRequests(session.user.schoolId),
        getPayrolls(session.user.schoolId),
    ]);

    const staffList = staffRes.success ? staffRes.data : [];
    const leaves = leavesRes.success ? leavesRes.data : [];
    const payrolls = payrollsRes.success ? payrollsRes.data : [];

    // Filter leaves for current user if they are staff and not admin? 
    // Ideally we have Role Based Access Control.
    // Assuming this page is for Admin/HR Manager who sees everything.
    // Regular staff might see a restricted view on their own dashboard or user profile page.

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">HR & Payroll</h2>
            </div>

            <Tabs defaultValue="staff" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="staff">Staff Directory</TabsTrigger>
                    <TabsTrigger value="leave">Leave Management</TabsTrigger>
                    <TabsTrigger value="payroll">Payroll</TabsTrigger>
                </TabsList>

                <TabsContent value="staff" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Members</CardTitle>
                            <CardDescription>
                                Manage staff profiles, salary structures, and bank details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StaffList staffList={staffList} schoolId={session.user.schoolId} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leave" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 lg:col-span-5">
                            <CardHeader>
                                <CardTitle>Leave Requests</CardTitle>
                                <CardDescription>
                                    Review and manage staff leave applications.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LeaveRequestList requests={leaves} currentUserId={session.user.id} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Apply for Leave</CardTitle>
                                <CardDescription>
                                    Submit a new leave request.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateLeaveForm
                                    schoolId={session.user.schoolId}
                                    userId={session.user.id}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="payroll" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>Payroll Management</CardTitle>
                                <CardDescription>
                                    Generate and manage monthly salary slips.
                                </CardDescription>
                            </div>
                            <GeneratePayrollButton schoolId={session.user.schoolId} />
                        </CardHeader>
                        <CardContent className="pt-6">
                            <PayrollTable payrolls={payrolls} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
