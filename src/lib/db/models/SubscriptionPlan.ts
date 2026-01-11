import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
    name: string;
    price: number;
    currency: string;
    limits: {
        users: number; // Max total users
        storage: number; // GB
    };
    features: string[]; // List of modules enabled
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
    {
        name: { type: String, required: true, unique: true },
        price: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        limits: {
            users: { type: Number, required: true },
            storage: { type: Number, required: true },
        },
        features: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const SubscriptionPlan: Model<ISubscriptionPlan> =
    mongoose.models.SubscriptionPlan || mongoose.model<ISubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema);

export default SubscriptionPlan;
