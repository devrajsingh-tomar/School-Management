import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IFeePayment extends Document {
    school: Types.ObjectId;
    student: Types.ObjectId;
    // We can link to specific structures if partial payment, but usually bulk payment against "Dues"
    // For simplicity in this robust system, we just track amount against student. 
    // But to keep precision, let's allow optional linking or array of heads.
    // Simplifying: Payment is made by student. We deduce from total dues.
    receiptNumber: string;
    amountPaid: number;
    date: Date;
    method: "Cash" | "Online" | "Cheque" | "Transfer" | "Waiver";
    transactionReference?: string;
    paidBy?: string; // Guardian name
    status: "PAID" | "PARTIAL";
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FeePaymentSchema = new Schema<IFeePayment>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        student: { type: Schema.Types.ObjectId, ref: "Student", required: true }, // Changed ref to Student from User
        receiptNumber: { type: String, required: true }, // scoped unique per school ideally
        amountPaid: { type: Number, required: true },
        date: { type: Date, required: true },
        method: { type: String, enum: ["Cash", "Online", "Cheque", "Transfer", "Waiver"], default: "Cash" },
        transactionReference: { type: String },
        paidBy: { type: String },
        status: { type: String, enum: ["PAID", "PARTIAL"], required: true },
        remarks: { type: String },
    },
    { timestamps: true }
);

// Index for Receipt Number uniqueness
FeePaymentSchema.index({ school: 1, receiptNumber: 1 }, { unique: true });

const FeePayment: Model<IFeePayment> =
    mongoose.models.FeePayment || mongoose.model<IFeePayment>("FeePayment", FeePaymentSchema);

export default FeePayment;
