import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IInventoryTransaction extends Document {
    school: Types.ObjectId;
    item: Types.ObjectId;
    type: "IN" | "OUT";
    quantity: number;
    performedBy: Types.ObjectId;
    reference?: string;
    date: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        item: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true },
        type: { type: String, enum: ["IN", "OUT"], required: true },
        quantity: { type: Number, required: true, min: 1 },
        performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reference: { type: String },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const InventoryTransaction: Model<IInventoryTransaction> =
    mongoose.models.InventoryTransaction ||
    mongoose.model<IInventoryTransaction>("InventoryTransaction", InventoryTransactionSchema);

export default InventoryTransaction;
