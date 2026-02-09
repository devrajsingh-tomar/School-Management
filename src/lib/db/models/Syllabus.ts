import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ISyllabusTopic {
    title: string;
    description?: string;
    status: "Pending" | "Completed";
    completedAt?: Date;
}

export interface ISyllabus extends Document {
    school: Types.ObjectId;
    class: Types.ObjectId;
    subject: string;
    academicSession: Types.ObjectId;
    topics: ISyllabusTopic[];
    createdAt: Date;
    updatedAt: Date;
}

const SyllabusSchema = new Schema<ISyllabus>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        subject: { type: String, required: true },
        academicSession: { type: Schema.Types.ObjectId, ref: "AcademicSession" },
        topics: [
            {
                title: { type: String, required: true },
                description: { type: String },
                status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
                completedAt: { type: Date },
            },
        ],
    },
    { timestamps: true }
);

const Syllabus: Model<ISyllabus> =
    mongoose.models.Syllabus || mongoose.model<ISyllabus>("Syllabus", SyllabusSchema);

export default Syllabus;
