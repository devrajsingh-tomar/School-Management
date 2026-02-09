import mongoose from "mongoose";

const FeatureFlagSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        isEnabled: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const FeatureFlag = mongoose.models.FeatureFlag || mongoose.model("FeatureFlag", FeatureFlagSchema);

export default FeatureFlag;
