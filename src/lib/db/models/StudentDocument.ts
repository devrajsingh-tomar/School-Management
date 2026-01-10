import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IStudentDocument extends Document {
    school: Types.ObjectId;
    student: Types.ObjectId;
    name: string; // Document title e.g. "Birth Certificate"
    url: string; // File URL (S3/Cloudinary/Local)
    type: string; // MIMETYPE or category
    uploadedBy: Types.ObjectId;
    createdAt: Date;
}

const StudentDocumentSchema = new Schema<IStudentDocument>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const StudentDocument: Model<IStudentDocument> =
    mongoose.models.StudentDocument ||
    mongoose.model<IStudentDocument>("StudentDocument", StudentDocumentSchema);

export default StudentDocument;
