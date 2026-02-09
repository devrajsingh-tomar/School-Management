import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddItemForm } from "@/components/forms/add-item-form";
import { InventoryList } from "@/components/inventory/inventory-list";
import { StockAdjustmentForm } from "@/components/forms/stock-adjustment-form";
import { InventoryTransactionsTable } from "@/components/inventory/inventory-transactions-table";
import { getInventoryItems, getInventoryTransactions } from "@/lib/actions/inventory.actions";
import connectDB from "@/lib/db/connect";

export default async function InventoryPage() {
    const session = await auth();
    if (!session?.user || !session.user.schoolId) redirect("/login");

    await connectDB();

    const [itemsRes, txRes] = await Promise.all([
        getInventoryItems(session.user.schoolId),
        getInventoryTransactions(session.user.schoolId),
    ]);

    const items = itemsRes.success ? itemsRes.data : [];
    const transactions = txRes.success ? txRes.data : [];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Stock Overview</TabsTrigger>
                    <TabsTrigger value="adjust">Stock In / Out</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Current Stock</CardTitle>
                                <CardDescription>
                                    Overview of all inventory items and current quantities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <InventoryList items={items} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>New Item</CardTitle>
                                <CardDescription>
                                    Define a new item to track in inventory.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AddItemForm
                                    schoolId={session.user.schoolId}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="adjust" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Stock Adjustment</CardTitle>
                                <CardDescription>
                                    Record incoming stock (Purchase) or outgoing stock (Usage/Issue).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="max-w-xl">
                                <StockAdjustmentForm
                                    items={items}
                                    schoolId={session.user.schoolId}
                                    userId={session.user.id}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>
                                Log of all stock movements.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InventoryTransactionsTable transactions={transactions} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
