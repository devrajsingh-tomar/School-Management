import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IHostel extends Document {
    school: Types.ObjectId;
    name: string;
    type: "Boys" | "Girls" | "Co-ed";
    warden?: Types.ObjectId;
    address?: string;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}

const HostelSchema = new Schema<IHostel>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["Boys", "Girls", "Co-ed"],
            required: true,
        },
        warden: { type: Schema.Types.ObjectId, ref: "User" },
        address: { type: String },
        capacity: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Hostel: Model<IHostel> =
    mongoose.models.Hostel || mongoose.model<IHostel>("Hostel", HostelSchema);

export default Hostel;
