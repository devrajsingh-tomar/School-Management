import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IClass extends Document {
    school: Types.ObjectId;
    name: string;
    sections?: Types.ObjectId[]; // Array of Section IDs
    createdAt: Date;
    updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        name: { type: String, required: true },
        sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
    },
    { timestamps: true }
);

// Compound index to ensure class names are unique per school
ClassSchema.index({ school: 1, name: 1 }, { unique: true });

const Class: Model<IClass> =
    mongoose.models.Class || mongoose.model<IClass>("Class", ClassSchema);

export default Class;
