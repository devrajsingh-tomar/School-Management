import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IHouse extends Document {
    school: Types.ObjectId;
    name: string; // "Red", "Blue"
    color?: string; // Hex code
    createdAt: Date;
    updatedAt: Date;
}

const HouseSchema = new Schema<IHouse>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        name: { type: String, required: true },
        color: { type: String },
    },
    { timestamps: true }
);

// Unique house name per school
HouseSchema.index({ school: 1, name: 1 }, { unique: true });

const House: Model<IHouse> =
    mongoose.models.House || mongoose.model<IHouse>("House", HouseSchema);

export default House;
