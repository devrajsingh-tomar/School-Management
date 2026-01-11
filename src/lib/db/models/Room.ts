import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IRoom extends Document {
    school: Types.ObjectId;
    hostel: Types.ObjectId;
    roomNumber: string;
    capacity: number;
    occupied: number;
    type: "AC" | "Non-AC";
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        hostel: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
        roomNumber: { type: String, required: true },
        capacity: { type: Number, required: true, min: 1 },
        occupied: { type: Number, default: 0, min: 0 },
        type: { type: String, enum: ["AC", "Non-AC"], default: "Non-AC" },
    },
    { timestamps: true }
);

// Ensure room number is unique per hostel
RoomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });

const Room: Model<IRoom> =
    mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export default Room;
