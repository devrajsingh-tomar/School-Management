import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ILeave extends Document {
    school: Types.ObjectId;
    applicantType: "Student" | "Staff";
    student?: Types.ObjectId;
    staff?: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: "Pending" | "Approved" | "Rejected" | "Cancelled";
    approvedBy?: Types.ObjectId;
    approvalDate?: Date;
    createdAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        applicantType: { type: String, enum: ["Student", "Staff"], required: true },
        student: { type: Schema.Types.ObjectId, ref: "Student" },
        staff: { type: Schema.Types.ObjectId, ref: "User" },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Cancelled"],
            default: "Pending"
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        approvalDate: { type: Date },
    },
    { timestamps: true }
);

const Leave: Model<ILeave> =
    mongoose.models.Leave || mongoose.model<ILeave>("Leave", LeaveSchema);

export default Leave;
