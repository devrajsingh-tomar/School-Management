"use client";

import { createTransportRoute } from "@/lib/actions/transport.actions";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateRoutePage() {
    const [stops, setStops] = useState<{ name: string; arrivalTime: string }[]>([{ name: "", arrivalTime: "" }]);
    const router = useRouter();

    const addStop = () => setStops([...stops, { name: "", arrivalTime: "" }]);
    const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));
    const updateStop = (i: number, f: string, v: string) => {
        const n = [...stops];
        // @ts-ignore
        n[i][f] = v;
        setStops(n);
    };

    const handleSubmit = async (formData: FormData) => {
        formData.append("stops", JSON.stringify(stops));
        await createTransportRoute(formData);
        router.push("/school/transport");
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Add New Transport Route</h1>
            <div className="bg-white p-8 rounded-lg shadow">
                <form action={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Route Name</label>
                            <input name="name" required placeholder="e.g. Route A - North" className="w-full border rounded p-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                                <input name="vehicleNumber" required placeholder="XX-00-XX-0000" className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Monthly Cost (Fee)</label>
                                <input name="monthlyCost" type="number" required placeholder="1500" className="w-full border rounded p-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                                <input name="driverName" required className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Driver Phone</label>
                                <input name="driverPhone" required className="w-full border rounded p-2" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Stops</label>
                            <button type="button" onClick={addStop} className="text-sm text-indigo-600 flex items-center gap-1">
                                <Plus size={16} /> Add Stop
                            </button>
                        </div>
                        <div className="space-y-2">
                            {stops.map((stop, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        type="time"
                                        value={stop.arrivalTime} onChange={(e) => updateStop(i, "arrivalTime", e.target.value)}
                                        required className="border rounded p-2 w-32"
                                    />
                                    <input
                                        placeholder="Stop Name (e.g. Central Park)"
                                        value={stop.name} onChange={(e) => updateStop(i, "name", e.target.value)}
                                        required className="border rounded p-2 flex-1"
                                    />
                                    <button type="button" onClick={() => removeStop(i)} className="text-red-500 p-2"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 font-bold">
                        Create Route
                    </button>
                </form>
            </div>
        </div>
    );
}
