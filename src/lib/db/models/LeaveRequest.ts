import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ILeaveRequest extends Document {
    school: Types.ObjectId;
    staff: Types.ObjectId;
    type: "Sick" | "Casual" | "Earned";
    startDate: Date;
    endDate: Date;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    approvedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        staff: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["Sick", "Casual", "Earned"],
            required: true,
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

const LeaveRequest: Model<ILeaveRequest> =
    mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);

export default LeaveRequest;
