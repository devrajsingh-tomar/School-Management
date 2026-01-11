import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
    school?: Types.ObjectId; // Optional: System level events might not have school
    user?: Types.ObjectId; // Who performed
    action: string;
    entity: string;
    details: any;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School" },
        user: { type: Schema.Types.ObjectId, ref: "User" },
        action: { type: String, required: true },
        entity: { type: String, required: true },
        details: { type: Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
