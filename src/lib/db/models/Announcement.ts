import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IAnnouncement extends Document {
    school: Types.ObjectId;
    title: string;
    content: string;
    type: "Notice" | "Announcement" | "Message";
    channel: "App" | "SMS" | "WhatsApp" | "Email";
    audience: "School" | "Class" | "Staff" | "Student" | "Parent";
    targetClass?: Types.ObjectId; // If audience is Class
    author: Types.ObjectId;
    createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
    {
        school: { type: Schema.Types.ObjectId, ref: "School", required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        type: {
            type: String,
            enum: ["Notice", "Announcement", "Message"],
            default: "Announcement",
        },
        channel: {
            type: String,
            enum: ["App", "SMS", "WhatsApp", "Email"],
            default: "App",
        },
        audience: {
            type: String,
            enum: ["School", "Class", "Staff", "Student", "Parent"],
            required: true,
        },
        targetClass: { type: Schema.Types.ObjectId, ref: "Class" },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

const Announcement: Model<IAnnouncement> =
    mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
