import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ITransportRoute extends Document {
    school: Types.ObjectId;
    name: string; // "Route 1 - City Center"
    vehicleNumber: string; // "KA-01-AB-1234"
    driverName: string;
    driverPhone: string;
    monthlyCost: number; // Fee amount
    stops: {
        name: string;
        arrivalTime: string;
    }[];
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}

const TransportRouteSchema = new Schema<ITransportRoute>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        name: { type: String, required: true },
        vehicleNumber: { type: String, required: true },
        driverName: { type: String, required: true },
        driverPhone: { type: String, required: true },
        monthlyCost: { type: Number, required: true },
        stops: [{
            name: { type: String, required: true },
            arrivalTime: { type: String, required: true }
        }],
        capacity: { type: Number, default: 40 },
    },
    { timestamps: true }
);

const TransportRoute: Model<ITransportRoute> =
    mongoose.models.TransportRoute || mongoose.model<ITransportRoute>("TransportRoute", TransportRouteSchema);

export default TransportRoute;
