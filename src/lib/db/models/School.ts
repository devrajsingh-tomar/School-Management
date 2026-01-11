import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISchool extends Document {
    name: string;
    slug: string;
    address?: string;
    contactEmail: string;
    status: "Active" | "Suspended" | "Pending";
    plan: "Free" | "Basic" | "Pro" | "Enterprise"; // Should ideally be ObjectId ref to SubscriptionPlan
    limits: {
        users: number;
        storage: number; // in GB
    };
    features: string[]; // Enabled modules e.g. ["HR", "Reports"]
    subscriptionExpiry?: Date;

    // Legacy/Existing fields
    subscriptionPlan?: string;
    isActive?: boolean;

    settings: {
        themeColor: string;
        logoKey?: string;
    };
    gracePeriodDays: number;
    autoRenew: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        address: { type: String },
        contactEmail: { type: String, required: true },

        status: {
            type: String,
            enum: ["Active", "Suspended", "Pending"],
            default: "Active"
        },
        plan: {
            type: String,
            default: "Free", // Simple string for now, could be Link
        },
        limits: {
            users: { type: Number, default: 50 },
            storage: { type: Number, default: 1 },
        },
        features: [{ type: String }], // Array of feature codes
        subscriptionExpiry: { type: Date },

        // Keeping for backward compat if needed, or map to new fields
        subscriptionPlan: { type: String },
        isActive: { type: Boolean, default: true },

        settings: {
            themeColor: { type: String, default: "#000000" },
            logoKey: { type: String },
        },
        gracePeriodDays: { type: Number, default: 7 },
        autoRenew: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const School: Model<ISchool> =
    mongoose.models.School || mongoose.model<ISchool>("School", SchoolSchema);

export default School;
