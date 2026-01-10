import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IStudentCategory extends Document {
    school: Types.ObjectId;
    name: string; // "General", "OBC", "SC"
    createdAt: Date;
    updatedAt: Date;
}

const StudentCategorySchema = new Schema<IStudentCategory>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        name: { type: String, required: true },
    },
    { timestamps: true }
);

// Unique category name per school
StudentCategorySchema.index({ school: 1, name: 1 }, { unique: true });

const StudentCategory: Model<IStudentCategory> =
    mongoose.models.StudentCategory || mongoose.model<IStudentCategory>("StudentCategory", StudentCategorySchema);

export default StudentCategory;
