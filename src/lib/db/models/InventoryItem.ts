import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IInventoryItem extends Document {
    school: Types.ObjectId;
    name: string;
    category?: string;
    quantity: number;
    unit: string;
    minStockThreshold: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        name: { type: String, required: true },
        category: { type: String },
        quantity: { type: Number, default: 0, min: 0 },
        unit: { type: String, required: true, default: "pcs" },
        minStockThreshold: { type: Number, default: 0 },
        description: { type: String },
    },
    { timestamps: true }
);

const InventoryItem: Model<IInventoryItem> =
    mongoose.models.InventoryItem || mongoose.model<IInventoryItem>("InventoryItem", InventoryItemSchema);

export default InventoryItem;
