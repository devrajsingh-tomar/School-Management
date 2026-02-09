import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { EnquiryStatus } from "@/lib/types/enums";

export interface IEnquiry extends Document {
    school: Types.ObjectId;
    academicSession: Types.ObjectId;

    // Student Details
    studentName: string;
    gender: "Male" | "Female" | "Other";
    dob: Date;

    // Parent/Guardian Details
    parentName: string;
    email: string;
    phone: string;
    address: string;

    // Admission Details
    classAppliedFor: Types.ObjectId;
    previousSchool?: string;

    // Status & Pipeline
    status: EnquiryStatus;

    // Test/Interview Details
    testDate?: Date;
    testScore?: number;
    examResult?: string;
    interviewDate?: Date;
    interviewNotes?: string;

    // Conversion
    assignedStudent?: Types.ObjectId;

    // Documents
    documents: {
        name: string;
        url: string;
        type: string;
    }[];

    createdAt: Date;
    updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        academicSession: { type: Schema.Types.ObjectId, ref: "AcademicSession" }, // Optional for now, but good to have
        studentName: { type: String, required: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
        dob: { type: Date, required: true },
        parentName: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        address: { type: String },
        classAppliedFor: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        previousSchool: { type: String },
        status: {
            type: String,
            enum: Object.values(EnquiryStatus),
            default: EnquiryStatus.NEW,
        },
        testDate: { type: Date },
        testScore: { type: Number },
        examResult: { type: String },
        interviewDate: { type: Date },
        interviewNotes: { type: String },
        assignedStudent: { type: Schema.Types.ObjectId, ref: "Student" },
        documents: [
            {
                name: { type: String },
                url: { type: String },
                type: { type: String },
            },
        ],
    },
    { timestamps: true }
);

const Enquiry: Model<IEnquiry> =
    mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);

export default Enquiry;
