import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISchool extends Document {
    name: string;
    slug: string;
    address?: string;
    contactEmail: string;
    subscriptionPlan: "FREE" | "BASIC" | "PREMIUM";
    isActive: boolean;
    settings: {
        themeColor: string;
        logoKey?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        address: { type: String },
        contactEmail: { type: String, required: true },
        subscriptionPlan: {
            type: String,
            enum: ["FREE", "BASIC", "PREMIUM"],
            default: "FREE",
        },
        isActive: { type: Boolean, default: true },
        settings: {
            themeColor: { type: String, default: "#000000" },
            logoKey: { type: String },
        },
    },
    { timestamps: true }
);

const School: Model<ISchool> =
    mongoose.models.School || mongoose.model<ISchool>("School", SchoolSchema);

export default School;
