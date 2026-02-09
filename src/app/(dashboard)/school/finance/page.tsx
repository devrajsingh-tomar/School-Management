import { getFinanceStats } from "@/lib/actions/finance.actions";
import Link from "next/link";
import {
    CreditCard,
    TrendingUp,
    Calendar,
    Plus,
    DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function FinancePage() {
    const stats = await getFinanceStats();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader title="Finance Dashboard" description="Overview of fees collection and dues.">
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/school/finance/structure">Fee Structure</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/school/finance/collect">
                            <Plus className="mr-2 h-4 w-4" /> Collect Fees
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Collection</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹ {stats.today.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Received today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹ {stats.month.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Received this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Calculation requires full audit</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {stats.recent.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent transactions.</p>
                        ) : (
                            stats.recent.map((txn: any) => (
                                <div key={txn._id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-green-100 text-green-700">
                                            <DollarSign className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {txn.student?.firstName} {txn.student?.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(txn.date), "dd/MM/yyyy")} • {txn.method} • {txn.receiptNumber}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">+₹ {txn.amountPaid.toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
