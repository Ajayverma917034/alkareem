import mongoose from "mongoose";


const planSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    billingPeriod: { type: String, required: true },
    billingLabel: { type: String, required: true },
    annualEquivalent: { type: String, default: '' },
    accentColor: { type: String, default: '#3B82F6' },
    buttonColor: { type: String, default: '#3B82F6' },
    badge: { type: String, default: null },
    badgeColor: { type: String, default: null },
    isMostPopular: { type: Boolean, default: false },
    features: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    subscriberCount: { type: Number, default: 0 },
    razorpayPlanId: {
        type: String,
        default: null
    },
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);
export default Plan