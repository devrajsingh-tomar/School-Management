import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IHomework extends Document {
    school: Types.ObjectId;
    title: string;
    description: string;
    class: Types.ObjectId;
    section?: Types.ObjectId; // Optional: Assign to specific section or entire class
    subject?: string; // Text for now, or link to future Subject model
    teacher: Types.ObjectId;
    type: "Homework" | "Classwork" | "Project";
    dueDate: Date;
    attachments: string[]; // URLs
    createdAt: Date;
    updatedAt: Date;
}

const HomeworkSchema = new Schema<IHomework>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        title: { type: String, required: true },
        description: { type: String },
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        section: { type: Schema.Types.ObjectId, ref: "Section" },
        subject: { type: String, required: true },
        teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["Homework", "Classwork", "Project"], default: "Homework" },
        dueDate: { type: Date },
        attachments: [{ type: String }], // Array of URLs
    },
    { timestamps: true }
);

const Homework: Model<IHomework> =
    mongoose.models.Homework || mongoose.model<IHomework>("Homework", HomeworkSchema);

export default Homework;
