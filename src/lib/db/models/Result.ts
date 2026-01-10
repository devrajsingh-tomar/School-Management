import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IResult extends Document {
    school: Types.ObjectId;
    exam: Types.ObjectId;
    student: Types.ObjectId;
    class: Types.ObjectId;

    // Map subject name to obtained marks
    // Used Map for flexibility, but array of objects might be easier for aggregation.
    // Let's use array of objects for better query power.
    subjectScores: {
        subject: string;
        marksObtained: number;
        remarks?: string;
    }[];

    totalObtained: number;
    totalMax: number;
    percentage: number;
    grade: string; // A+, B, etc.
    rank?: number;

    status: "PASS" | "FAIL" | "WITHHELD";
    isLocked: boolean; // Cannot change marks
    createdAt: Date;
    updatedAt: Date;
}

const ResultSchema = new Schema<IResult>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
        student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },

        subjectScores: [{
            subject: { type: String, required: true },
            marksObtained: { type: Number, required: true },
            remarks: { type: String }
        }],

        totalObtained: { type: Number, default: 0 },
        totalMax: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        grade: { type: String },
        rank: { type: Number },

        status: { type: String, enum: ["PASS", "FAIL", "WITHHELD"], default: "PASS" },
        isLocked: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Index to find student result for an exam easily
ResultSchema.index({ exam: 1, student: 1 }, { unique: true });

const Result: Model<IResult> =
    mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);

export default Result;
