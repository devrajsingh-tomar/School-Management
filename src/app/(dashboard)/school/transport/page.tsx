import { getRoutes } from "@/lib/actions/transport.actions";
import Link from "next/link";
import { Bus, Plus, Users, MapPin } from "lucide-react";

export default async function TransportPage() {
    const routes = await getRoutes();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Transport Management</h1>
                <div className="flex gap-2">
                    <Link href="/school/transport/allocation">
                        <button className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2">
                            <Users size={18} /> Allocate Students
                        </button>
                    </Link>
                    <Link href="/school/transport/routes/create">
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                            <Plus size={18} /> New Route
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.length === 0 ? (
                    <div className="md:col-span-3 p-12 bg-white rounded-lg shadow text-center text-gray-500">
                        No routes defined.
                    </div>
                ) : (
                    routes.map((route: any) => (
                        <div key={route._id} className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-400">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{route.name}</h3>
                                    <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded w-fit mt-1">{route.vehicleNumber}</div>
                                </div>
                                <Bus className="text-yellow-500" size={24} />
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex justify-between">
                                    <span>Driver:</span>
                                    <span className="font-semibold">{route.driverName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Contact:</span>
                                    <span>{route.driverPhone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cost/Month:</span>
                                    <span className="font-bold text-green-600">Rs. {route.monthlyCost}</span>
                                </div>
                            </div>

                            <Link href={`/school/transport/${route._id}/students`}>
                                <button className="w-full text-indigo-600 border border-indigo-100 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 mb-4">
                                    View Assigned Students
                                </button>
                            </Link>

                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                    <MapPin size={12} /> Stops
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {route.stops.map((stop: any, i: number) => (
                                        <span key={i} className="text-xs bg-gray-50 border px-2 py-1 rounded">
                                            {stop.arrivalTime} - {stop.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
