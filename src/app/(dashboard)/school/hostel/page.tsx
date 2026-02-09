import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateHostelForm } from "@/components/forms/create-hostel-form";
import { HostelList } from "@/components/hostel/hostel-list";
import { CreateRoomForm } from "@/components/forms/create-room-form";
import { RoomGrid } from "@/components/hostel/room-grid";
import { AllocationForm } from "@/components/forms/allocation-form";
import { getHostels, getAllocations } from "@/lib/actions/hostel.actions";
import { getStudents } from "@/lib/actions/student.actions";
import connectDB from "@/lib/db/connect";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { HostelAllocationList } from "@/components/hostel/hostel-allocation-list";

export default async function HostelPage() {
    const session = await auth();
    if (!session?.user || !session.user.schoolId) redirect("/login");

    await connectDB();

    const [hostelsRes, allocationsRes, studentsRes] = await Promise.all([
        getHostels(session.user.schoolId),
        getAllocations(session.user.schoolId),
        getStudents({ limit: 100 }), // Fetching first 100 students for dropdown
    ]);

    const hostels = hostelsRes.success ? hostelsRes.data : [];
    const allocations = allocationsRes.success ? allocationsRes.data : [];
    const students = studentsRes.students || [];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Hostel Management</h2>
            </div>

            <Tabs defaultValue="hostels" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="hostels">Buildings</TabsTrigger>
                    <TabsTrigger value="rooms">Rooms</TabsTrigger>
                    <TabsTrigger value="allocation">Allocations</TabsTrigger>
                </TabsList>

                <TabsContent value="hostels" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Hostel Buildings</CardTitle>
                                <CardDescription>
                                    List of all hostel buildings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HostelList hostels={hostels} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Add New Hostel</CardTitle>
                                <CardDescription>
                                    Register a new hostel building.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateHostelForm
                                    schoolId={session.user.schoolId}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="rooms" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 lg:col-span-5">
                            <CardHeader>
                                <CardTitle>Room Management</CardTitle>
                                <CardDescription>
                                    View and manage rooms in hostels.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RoomGrid hostels={hostels} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Add Room</CardTitle>
                                <CardDescription>
                                    Add a new room to a hostel.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateRoomForm
                                    hostels={hostels}
                                    schoolId={session.user.schoolId}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="allocation" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 lg:col-span-5">
                            <CardHeader>
                                <CardTitle>Active Allocations</CardTitle>
                                <CardDescription>
                                    List of students currently staying in hostels.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HostelAllocationList allocations={allocations} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Allocate Room</CardTitle>
                                <CardDescription>
                                    Assign a student to a room.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AllocationForm
                                    schoolId={session.user.schoolId}
                                    hostels={hostels}
                                    students={students}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
