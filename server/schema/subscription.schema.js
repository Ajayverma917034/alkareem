import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        /* USER */
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        /* PLAN */
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan",
            required: true,
        },

        /* RAZORPAY */
        razorpaySubscriptionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        /* STATUS */
        status: {
            type: String,
            enum: [
                "created",     // created but not started
                "active",      // running
                "cancelled",   // manually cancelled
                "expired",     // completed duration
                "failed",      // payment issue
            ],
            default: "created",
            index: true,
        },

        /* MEMBERSHIP DATES */
        startDate: {
            type: Date,
            default: null,
        },

        endDate: {
            type: Date,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        /* TRACKING */
        lastPaymentDate: {
            type: Date,
            default: null,
        },

        nextBillingDate: {
            type: Date,
            default: null,
        },

        /* OPTIONAL FLAGS */
        isAutoRenew: {
            type: Boolean,
            default: true,
        },

        /* META */
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;