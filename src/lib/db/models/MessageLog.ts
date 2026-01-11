import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IMessageLog extends Document {
    school: Types.ObjectId;
    recipient: string; // Name or Phone or ID
    channel: "SMS" | "WhatsApp";
    content: string;
    status: "Sent" | "Failed" | "Pending";
    error?: string;
    sentAt: Date;
}

const MessageLogSchema = new Schema<IMessageLog>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        recipient: { type: String, required: true },
        channel: { type: String, enum: ["SMS", "WhatsApp"], required: true },
        content: { type: String, required: true },
        status: {
            type: String,
            enum: ["Sent", "Failed", "Pending"],
            default: "Pending",
        },
        error: { type: String },
        sentAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const MessageLog: Model<IMessageLog> =
    mongoose.models.MessageLog || mongoose.model<IMessageLog>("MessageLog", MessageLogSchema);

export default MessageLog;
