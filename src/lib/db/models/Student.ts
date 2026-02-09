import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { StudentStatus } from "@/lib/types/enums";

export interface IStudent extends Document {
    school: Types.ObjectId;
    admissionNumber: string;
    rollNumber?: string;
    firstName: string;
    lastName: string;
    dob: Date;
    gender: "Male" | "Female" | "Other";
    email?: string;
    phone?: string;

    // Transport
    transportRoute?: Types.ObjectId;
    transportStop?: string;

    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };

    // Academic Info
    class: Types.ObjectId;
    section?: Types.ObjectId;
    house?: Types.ObjectId;
    category?: Types.ObjectId;

    // Relations
    guardians: Types.ObjectId[];

    // Status
    status: StudentStatus;

    // Media & Docs (Optional ref, can also query StudentDocument model directly)
    profilePicture?: string;

    createdAt: Date;
    updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        admissionNumber: { type: String, required: true },
        rollNumber: { type: String },

        // Transport
        transportRoute: { type: Schema.Types.ObjectId, ref: "TransportRoute" },
        transportStop: { type: String },

        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dob: { type: Date, required: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
        email: { type: String },
        phone: { type: String },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String },
        },
        class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        section: { type: Schema.Types.ObjectId, ref: "Section" },
        house: { type: Schema.Types.ObjectId, ref: "House" },
        category: { type: Schema.Types.ObjectId, ref: "StudentCategory" },
        guardians: [{ type: Schema.Types.ObjectId, ref: "Guardian" }],
        status: {
            type: String,
            enum: Object.values(StudentStatus),
            default: StudentStatus.ENQUIRY,
        },
        profilePicture: { type: String },
    },
    { timestamps: true }
);

// Compound index for unique admission number within a school
StudentSchema.index({ school: 1, admissionNumber: 1 }, { unique: true });

const Student: Model<IStudent> =
    mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
