import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IAttendanceRecord {
    student: Types.ObjectId;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    remarks?: string;
}

export interface IDailyAttendance extends Document {
    school: Types.ObjectId;
    class: Types.ObjectId;
    section: Types.ObjectId;
    date: Date; // Normalized to set time to midnight
    takenBy: Types.ObjectId; // Teacher who took attendance
    records: IAttendanceRecord[];
    createdAt: Date;
    updatedAt: Date;
}

const DailyAttendanceSchema = new Schema<IDailyAttendance>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        section: { type: Schema.Types.ObjectId, ref: "Section", required: true },
        date: { type: Date, required: true },
        takenBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        records: [
            {
                student: { type: Schema.Types.ObjectId, ref: "User", required: true },
                status: {
                    type: String,
                    enum: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
                    default: "PRESENT",
                },
                remarks: String,
            },
        ],
    },
    { timestamps: true }
);

// Ensure only one attendance record per section per day
DailyAttendanceSchema.index({ school: 1, section: 1, date: 1 }, { unique: true });

// Index for finding a student's attendance history
DailyAttendanceSchema.index({ "records.student": 1, date: -1 });

const DailyAttendance: Model<IDailyAttendance> =
    mongoose.models.DailyAttendance ||
    mongoose.model<IDailyAttendance>("DailyAttendance", DailyAttendanceSchema);

export default DailyAttendance;
