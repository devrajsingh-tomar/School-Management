import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    passwordHash?: string;
    role: string;
    school?: Types.ObjectId;
    isActive: boolean;
    class?: Types.ObjectId;
    section?: Types.ObjectId;
    linkedStudentId?: Types.ObjectId;
    // Parent Details
    children?: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, sparse: true },
        phone: { type: String, unique: true, sparse: true },
        passwordHash: { type: String },
        role: { type: String, required: true },
        school: { type: Schema.Types.ObjectId, ref: "School" },
        isActive: { type: Boolean, default: true },
        // Academic Details (for Students)
        class: { type: Schema.Types.ObjectId, ref: "Class" },
        section: { type: Schema.Types.ObjectId, ref: "Section" },
        linkedStudentId: { type: Schema.Types.ObjectId, ref: "Student" },
        // Parent Details
        children: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    },
    { timestamps: true }
);

UserSchema.set("strictPopulate" as any, false);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
