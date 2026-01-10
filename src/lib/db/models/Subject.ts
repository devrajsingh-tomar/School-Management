import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ISubject extends Document {
    school: Types.ObjectId;
    name: string;
    code?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        name: { type: String, required: true },
        code: { type: String },
    },
    { timestamps: true }
);

SubjectSchema.index({ school: 1, code: 1 }, { unique: true, sparse: true });

const Subject: Model<ISubject> =
    mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);

export default Subject;
