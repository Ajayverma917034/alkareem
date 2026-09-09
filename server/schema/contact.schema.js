// models/Contact.js

import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        /* ── Submitter info ─────────────────────────────────────── */
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name must be under 100 characters"],
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
            match: [/^\S+@\S+\.\S+$/, "Enter a valid email"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            match: [/^\d{10}$/, "Enter a valid 10-digit phone number"],
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            maxlength: [200, "Subject must be under 200 characters"],
        },
        queryType: {
            type: String,
            required: [true, "Query type is required"],
            enum: {
                values: ["volunteer", "dignitory", "donation", "membership", "other"],
                message: "Invalid query type",
            },
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            minlength: [20, "Message must be at least 20 characters"],
            maxlength: [2000, "Message must be under 2000 characters"],
        },

        /* ── Status & resolution ────────────────────────────────── */
        status: {
            type: String,
            enum: ["open", "in_progress", "resolved", "closed"],
            default: "open",
        },

        /* ── Admin tracking ─────────────────────────────────────── */
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
        closedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        closedAt: {
            type: Date,
            default: null,
        },

        /* ── Admin notes / activity log ─────────────────────────── */
        adminNotes: {
            type: String,
            trim: true,
            default: null,
        },
        activityLog: [
            {
                action: {
                    type: String,
                    // e.g. "created", "status_changed", "assigned", "note_added", "deleted"
                },
                by: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    default: null,
                },
                byName: { type: String, default: "System" },
                detail: { type: String, default: "" },
                at: { type: Date, default: Date.now },
            },
        ],

        /* ── Soft delete ────────────────────────────────────────── */
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

/* ── Indexes ──────────────────────────────────────────────────────── */
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ queryType: 1 });
contactSchema.index({ phone: 1 });
contactSchema.index({ isDeleted: 1 });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact