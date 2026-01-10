import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ISection extends Document {
    school: Types.ObjectId;
    class: Types.ObjectId;
    name: string; // "A", "B", "Rose"
    classTeacher?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        name: { type: String, required: true },
        classTeacher: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Compound index: A class cannot have duplicate section names (e.g. two "A" sections in Grade 10)
SectionSchema.index({ school: 1, class: 1, name: 1 }, { unique: true });

const Section: Model<ISection> =
    mongoose.models.Section || mongoose.model<ISection>("Section", SectionSchema);

export default Section;
