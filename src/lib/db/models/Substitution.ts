import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ISubstitution extends Document {
    school: Types.ObjectId;
    originalSlot: Types.ObjectId;
    date: Date;
    originalTeacher: Types.ObjectId;
    substituteTeacher: Types.ObjectId;
    status: "Pending" | "Confirmed" | "Cancelled";
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SubstitutionSchema = new Schema<ISubstitution>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        originalSlot: { type: Schema.Types.ObjectId, ref: "TimetableSlot", required: true },
        date: { type: Schema.Types.Date, required: true },
        originalTeacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
        substituteTeacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Cancelled"],
            default: "Confirmed"
        },
        remarks: { type: String },
    },
    { timestamps: true }
);

// Unique substitution per slot per date
SubstitutionSchema.index({ originalSlot: 1, date: 1 }, { unique: true });

const Substitution: Model<ISubstitution> =
    mongoose.models.Substitution || mongoose.model<ISubstitution>("Substitution", SubstitutionSchema);

export default Substitution;
