import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getNextSequence } from "../utils/donationIdGenerator.js";

const userSchema = new mongoose.Schema(
    {
        clientId: {
            type: String,
            unique: true,
            index: true
        },
        name: {
            type: String,
            trim: true,
            default: "",
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["donator", "volunteer", "dignitary"],
            default: "donator",
            required: true,
            index: true,
        },

        countryCode: {
            type: String,
            default: "+91",
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        /* NEW FIELDS */

        gender: {
            type: String,
            enum: ["Male", "Female", "Other", "Prefer not to say"],
            default: "Male",
        },

        occupation: {
            type: String,
            default: "",
        },

        pincode: {
            type: String,
            default: "",
        },

        address: {
            type: String,
            default: "",
        },

        country: {
            type: String,
            default: "",
        },

        state: {
            type: String,
            default: "",
        },

        city: {
            type: String,
            default: "",
        },

        volunteerId: {
            type: String,
            default: "",
            index: true,
        },

        dignitaryId: {
            type: String,
            default: "",
            index: true,
        },

        profileImage: {
            type: String,
            default: "",
        },

        /* STATUS */

        isPhoneVerified: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        /* OTP */

        // bcrypt HASH of the current OTP — the raw code is never stored.
        otp: String,
        otpExpireAt: Date,
        otpCooldownUntil: Date,

        // wrong-guess counter for the CURRENT otp only (resets on every new send)
        otpAttempts: {
            type: Number,
            default: 0,
        },

        // rolling hourly/daily send counters, used to cap OTP sends per number
        otpSendCountHour: {
            type: Number,
            default: 0,
        },
        otpSendHourStart: Date,

        otpSendCountDay: {
            type: Number,
            default: 0,
        },
        otpSendDayStart: Date,

        // set automatically when a phone number crosses a send/verify abuse
        // threshold; distinct from `isActive` which is a manual admin block.
        otpBlockedUntil: Date,

        lastLoginAt: Date,
    },
    { timestamps: true }
);

/* ================= METHODS ================= */

// Resend cooldown only (the short 30s-style gap between two sends)
userSchema.methods.canSendOtp = function () {
    if (!this.otpCooldownUntil) return true;
    return new Date() > this.otpCooldownUntil;
};

// Is this number currently under an abuse block (auto-triggered by hitting
// send/verify limits)? Separate from `isActive`, which is a manual admin block.
userSchema.methods.getOtpBlockStatus = function () {
    if (this.otpBlockedUntil && new Date() < this.otpBlockedUntil) {
        const seconds = Math.ceil(
            (this.otpBlockedUntil.getTime() - Date.now()) / 1000
        );
        return { blocked: true, seconds };
    }
    return { blocked: false, seconds: 0 };
};

// Enforces "N per hour" / "N per day" send caps for this phone number.
// Rolls the hour/day windows forward automatically. If the caps are
// breached, auto-blocks the number for `blockMinutes`.
// Call this AFTER canSendOtp()/getOtpBlockStatus() pass, right before
// issuing a new code.
userSchema.methods.checkAndRegisterOtpSend = async function ({
    maxPerHour,
    maxPerDay,
    blockMinutes,
}) {
    const now = new Date();

    if (!this.otpSendHourStart || now - this.otpSendHourStart > 60 * 60 * 1000) {
        this.otpSendHourStart = now;
        this.otpSendCountHour = 0;
    }

    if (!this.otpSendDayStart || now - this.otpSendDayStart > 24 * 60 * 60 * 1000) {
        this.otpSendDayStart = now;
        this.otpSendCountDay = 0;
    }

    if (this.otpSendCountHour >= maxPerHour || this.otpSendCountDay >= maxPerDay) {
        this.otpBlockedUntil = new Date(now.getTime() + blockMinutes * 60 * 1000);
        await this.save();
        return {
            allowed: false,
            reason: this.otpSendCountDay >= maxPerDay ? "daily" : "hourly",
        };
    }

    this.otpSendCountHour += 1;
    this.otpSendCountDay += 1;
    return { allowed: true };
};

userSchema.pre("save", async function () {
    try {
        if (this.isNew && !this.clientId) {
            const seq = await getNextSequence("user");
            this.clientId = `USR${seq.toString().padStart(5, "0")}`;
        }

    } catch (err) {
        return err
    }
});

// Save OTP as a bcrypt hash (never store the raw code)
userSchema.methods.setOtp = async function (
    code,
    { expiryMinutes = 5, cooldownSeconds = 30 } = {}
) {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(code, salt);
    this.otpExpireAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    this.otpCooldownUntil = new Date(Date.now() + cooldownSeconds * 1000);
    this.otpAttempts = 0;

    await this.save();
};

// Verify OTP.
// `testMode`/`staticCode` let the controller pass through OTP_MODE=test
// behaviour (fixed code, e.g. "123456") WITHOUT that logic living here as a
// hardcoded bypass — it only applies when the server is explicitly running
// in test mode via env var.
userSchema.methods.verifyOtp = async function (
    code,
    {
        maxAttempts = 5,
        blockMinutes = 60,
        testMode = false,
        staticCode = "123456",
    } = {}
) {
    const blockStatus = this.getOtpBlockStatus();
    if (blockStatus.blocked) {
        return {
            success: false,
            blocked: true,
            message: `Too many attempts. Try again in ${blockStatus.seconds}s`,
        };
    }

    if (!this.otp || !this.otpExpireAt) {
        return { success: false, message: "OTP not found. Please request a new one." };
    }

    if (new Date() > this.otpExpireAt) {
        return { success: false, message: "OTP expired. Please request a new one." };
    }

    if (this.otpAttempts >= maxAttempts) {
        // lock the number out for a while and invalidate the current OTP
        this.otpBlockedUntil = new Date(Date.now() + blockMinutes * 60 * 1000);
        this.otp = null;
        this.otpExpireAt = null;
        await this.save();
        return {
            success: false,
            blocked: true,
            message: `Too many incorrect attempts. Try again in ${blockMinutes} minute(s).`,
        };
    }

    const isValid = testMode
        ? code === staticCode
        : await bcrypt.compare(String(code), this.otp);

    if (!isValid) {
        this.otpAttempts += 1;
        await this.save();
        return {
            success: false,
            message: "Invalid OTP",
            attemptsLeft: Math.max(maxAttempts - this.otpAttempts, 0),
        };
    }

    this.isPhoneVerified = true;
    this.lastLoginAt = new Date();

    this.otp = null;
    this.otpExpireAt = null;
    this.otpCooldownUntil = null;
    this.otpAttempts = 0;
    this.otpBlockedUntil = null;

    await this.save();

    return { success: true, message: "Login successful" };
};

const User = mongoose.model("User", userSchema);

export default User;