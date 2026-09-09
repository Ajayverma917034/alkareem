import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["donate", "membership"],
            required: true,
            index: true,
        },

        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            default: null,
            index: true,
        },

        /* =================================================
           RAZORPAY ORDER (Donation / One Time Payment)
        ================================================= */
        razorpayOrderId: {
            type: String,
            default: null,
        },

        /* =================================================
           RAZORPAY SUBSCRIPTION (Membership)
        ================================================= */
        razorpaySubscriptionId: {
            type: String,
            default: null,
            sparse: true,
            index: true,
        },

        razorpayPaymentId: {
            type: String,
            default: null,
            sparse: true,
            index: true,
        },

        razorpaySignature: {
            type: String,
            default: null,
        },

        /* Amount in paise */
        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
        },

        status: {
            type: String,
            enum: [
                "created",
                "paid",
                "active",
                "failed",
                "cancelled",
                "refunded"
            ],
            default: "created",
            index: true,
        },

        method: {
            type: String,
            default: "",
        },
        notes: {
            type: String,
            default: "",
        },

        receipt: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

/* Virtual */
paymentSchema.virtual("amountInRupees").get(function () {
    return this.amount / 100;
});

paymentSchema.set("toJSON", { virtuals: true });
paymentSchema.set("toObject", { virtuals: true });

/* =================================================
   CONDITIONAL VALIDATION
================================================= */
paymentSchema.pre("validate", function () {

    /* donate needs orderId */
    if (
        this.type === "donate" &&
        !this.razorpayOrderId
    ) {
        return (
            new Error(
                "razorpayOrderId required for donate payment"
            )
        );
    }

    /* membership needs subscriptionId */
    if (
        this.type === "membership" &&
        !this.razorpaySubscriptionId
    ) {
        return (
            new Error(
                "razorpaySubscriptionId required for membership"
            )
        );
    }

});

const Payment = mongoose.model(
    "Payment",
    paymentSchema
);

export default Payment;