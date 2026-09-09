import Razorpay from "razorpay";

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const getRazorpayPeriod = (billingPeriod) => {
    const val = billingPeriod.toLowerCase();

    if (val === "monthly") {
        return { period: "monthly", interval: 1 };
    }

    if (val === "quarterly") {
        return { period: "monthly", interval: 3 };
    }

    if (val === "yearly") {
        return { period: "yearly", interval: 1 };
    }

    return { period: "monthly", interval: 1 };
};
