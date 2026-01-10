import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ITimetableSlot extends Document {
    school: Types.ObjectId;
    class: Types.ObjectId;
    section?: Types.ObjectId;
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    periodIndex: number; // 1-8
    startTime: string; // "09:00"
    endTime: string; // "09:45"
    subject: string;
    teacher: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TimetableSlotSchema = new Schema<ITimetableSlot>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        section: { type: Schema.Types.ObjectId, ref: "Section" },
        day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            required: true
        },
        periodIndex: { type: Number, required: true },
        startTime: { type: String, default: "" },
        endTime: { type: String, default: "" },
        subject: { type: String, required: true },
        teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

// Unique slot per class per time
TimetableSlotSchema.index({ school: 1, class: 1, day: 1, periodIndex: 1 }, { unique: true });

// Index for Clash Detection: Teacher overlapping
// Note: We don't force unique here at DB level to allow override if needed logic-side, 
// but we will Query this index to block conflicts.
TimetableSlotSchema.index({ school: 1, teacher: 1, day: 1, periodIndex: 1 });

const TimetableSlot: Model<ITimetableSlot> =
    mongoose.models.TimetableSlot || mongoose.model<ITimetableSlot>("TimetableSlot", TimetableSlotSchema);

export default TimetableSlot;
