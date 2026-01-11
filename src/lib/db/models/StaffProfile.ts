import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IStaffProfile extends Document {
    school: Types.ObjectId;
    user: Types.ObjectId;
    designation: string;
    department: string;
    joiningDate: Date;
    salaryStructure: {
        basic: number;
        allowances: number;
        deductions: number;
    };
    bankDetails?: {
        accountNumber: string;
        bankName: string;
        ifsc: string;
    };
    documents?: {
        title: string;
        url: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const StaffProfileSchema = new Schema<IStaffProfile>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // One profile per user
        designation: { type: String, required: true },
        department: { type: String, required: true },
        joiningDate: { type: Date, default: Date.now },
        salaryStructure: {
            basic: { type: Number, default: 0 },
            allowances: { type: Number, default: 0 },
            deductions: { type: Number, default: 0 },
        },
        bankDetails: {
            accountNumber: { type: String },
            bankName: { type: String },
            ifsc: { type: String },
        },
        documents: [
            {
                title: { type: String },
                url: { type: String },
            },
        ],
    },
    { timestamps: true }
);

const StaffProfile: Model<IStaffProfile> =
    mongoose.models.StaffProfile || mongoose.model<IStaffProfile>("StaffProfile", StaffProfileSchema);

export default StaffProfile;
