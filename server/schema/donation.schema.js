import mongoose from "mongoose";
import { generateDonationId } from "../utils/donationIdGenerator.js";
const documentSchema = new mongoose.Schema(
    {
        url: String,
        publicId: String,
        fileName: String,
        fileType: String,
        fileSize: Number,
    },
    { _id: false }
);

const donationSchema = new mongoose.Schema(
    {
        /* Logged user optional */
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        },

        /* Linked Payment Record */
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null,
            index: true
        },
        donationId: {
            type: String,
            unique: true,
            sparse: true
        },
        /* Donor Details */
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            default: ""
        },

        /* Donation Mode */
        mode: {
            type: String,
            enum: ["online", "offline"],
            default: "online",
            required: true,
            index: true
        },
        documents: [documentSchema],

        /* Amount (Rupees) */
        amount: {
            type: Number,
            required: true,
            min: 1
        },

        currency: {
            type: String,
            default: "INR"
        },

        /* Extra Info */
        purpose: {
            type: String,
            default: "",
            trim: true
        },

        message: {
            type: String,
            default: "",
            trim: true
        },

        notes: {
            type: String,
            default: "",
            trim: true
        },

        /* Offline Donation */
        offlineReference: {
            type: String,
            default: "",
            trim: true
        },

        /* Local Donation Status
           Payment status remains in Payment model */
        status: {
            type: String,
            enum: [
                "created",
                "pending",
                "paid",
                "failed",
                "cancelled"
            ],
            default: "created",
            index: true
        },

        paidAt: {
            type: Date,
            default: null
        },

        /* Optional Admin */
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        verifiedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

/* =====================================================
   INDEXES
===================================================== */
donationSchema.index({
    createdAt: -1
});

donationSchema.index({
    fullName: "text",
    email: "text",
    purpose: "text"
});

/* =====================================================
   VIRTUAL
===================================================== */
donationSchema.virtual("isPaid").get(function () {
    return this.status === "paid";
});

donationSchema.set("toJSON", {
    virtuals: true
});

donationSchema.set("toObject", {
    virtuals: true
});

donationSchema.pre("save", async function () {
    if (this.status === "paid" && !this.donationId) {
        this.donationId = await generateDonationId();
        this.paidAt = new Date();
    }

});

const Donation = mongoose.model(
    "Donation",
    donationSchema
);

export default Donation;