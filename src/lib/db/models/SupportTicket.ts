import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITicketReply {
    userId: mongoose.Types.ObjectId;
    userName: string;
    userRole: string;
    message: string;
    isAdminReply: boolean;
    createdAt: Date;
}

export interface ISupportTicket extends Document {
    ticketNumber: string;
    schoolId?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userName: string;
    userEmail: string;
    userRole: string;
    subject: string;
    message: string;
    status: "open" | "in_progress" | "closed";
    priority: "low" | "medium" | "high" | "urgent";
    category: "technical" | "billing" | "feature_request" | "bug" | "other";
    replies: ITicketReply[];
    assignedTo?: mongoose.Types.ObjectId;
    lastReplyAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TicketReplySchema = new Schema<ITicketReply>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    message: { type: String, required: true },
    isAdminReply: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const SupportTicketSchema = new Schema<ISupportTicket>(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        schoolId: {
            type: Schema.Types.ObjectId,
            ref: "School",
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        userName: { type: String, required: true },
        userEmail: { type: String, required: true },
        userRole: { type: String, required: true },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ["open", "in_progress", "closed"],
            default: "open",
            index: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        category: {
            type: String,
            enum: ["technical", "billing", "feature_request", "bug", "other"],
            default: "other",
        },
        replies: [TicketReplySchema],
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
        lastReplyAt: { type: Date },
    },
    { timestamps: true }
);

const SupportTicket: Model<ISupportTicket> =
    mongoose.models.SupportTicket || mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);

export default SupportTicket;
