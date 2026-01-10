import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IFeeStructure extends Document {
    school: Types.ObjectId;
    class: Types.ObjectId;
    name: string; // "Tuition Fee", "Transport Fee"
    type: "Tuition" | "Transport" | "Exam" | "Admission" | "Misc";
    amount: number;
    frequency: "One-Time" | "Monthly" | "Quarterly" | "Yearly";
    months?: string[]; // ["April", "May"] if Monthly
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const FeeStructureSchema = new Schema<IFeeStructure>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["Tuition", "Transport", "Exam", "Admission", "Misc"],
            default: "Misc"
        },
        amount: { type: Number, required: true },
        frequency: {
            type: String,
            enum: ["One-Time", "Monthly", "Quarterly", "Yearly"],
            default: "One-Time"
        },
        months: [{ type: String }],
        dueDate: { type: Date, required: true },
    },
    { timestamps: true }
);

const FeeStructure: Model<IFeeStructure> =
    mongoose.models.FeeStructure || mongoose.model<IFeeStructure>("FeeStructure", FeeStructureSchema);

export default FeeStructure;
