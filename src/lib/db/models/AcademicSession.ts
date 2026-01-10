import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IAcademicSession extends Document {
    school: Types.ObjectId;
    name: string; // e.g. "2024-2025"
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AcademicSessionSchema = new Schema<IAcademicSession>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isCurrent: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Ensure only one session is active per school (handled in logic, but index helps)
// Partial index for unique isCurrent=true per school? Mongoose doesn't easily support "one true, many false" constraint across documents without partial index.
AcademicSessionSchema.index({ school: 1, isCurrent: 1 }, { unique: true, partialFilterExpression: { isCurrent: true } });

const AcademicSession: Model<IAcademicSession> =
    mongoose.models.AcademicSession || mongoose.model<IAcademicSession>("AcademicSession", AcademicSessionSchema);

export default AcademicSession;
