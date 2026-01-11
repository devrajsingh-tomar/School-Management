import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IPayroll extends Document {
    school: Types.ObjectId;
    staff: Types.ObjectId;
    month: Date; // Store as first date of month e.g., 2026-01-01
    basic: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    status: "Draft" | "Paid";
    paymentDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PayrollSchema = new Schema<IPayroll>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        staff: { type: Schema.Types.ObjectId, ref: "User", required: true },
        month: { type: Date, required: true },
        basic: { type: Number, required: true },
        allowances: { type: Number, default: 0 },
        deductions: { type: Number, default: 0 },
        // netSalary can be calculated, but good to store for snapshot
        netSalary: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Draft", "Paid"],
            default: "Draft",
        },
        paymentDate: { type: Date },
    },
    { timestamps: true }
);

// Unique index to prevent duplicate payroll for same staff in same month
PayrollSchema.index({ school: 1, staff: 1, month: 1 }, { unique: true });

const Payroll: Model<IPayroll> =
    mongoose.models.Payroll || mongoose.model<IPayroll>("Payroll", PayrollSchema);

export default Payroll;
