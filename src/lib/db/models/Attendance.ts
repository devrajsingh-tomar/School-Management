import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IAttendance extends Document {
    school: Types.ObjectId;
    date: Date;
    userType: "Student" | "Staff";
    student?: Types.ObjectId;
    staff?: Types.ObjectId; // User ID
    class?: Types.ObjectId; // For student reference optimization
    status: "Present" | "Absent" | "Late" | "Half-Day" | "Holiday";
    remarks?: string;
    markedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        date: { type: Date, required: true },
        userType: { type: String, enum: ["Student", "Staff"], required: true },
        student: { type: Schema.Types.ObjectId, ref: "Student" },
        staff: { type: Schema.Types.ObjectId, ref: "User" },
        class: { type: Schema.Types.ObjectId, ref: "Class" }, // Optional, helpful for filtering
        status: {
            type: String,
            enum: ["Present", "Absent", "Late", "Half-Day", "Holiday"],
            required: true
        },
        remarks: { type: String },
        markedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Compound index to ensure one record per person per day
AttendanceSchema.index({ school: 1, date: 1, student: 1 }, { unique: true, partialFilterExpression: { student: { $exists: true } } });
AttendanceSchema.index({ school: 1, date: 1, staff: 1 }, { unique: true, partialFilterExpression: { staff: { $exists: true } } });

const Attendance: Model<IAttendance> =
    mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
