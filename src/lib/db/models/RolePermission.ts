import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IRolePermission extends Document {
    role: string;
    permissions: string[];
    school?: Types.ObjectId; // Null for system defaults
    createdAt: Date;
    updatedAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermission>(
    {
        role: { type: String, required: true },
        permissions: [{ type: String }],
        school: { type: Schema.Types.ObjectId, ref: "School" },
    },
    { timestamps: true }
);

// Index: Unique permissions per role per school (or system wide)
RolePermissionSchema.index({ role: 1, school: 1 }, { unique: true });

const RolePermission: Model<IRolePermission> =
    mongoose.models.RolePermission || mongoose.model<IRolePermission>("RolePermission", RolePermissionSchema);

export default RolePermission;
