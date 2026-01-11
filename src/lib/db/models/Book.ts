import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IBook extends Document {
    school: Types.ObjectId;
    title: string;
    author: string;
    isbn?: string;
    category?: string;
    totalCopies: number;
    availableCopies: number;
    shelfLocation?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        title: { type: String, required: true },
        author: { type: String, required: true },
        isbn: { type: String },
        category: { type: String },
        totalCopies: { type: Number, required: true, min: 0 },
        availableCopies: { type: Number, required: true, min: 0 },
        shelfLocation: { type: String },
    },
    { timestamps: true }
);

const Book: Model<IBook> =
    mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);

export default Book;
