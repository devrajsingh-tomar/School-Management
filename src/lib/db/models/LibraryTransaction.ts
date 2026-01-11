import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ILibraryTransaction extends Document {
    school: Types.ObjectId;
    book: Types.ObjectId;
    user: Types.ObjectId;
    issuedBy: Types.ObjectId;
    issueDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: "Issued" | "Returned" | "Overdue" | "Lost";
    fine: number;
    createdAt: Date;
    updatedAt: Date;
}

const LibraryTransactionSchema = new Schema<ILibraryTransaction>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        issueDate: { type: Date, required: true, default: Date.now },
        dueDate: { type: Date, required: true },
        returnDate: { type: Date },
        status: {
            type: String,
            enum: ["Issued", "Returned", "Overdue", "Lost"],
            default: "Issued",
        },
        fine: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const LibraryTransaction: Model<ILibraryTransaction> =
    mongoose.models.LibraryTransaction ||
    mongoose.model<ILibraryTransaction>("LibraryTransaction", LibraryTransactionSchema);

export default LibraryTransaction;
