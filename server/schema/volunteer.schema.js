// models/Volunteer.js

import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
    {
        /* User Reference */
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        /* Generate After Approval Only */
        volunteerId: {
            type: String,
            default: undefined, // important
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        mobile: {
            type: String,
            default: "",
            trim: true,
        },

        gender: {
            type: String,
            default: "",
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

        role: {
            type: String,
            required: true,
        },

        roleDesc: {
            type: String,
            default: "",
        },

        contribution: {
            type: String,
            required: true,
        },

        dignitaryCode: {
            type: String,
            default: "",
        },

        dignitaryName: {
            type: String,
            default: "",
        },

        documents: [
            {
                url: String,
                publicId: String,
                fileName: String,
                fileType: String,
                fileSize: Number,
            },
        ],

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
            ],
            default: "pending",
            index: true,
        },

        dignitaryApprovedAt: Date,
        adminApprovedAt: Date,
        rejectedReason: String,
    },
    { timestamps: true }
);

/* ===============================
   INDEXES
================================= */

/* Only index real volunteerId values */
volunteerSchema.index(
    { volunteerId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            volunteerId: { $exists: true },
        },
    }
);

/* ===============================
   Generate Unique VOL ID
================================= */

volunteerSchema.statics.generateVolunteerId =
    async function () {
        const year = new Date().getFullYear();

        const last = await this.findOne({
            volunteerId: new RegExp(
                `^VOL-${year}-`
            ),
        }).sort({ volunteerId: -1 });

        let nextNumber = 1;

        if (last?.volunteerId) {
            const parts =
                last.volunteerId.split("-");

            nextNumber =
                parseInt(parts[2], 10) + 1;
        }

        return `VOL-${year}-${String(
            nextNumber
        ).padStart(4, "0")}`;
    };

/* ===============================
   Approve Method
================================= */

volunteerSchema.methods.approve =
    async function () {
        if (!this.volunteerId) {
            this.volunteerId =
                await this.constructor.generateVolunteerId();
        }

        this.status = "approved";
        this.adminApprovedAt = new Date();

        await this.save();

        return this;
    };

const Volunteer = mongoose.model(
    "Volunteer",
    volunteerSchema
);

export default Volunteer;