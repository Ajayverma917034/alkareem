export const razorpayWebhook = async (req, res) => {
    try {
        const event = req.body.event;
        const payload = req.body.payload;

        /* ===============================
           PAYMENT SUCCESS (RECURRING)
        =============================== */
        if (event === "invoice.paid") {

            const invoice = payload.invoice.entity;

            const razorpaySubscriptionId = invoice.subscription_id;
            const razorpayPaymentId = invoice.payment_id;
            const amount = invoice.amount_paid;

            const subscription = await Subscription.findOne({
                razorpaySubscriptionId,
            });

            if (!subscription) return res.json({});

            /* SAVE PAYMENT */
            await Payment.create({
                user: subscription.user,
                type: "membership",
                subscription: subscription._id,
                razorpaySubscriptionId,
                razorpayPaymentId,
                amount,
                status: "paid",
            });

            /* UPDATE SUBSCRIPTION */
            const now = new Date();

            subscription.status = "active";
            subscription.lastPaymentDate = now;

            // next billing (example monthly)
            const next = new Date(now);
            next.setMonth(next.getMonth() + 1);

            subscription.nextBillingDate = next;
            subscription.endDate = next;

            await subscription.save();
        }

        /* ===============================
           PAYMENT FAILED
        =============================== */
        if (event === "invoice.payment_failed") {
            const invoice = payload.invoice.entity;

            await Subscription.findOneAndUpdate(
                { razorpaySubscriptionId: invoice.subscription_id },
                { status: "failed" }
            );
        }

        /* ===============================
           SUBSCRIPTION CANCELLED
        =============================== */
        if (event === "subscription.cancelled") {
            const sub = payload.subscription.entity;

            await Subscription.findOneAndUpdate(
                { razorpaySubscriptionId: sub.id },
                {
                    status: "cancelled",
                    cancelledAt: new Date(),
                }
            );
        }

        return res.json({ received: true });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Webhook error" });
    }
};