import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ILessonPlan extends Document {
    school: Types.ObjectId;
    teacher: Types.ObjectId;
    class: Types.ObjectId;
    subject: string;
    topic: string;
    startDate: Date;
    endDate: Date;
    status: "Planned" | "In Progress" | "Completed";
    resources?: string; // Links or text
    createdAt: Date;
}

const LessonPlanSchema = new Schema<ILessonPlan>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        teacher: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Created by
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        subject: { type: String, required: true },
        topic: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: { type: String, enum: ["Planned", "In Progress", "Completed"], default: "Planned" },
        resources: { type: String },
    },
    { timestamps: true }
);

const LessonPlan: Model<ILessonPlan> =
    mongoose.models.LessonPlan || mongoose.model<ILessonPlan>("LessonPlan", LessonPlanSchema);

export default LessonPlan;
