import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
    school?: Types.ObjectId; // Optional because SuperAdmin actions might not belong to a school
    actor: Types.ObjectId;
    action: string;
    target?: string; // ID of the created/modified entity
    details?: any;
    ipAddress?: string;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School" },
        actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true },
        target: { type: String },
        details: { type: Schema.Types.Mixed },
        ipAddress: { type: String },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL Index: Logs expire after 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
