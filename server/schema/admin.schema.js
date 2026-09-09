
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        isUserVerify: {
            type: Boolean,
            default: false,
        },

        // otp
        otp: String,
        otpExpire: { type: Number, default: 0 },

        resetOtp: { type: String, default: "" },
        resetOtpExpire: { type: Number, default: 0 },

        // RESET PASSWORD FIELDS
        resetPasswordToken: String,
        resetPasswordExpire: { type: Date, default: null },
    },
    {
        timestamps: true,
    }
);

const Admin = mongoose.models.admin || mongoose.model("admin", adminSchema);

export default Admin;