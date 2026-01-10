import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IExamSubject {
    name: string;
    maxMarks: number;
    passingMarks: number;
}

export interface IExam extends Document {
    school: Types.ObjectId;
    name: string; // "Mid Term 2024"
    type: "Term" | "Unit Test" | "Final" | "Other";
    class: Types.ObjectId; // One exam per class usually, or shared structure? Keeping simple: One per class.
    startDate: Date;
    endDate: Date;
    subjects: IExamSubject[];
    isPublished: boolean; // Accessible to students?
    isActive: boolean; // Teachers can edit?
    createdAt: Date;
    updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        name: { type: String, required: true },
        type: { type: String, enum: ["Term", "Unit Test", "Final", "Other"], required: true },
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        subjects: [{
            name: { type: String, required: true },
            maxMarks: { type: Number, required: true },
            passingMarks: { type: Number, required: true }
        }],
        isPublished: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Exam: Model<IExam> =
    mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);

export default Exam;
