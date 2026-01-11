import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IHostelAllocation extends Document {
    school: Types.ObjectId;
    student: Types.ObjectId;
    hostel: Types.ObjectId;
    room: Types.ObjectId;
    allocatedDate: Date;
    vacatedDate?: Date;
    status: "Active" | "Vacated";
    createdAt: Date;
    updatedAt: Date;
}

const HostelAllocationSchema = new Schema<IHostelAllocation>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        student: { type: Schema.Types.ObjectId, ref: "Student", required: true }, // Linking to Student schema, not User directly, or keep as Student? Usually Student.
        hostel: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
        room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
        allocatedDate: { type: Date, default: Date.now },
        vacatedDate: { type: Date },
        status: {
            type: String,
            enum: ["Active", "Vacated"],
            default: "Active",
        },
    },
    { timestamps: true }
);

const HostelAllocation: Model<IHostelAllocation> =
    mongoose.models.HostelAllocation ||
    mongoose.model<IHostelAllocation>("HostelAllocation", HostelAllocationSchema);

export default HostelAllocation;
