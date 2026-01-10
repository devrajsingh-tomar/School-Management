import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IGuardian extends Document {
    school: Types.ObjectId;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    relationship: string; // Father, Mother, Guardian
    occupation?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const GuardianSchema = new Schema<IGuardian>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        relationship: { type: String, required: true },
        occupation: { type: String },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String },
        },
    },
    { timestamps: true }
);

const Guardian: Model<IGuardian> =
    mongoose.models.Guardian || mongoose.model<IGuardian>("Guardian", GuardianSchema);

export default Guardian;
