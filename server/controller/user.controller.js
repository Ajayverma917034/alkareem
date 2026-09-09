import { clearUserAuthToken, sendUserAuthToken } from "../utils/sendUserAuthToken.js";
import User from "../schema/user.schema.js";
import Volunteer from "../schema/volunteer.schema.js";
import { deleteImage, uploadImageToGlobal } from "../utils/uploadImage.js";
import Dignitary from "../schema/dignitary.schema.js";
import Plan from "../schema/plan.schema.js";
import crypto from "crypto";
import Payment from "../schema/payment.schema.js";
import Donation from "../schema/donation.schema.js";
import { razorpay } from "../utils/razorpay.js";
import Subscription from "../schema/subscription.schema.js";
import dayjs from "dayjs";
import cron from 'node-cron';
import Contact from "../schema/contact.schema.js";
import { sendOtpSms } from "../utils/smsService.js";
import {
    OTP_MODE,
    isTestMode,
    OTP_STATIC_CODE,
    OTP_EXPIRY_MINUTES,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_MAX_PER_HOUR,
    OTP_MAX_PER_DAY,
    OTP_MAX_VERIFY_ATTEMPTS,
    OTP_ABUSE_BLOCK_MINUTES,
    generateOtp,
} from "../utils/otpConfig.js";


// ==============================
// VALIDATE PHONE
// ==============================
const validIndianMobile = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
};

// ==============================
// SEND OTP
// ==============================
export const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!validIndianMobile(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid mobile number",
            });
        }

        let user = await User.findOne({ phone });

        if (!user) {
            user = await User.create({
                phone,
                name: "User",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account blocked",
            });
        }

        // auto-block from abuse (hourly/daily cap breach or too many wrong OTPs)
        const blockStatus = user.getOtpBlockStatus();
        if (blockStatus.blocked) {
            return res.status(429).json({
                success: false,
                message: `Too many OTP requests. Try again in ${blockStatus.seconds}s`,
            });
        }

        // short resend cooldown (e.g. 30s between two sends)
        if (!user.canSendOtp()) {
            const seconds = Math.ceil(
                (new Date(user.otpCooldownUntil).getTime() - Date.now()) / 1000
            );

            return res.status(429).json({
                success: false,
                message: `Wait ${seconds}s before resend`,
            });
        }

        // hourly/daily send caps — auto-blocks the number if breached
        const sendCheck = await user.checkAndRegisterOtpSend({
            maxPerHour: OTP_MAX_PER_HOUR,
            maxPerDay: OTP_MAX_PER_DAY,
            blockMinutes: OTP_ABUSE_BLOCK_MINUTES,
        });

        if (!sendCheck.allowed) {
            return res.status(429).json({
                success: false,
                message:
                    sendCheck.reason === "daily"
                        ? "Daily OTP limit reached. Please try again tomorrow."
                        : "Hourly OTP limit reached. Please try again later.",
            });
        }

        const otp = generateOtp();

        await user.setOtp(otp, {
            expiryMinutes: OTP_EXPIRY_MINUTES,
            cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
        });

        // OTP_MODE=prod -> actually hit the SMS gateway.
        // OTP_MODE=dev/test -> never send real SMS (saves credits, lets you
        // develop/test/get app-store-reviewed without a live phone).
        if (OTP_MODE === "prod") {
            const smsResult = await sendOtpSms(`${phone}`, otp);
            if (!smsResult.success) {
                console.error("[sendOtp] SMS send failed:", smsResult.error);
                // Not failing the request — OTP is already stored, user can
                // retry send, or flip this to return a 502 for a hard failure.
            }
        } else {
            console.log(`[sendOtp][${OTP_MODE}] OTP for ${phone}: ${otp}`);
        }

        const response = {
            success: true,
            message: "OTP sent successfully",
            resendIn: OTP_RESEND_COOLDOWN_SECONDS,
        };

        // Never leak the OTP in prod responses. In dev/test it's returned so
        // you can log in without depending on a real SMS gateway.
        if (OTP_MODE !== "prod") {
            response.otp = otp;
            response.mode = OTP_MODE;
        }

        return res.status(200).json(response);
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ==============================
// VERIFY OTP LOGIN
// ==============================
export const verifyOtpLogin = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone and OTP are required",
            });
        }

        const user = await User.findOne({ phone });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account blocked",
            });
        }

        const result = await user.verifyOtp(otp, {
            maxAttempts: OTP_MAX_VERIFY_ATTEMPTS,
            blockMinutes: OTP_ABUSE_BLOCK_MINUTES,
            testMode: isTestMode,
            staticCode: OTP_STATIC_CODE,
        });

        if (!result.success) {
            return res.status(result.blocked ? 429 : 400).json(result);
        }

        return sendUserAuthToken(user, 200, res);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ==============================
// GET ME
// ==============================
export const getMe = async (req, res) => {
    try {
        return sendUserAuthToken(req.user, 200, res);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ==============================
// LOGOUT
// ==============================
export const logout = async (req, res) => {
    return clearUserAuthToken(res);
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-otp -otpExpireAt -otpCooldownUntil -otpAttempts")
            .lean();

        if (!user) throw new AppError("User not found", 404);

        res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ─── PUT /auth/profile ────────────────────────────────────────────────────────
// Update editable profile fields (phone is excluded)
export const updateProfile = async (req, res) => {
    try {
        const ALLOWED_FIELDS = [
            "name",
            "email",
            "gender",
            "occupation",
            "address",
            "pincode",
            "city",
            "state",
            "country",
        ];

        // Build update object from only allowed keys
        const updates = {};
        for (const key of ALLOWED_FIELDS) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            throw new AppError("No valid fields provided for update", 400);
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-otp -otpExpireAt -otpCooldownUntil -otpAttempts");

        if (!user) throw new AppError("User not found", 404);

        res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ─── PUT /auth/profile/image ──────────────────────────────────────────────────
// Upload / replace profile image via Cloudinary
export const updateProfileImage = async (req, res) => {
    try {
        if (!req.files.profileImage) {
            throw new AppError("No image file provided", 400);
        }


        const user = await User.findById(req.user._id);
        if (!user) throw new AppError("User not found", 404);

        // Delete old image from Cloudinary if it exists
        if (user.profileImage) {
            await deleteImage(user.profileImage).catch(() => null);
        }

        // Upload new image
        const result = await uploadImageToGlobal(
            req.files.profileImage,
            "profile"
        );

        user.profileImage = result.url;
        await user.save();

        res.status(200).json({
            success: true,
            profileImage: user.profileImage,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};



// volunteer
// controllers/volunteerController.js

export const createVolunteer = async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            fullName,
            email,
            mobile,
            gender,
            occupation,
            pincode,
            address,
            country,
            state,
            city,
            role,
            roleDesc,
            contribution,
            dignitaryCode,
            dignitaryName,
        } = req.body;

        /* Validation */
        if (!fullName || !email || !role || !contribution) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        /* Already Active Request */
        // const exists = await Volunteer.findOne({
        //   userId,
        //   status: {
        //     $in: [
        //       "Submitted",
        //       "Dignitary Approval",
        //       "Admin Approval",
        //       "Approved",
        //     ],
        //   },
        // });

        // if (exists) {
        //   return res.status(400).json({
        //     success: false,
        //     message: "Volunteer request already exists",
        //   });
        // }

        /* Files Upload */
        const documents = [];

        if (req.files?.documents) {
            const uploadFiles = Array.isArray(
                req.files.documents
            )
                ? req.files.documents
                : [req.files.documents];

            for (const file of uploadFiles) {
                const uploaded = await uploadImageToGlobal(
                    file,
                    "volunteer"
                );

                documents.push({
                    url: uploaded.url,
                    publicId: uploaded.name,
                    fileName: file.name,
                    fileType: file.mimetype,
                    fileSize: uploaded.size,
                });
            }
        }

        /* Create */
        const volunteer = await Volunteer.create({
            userId,

            fullName,
            email,
            mobile,
            gender,
            occupation,
            pincode,
            address,
            country,
            state,
            city,

            role,
            roleDesc,
            contribution,

            dignitaryCode,
            dignitaryName,

            documents,
        });

        return res.status(201).json({
            success: true,
            message:
                "Volunteer request submitted successfully",
            data: volunteer,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

export const getMyVolunteers = async (req, res) => {
    try {
        const userId = req.user._id;

        const volunteers = await Volunteer.find({
            userId,
        })
            .sort({ createdAt: -1 })
            .lean();

        const formattedVolunteers = volunteers.map(
            (item) => ({
                _id: item._id,
                volunteerId: item.volunteerId,
                fullName: item.fullName,
                email: item.email,
                mobile: item.mobile,
                gender: item.gender,
                occupation: item.occupation,

                address: item.address,
                country: item.country,
                state: item.state,
                city: item.city,
                pincode: item.pincode,

                role: item.role,
                roleDesc: item.roleDesc,
                contribution: item.contribution,

                dignitaryCode: item.dignitaryCode,
                dignitaryName: item.dignitaryName,

                documents: item.documents || [],

                status: item.status,

                dignitaryApprovedAt:
                    item.dignitaryApprovedAt,
                adminApprovedAt:
                    item.adminApprovedAt,

                rejectedReason:
                    item.rejectedReason || "",

                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })
        );

        return res.status(200).json({
            success: true,
            count: formattedVolunteers.length,
            volunteers: formattedVolunteers,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch volunteer applications",
        });
    }
};



export const registerDignitary = async (
    req,
    res
) => {
    try {
        const userId = req.user._id;

        const {
            fullName,
            email,
            mobile,
            gender,

            pincode,
            city,
            state,
            country,

            dignitaryName,
            placeType,
            fullAddress,
            placePincode,
            placeCity,
            placeState,
            placeCountry,

            role,
        } = req.body;

        if (
            !fullName ||
            !email ||
            !mobile ||
            !dignitaryName ||
            !placeType ||
            !fullAddress ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const exists =
            await Dignitary.findOne({
                userId,
                status: {
                    $in: ["pending"],
                },
            });

        if (exists) {
            return res.status(400).json({
                success: false,
                message:
                    "Dignitary request already exists",
            });
        }

        const documents = [];

        if (req.files?.documents) {
            const files = Array.isArray(
                req.files.documents
            )
                ? req.files.documents
                : [req.files.documents];

            for (const file of files) {
                const uploaded =
                    await uploadImageToGlobal(
                        file,
                        "dignitary"
                    );

                documents.push({
                    url: uploaded.url,
                    publicId: uploaded.name,
                    fileName: file.name,
                    fileType: file.mimetype,
                    fileSize: uploaded.size,
                });
            }
        }

        const dignitary =
            await Dignitary.create({
                userId,

                fullName,
                email,
                mobile,
                gender,

                pincode,
                city,
                state,
                country,

                dignitaryName,
                placeType,
                fullAddress,
                placePincode,
                placeCity,
                placeState,
                placeCountry,

                role,

                documents,
            });

        return res.status(201).json({
            success: true,
            message:
                "Dignitary registration submitted successfully",
            dignitaryId:
                dignitary.dignitaryId,
            data: dignitary,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server error",
        });
    }
};

export const getMyDignitaries = async (req, res) => {
    try {
        const userId = req.user._id;

        const dignitaries = await Dignitary.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            dignitaries,
        });
    } catch (error) {
        res.status(500).json({ message: err.message });
    }
}
export const getMyDignitaryById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const dignitary = await Dignitary.findOne({ _id: id, userId }).lean();

        if (!dignitary) {
            throw new AppError("Dignitary application not found", 404);
        }

        res.status(200).json({
            success: true,
            dignitary,
        });
    } catch (error) {
        res.status(500).json({ message: err.message });

    }
};


// membership
export const getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort('order');
        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// payment for membership or plan


export const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json({ success: true, plans });
    } catch (error) {
        console.error("getPlans error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch plans" });
    }
};

async function activateSubscription(subscriptionDoc) {
    const subscription = subscriptionDoc.plan
        ? subscriptionDoc
        : await Subscription.findById(subscriptionDoc._id).populate("plan");

    if (!subscription) return;

    const now = dayjs();
    const next =
        subscription.plan.billingPeriod === "yearly"
            ? now.add(1, "year")
            : now.add(1, "month");

    subscription.status = "active";
    subscription.startDate = now.toDate();
    subscription.endDate = next.toDate();
    subscription.lastPaymentDate = now.toDate();
    subscription.nextBillingDate = next.toDate();
    await subscription.save();

    await Plan.findByIdAndUpdate(subscription.plan._id, {
        $inc: { subscriberCount: 1 },
    });

    return subscription;
}

/* ─────────────────────────────────────────────
   CREATE ORDER / SUBSCRIPTION
───────────────────────────────────────────────*/
export const joinMembership = async (req, res) => {
    try {
        const { type, planId, amount } = req.body;
        const userId = req.user._id;

        if (!type) {
            return res.status(400).json({ success: false, message: "Payment type required" });
        }

        /* ══════════ DONATION ══════════ */
        if (type === "donate") {
            const donateAmount = Number(amount);
            if (!donateAmount || donateAmount < 1) {
                return res.status(400).json({ message: "Minimum donation ₹1 required" });
            }

            const amountInPaise = Math.round(donateAmount * 100);

            const order = await razorpay.orders.create({
                amount: amountInPaise,
                currency: "INR",
                receipt: `donate_${Date.now()}`,
            });

            const payment = await Payment.create({
                user: userId,
                type: "donate",
                razorpayOrderId: order.id,
                amount: amountInPaise,
                status: "created",
            });

            return res.json({
                success: true,
                mode: "order",
                orderId: order.id,
                paymentId: payment._id,
                key: process.env.RAZORPAY_KEY_ID,
            });
        }

        /* ══════════ MEMBERSHIP ══════════ */
        if (type === "membership") {
            const plan = await Plan.findById(planId);
            if (!plan || !plan.isActive) {
                return res.status(404).json({ message: "Plan not found" });
            }

            // Already has an active subscription?
            const activeSub = await Subscription.findOne({
                user: userId,
                status: "active",
                endDate: { $gt: dayjs().toDate() },
            });
            if (activeSub) {
                return res.status(400).json({ message: "Already active subscription" });
            }

            // Reuse a recent pending subscription (< 30 min) for the SAME plan
            const pendingSub = await Subscription.findOne({
                user: userId,
                status: "created",
                plan: plan._id,
            }).sort({ createdAt: -1 });

            if (pendingSub) {
                const age = dayjs().diff(dayjs(pendingSub.createdAt), "minute");

                if (age < 30) {
                    let existingPayment = await Payment.findOne({
                        razorpaySubscriptionId: pendingSub.razorpaySubscriptionId,
                        status: "created",
                    }).sort({ createdAt: -1 });

                    // If no payment record exists for this pending sub, create one
                    if (!existingPayment) {
                        existingPayment = await Payment.create({
                            user: userId,
                            type: "membership",
                            subscription: pendingSub._id,
                            razorpaySubscriptionId: pendingSub.razorpaySubscriptionId,
                            amount: Math.round(plan.price * 100),
                            status: "created",
                            receipt: `sub_${Date.now()}`,
                        });
                    }

                    return res.json({
                        success: true,
                        subscriptionId: pendingSub.razorpaySubscriptionId,
                        paymentId: existingPayment._id,   // ← never null now
                        amount: Math.round(plan.price * 100),
                        currency: "INR",
                        key: process.env.RAZORPAY_KEY_ID,
                    });
                }

                // Too old — cancel it and start fresh
                try {
                    await razorpay.subscriptions.cancel(pendingSub.razorpaySubscriptionId);
                } catch (_) { /* already cancelled on Razorpay side — safe to ignore */ }

                pendingSub.status = "cancelled";
                pendingSub.cancelledAt = dayjs().toDate();
                await pendingSub.save();
            }

            // Create fresh Razorpay subscription
            const rzSub = await razorpay.subscriptions.create({
                plan_id: plan.razorpayPlanId,
                total_count: 120,
            });

            const newSub = await Subscription.create({
                user: userId,
                plan: plan._id,
                razorpaySubscriptionId: rzSub.id,
                status: "created",
            });

            const payment = await Payment.create({
                user: userId,
                type: "membership",
                subscription: newSub._id,          // ← always set
                razorpaySubscriptionId: rzSub.id,   // ← always set
                amount: Math.round(plan.price * 100),
                status: "created",
                receipt: `sub_${Date.now()}`,
            });

            return res.json({
                success: true,
                subscriptionId: rzSub.id,
                paymentId: payment._id,
                amount: payment.amount,
                currency: "INR",
                key: process.env.RAZORPAY_KEY_ID,
            });
        }

        return res.status(400).json({ message: "Invalid payment type" });
    } catch (err) {
        console.error("[joinMembership]", err);
        res.status(500).json({ message: "Create failed" });
    }
};

/* ─────────────────────────────────────────────
   VERIFY (called from frontend after checkout)
───────────────────────────────────────────────*/
export const verifyMembership = async (req, res) => {
    try {
        const {
            paymentId,
            razorpayOrderId,
            razorpay_subscription_id,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body;

        /* ── 1. Find Payment record ── */
        let payment = null;

        if (paymentId) {
            payment = await Payment.findById(paymentId);
        }

        // Fallback: look up by subscription id
        if (!payment && razorpay_subscription_id) {
            payment = await Payment.findOne({
                razorpaySubscriptionId: razorpay_subscription_id,
            }).sort({ createdAt: -1 });
        }

        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        /* ── 2. Already verified? ── */
        if (payment.status === "paid") {
            return res.json({ success: true, message: "Already verified" });
        }

        /* ── 3. Signature verification ──
           NOTE: We intentionally skip the 30-minute expiry check here.
           Razorpay subscription checkouts can be slow; expiry is handled
           by the webhook for production reliability. */
        let signatureBody = "";

        if (payment.type === "donate") {
            signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`;
        } else if (payment.type === "membership") {
            // Razorpay signs: razorpay_payment_id + "|" + razorpay_subscription_id
            signatureBody = `${razorpayPaymentId}|${razorpay_subscription_id}`;
        }

        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(signatureBody)
            .digest("hex");

        if (expected !== razorpaySignature) {
            payment.status = "failed";
            await payment.save();
            return res.status(400).json({ message: "Signature verification failed" });
        }

        /* ── 4. Mark payment paid ── */
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        // Store subscription id if it wasn't saved yet (edge-case reuse path)
        if (!payment.razorpaySubscriptionId && razorpay_subscription_id) {
            payment.razorpaySubscriptionId = razorpay_subscription_id;
        }
        payment.status = "paid";
        await payment.save();

        /* ── 5. Activate subscription (membership only) ── */
        if (payment.type === "membership") {
            // Ensure subscription reference exists
            let subId = payment.subscription;

            if (!subId && razorpay_subscription_id) {
                const sub = await Subscription.findOne({
                    razorpaySubscriptionId: razorpay_subscription_id,
                });
                subId = sub?._id;
                if (subId) {
                    payment.subscription = subId;
                    await payment.save();
                }
            }

            if (!subId) {
                return res.status(404).json({ message: "Subscription record not found" });
            }

            const subscription = await Subscription.findById(subId).populate("plan");
            if (!subscription) {
                return res.status(404).json({ message: "Subscription not found" });
            }

            await activateSubscription(subscription);

            return res.json({ success: true, message: "Subscription activated" });
        }

        return res.json({ success: true, message: "Payment successful" });
    } catch (err) {
        console.error("[verifyMembership]", err);
        res.status(500).json({ message: "Verification failed" });
    }
};

/* ─────────────────────────────────────────────
   WEBHOOK  (Razorpay → your server)
   Route: POST /api/payments/webhook
   Add this URL in Razorpay Dashboard → Webhooks
   Secret: RAZORPAY_WEBHOOK_SECRET env var
───────────────────────────────────────────────*/
export const razorpayWebhook = async (req, res) => {
    try {
        /* ── Verify webhook signature ── */
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const receivedSignature = req.headers["x-razorpay-signature"];

        // req.body must be the raw Buffer — use express.raw() on this route
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body) // raw buffer
            .digest("hex");

        if (expectedSignature !== receivedSignature) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }

        const event = JSON.parse(req.body.toString());
        const { event: eventName, payload } = event;

        console.log("[Webhook]", eventName);

        /* ════════════════════════════════════════
           subscription.charged
           Fires every time Razorpay successfully
           collects a recurring payment.
        ════════════════════════════════════════ */
        if (eventName === "subscription.charged") {
            const rzPayment = payload.payment?.entity;
            const rzSub = payload.subscription?.entity;

            if (!rzSub?.id) return res.json({ received: true });

            // Find our Subscription document
            const subscription = await Subscription.findOne({
                razorpaySubscriptionId: rzSub.id,
            }).populate("plan");

            if (!subscription) {
                console.warn("[Webhook] Subscription not found:", rzSub.id);
                return res.json({ received: true });
            }

            // Find or create a Payment record for this charge
            let payment = await Payment.findOne({
                razorpayPaymentId: rzPayment.id,
            });

            if (!payment) {
                payment = await Payment.create({
                    user: subscription.user,
                    type: "membership",
                    subscription: subscription._id,
                    razorpaySubscriptionId: rzSub.id,
                    razorpayPaymentId: rzPayment.id,
                    amount: rzPayment.amount,
                    currency: rzPayment.currency || "INR",
                    status: "paid",
                    receipt: `webhook_${Date.now()}`,
                });
            } else if (payment.status !== "paid") {
                payment.status = "paid";
                payment.razorpayPaymentId = rzPayment.id;
                await payment.save();
            }

            // Activate / renew subscription dates
            await activateSubscription(subscription);

            return res.json({ received: true });
        }

        /* ════════════════════════════════════════
           subscription.activated
           Fires when Razorpay activates a new sub.
        ════════════════════════════════════════ */
        if (eventName === "subscription.activated") {
            const rzSub = payload.subscription?.entity;
            if (!rzSub?.id) return res.json({ received: true });

            const subscription = await Subscription.findOne({
                razorpaySubscriptionId: rzSub.id,
            }).populate("plan");

            if (subscription && subscription.status !== "active") {
                await activateSubscription(subscription);
            }

            return res.json({ received: true });
        }

        /* ════════════════════════════════════════
           subscription.cancelled
        ════════════════════════════════════════ */
        if (eventName === "subscription.cancelled") {
            const rzSub = payload.subscription?.entity;
            if (!rzSub?.id) return res.json({ received: true });

            await Subscription.findOneAndUpdate(
                { razorpaySubscriptionId: rzSub.id },
                { status: "cancelled", cancelledAt: dayjs().toDate() }
            );

            return res.json({ received: true });
        }

        /* ════════════════════════════════════════
           subscription.completed
        ════════════════════════════════════════ */
        if (eventName === "subscription.completed") {
            const rzSub = payload.subscription?.entity;
            if (!rzSub?.id) return res.json({ received: true });

            await Subscription.findOneAndUpdate(
                { razorpaySubscriptionId: rzSub.id },
                { status: "expired" }
            );

            return res.json({ received: true });
        }

        /* ════════════════════════════════════════
           payment.failed
        ════════════════════════════════════════ */
        if (eventName === "payment.failed") {
            const rzPayment = payload.payment?.entity;
            if (!rzPayment?.id) return res.json({ received: true });

            // Mark the payment as failed if it exists
            await Payment.findOneAndUpdate(
                { razorpayPaymentId: rzPayment.id },
                { status: "failed" }
            );

            return res.json({ received: true });
        }

        // Unknown event — still return 200 so Razorpay doesn't retry
        return res.json({ received: true });
    } catch (err) {
        console.error("[razorpayWebhook]", err);
        // Return 200 anyway to prevent Razorpay from retrying indefinitely
        res.status(200).json({ received: true, error: err.message });
    }
};

export const getMySubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id })
            .populate("plan", "name price billingPeriod billingLabel badge features accentColor")
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, subscriptions });
    } catch (err) {
        console.error("getMySubscriptions:", err);
        res.status(500).json({ success: false, message: "Failed to fetch subscriptions" });
    }
};

/* ─────────────────────────────────────────────────────────
   GET /subscriptions/my-subscriptions/active
   Returns only the current active subscription
───────────────────────────────────────────────────────── */
export const getMyActiveSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
        })
            .populate("plan", "name price billingPeriod billingLabel badge features accentColor")
            .lean();

        res.json({ success: true, subscription });
    } catch (err) {
        console.error("getMyActiveSubscription:", err);
        res.status(500).json({ success: false, message: "Failed to fetch active subscription" });
    }
};

/* ─────────────────────────────────────────────────────────
   POST /subscriptions/:id/cancel
   Cancel a subscription via Razorpay + mark in DB
   - Only the owner can cancel
   - Only active subscriptions can be cancelled
───────────────────────────────────────────────────────── */
export const cancelSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        const sub = await Subscription.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!sub) {
            return res.status(404).json({ success: false, message: "Subscription not found" });
        }

        if (sub.status !== "active") {
            return res.status(400).json({
                success: false,
                message: `Subscription cannot be cancelled (current status: ${sub.status})`,
            });
        }

        // Cancel on Razorpay
        // cancel_at_cycle_end: 1 → user keeps access until period ends
        try {
            await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, {
                cancel_at_cycle_end: 1,
            });
        } catch (rzpErr) {
            console.error("Razorpay cancel error:", rzpErr);
            return res.status(502).json({
                success: false,
                message: "Failed to cancel with payment provider",
            });
        }

        // Update in DB
        sub.status = "cancelled";
        sub.cancelledAt = new Date();
        sub.isAutoRenew = false;
        await sub.save();

        res.json({ success: true, message: "Subscription cancelled successfully" });
    } catch (err) {
        console.error("cancelSubscription:", err);
        res.status(500).json({ success: false, message: "Failed to cancel subscription" });
    }
};



// donation
export const createDonation = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            amount,
            purpose,
            message,
            mode = "online",
        } = req.body;

        const userId = req.user?._id || null;

        if (!fullName || !email || !amount) {
            return res.status(400).json({
                success: false,
                message: "Full name, email and amount required",
            });
        }

        const donateAmount = Number(amount);

        if (isNaN(donateAmount) || donateAmount < 1) {
            return res.status(400).json({
                success: false,
                message: "Minimum donation amount ₹1",
            });
        }

        let documents = [];

        if (req.files?.documents) {
            const files = Array.isArray(req.files.documents)
                ? req.files.documents
                : [req.files.documents];

            for (const file of files) {
                const result = await uploadImageToGlobal(file, "donation");

                documents.push({
                    url: result.secure_url || result.url,
                    publicId: result.public_id,
                    fileName: file.name,
                    fileType: file.mimetype,
                    fileSize: file.size,
                });
            }
        }
        /* ================= OFFLINE ================= */
        if (mode === "offline") {
            const donation = await Donation.create({
                user: userId,
                fullName,
                email,
                phone,
                amount: donateAmount,
                purpose,
                message,
                mode: "offline",
                status: "pending",
                documents,

            });

            return res.status(201).json({
                success: true,
                mode: "offline",
                donation,
            });
        }

        /* ================= ONLINE ================= */
        const amountInPaise = Math.round(donateAmount * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `donation_${Date.now()}`,
        });

        /* 🔥 PAYMENT */
        const payment = await Payment.create({
            user: userId,
            type: "donate",
            subscription: null, // ✅ FIXED
            razorpayOrderId: order.id,
            amount: amountInPaise,
            currency: "INR",
            status: "created",
            notes: purpose || "",
            receipt: order.receipt,
        });

        /* 🔥 DONATION */
        const donation = await Donation.create({
            user: userId,
            payment: payment._id,
            fullName,
            email,
            phone,
            amount: donateAmount,
            purpose,
            message,
            mode: "online",
            status: "created",
        });

        return res.status(201).json({
            success: true,
            mode: "online",
            key: process.env.RAZORPAY_KEY_ID,
            donationId: donation._id,
            paymentId: payment._id,
            orderId: order.id,
            amount: amountInPaise,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Unable to create donation" });
    }
};

export const verifyDonation = async (req, res) => {
    try {
        const {
            donationId,
            paymentId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const donation = await Donation.findById(donationId);
        let payment = await Payment.findById(paymentId);

        if (!donation || !payment) {
            return res.status(404).json({
                success: false,
                message: "Donation record not found",
            });
        }

        /* 🔥 EXPIRE OLD */
        const expired =
            dayjs().diff(dayjs(payment.createdAt), "minute") > 30;

        if (expired && payment.status === "created") {
            payment.status = "failed";
            donation.status = "failed";

            await payment.save();
            await donation.save();

            return res.status(400).json({
                message: "Payment expired",
            });
        }

        /* already paid */
        if (payment.status === "paid") {
            return res.json({ success: true });
        }

        /* 🔥 VERIFY SIGNATURE */
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expected !== razorpay_signature) {
            payment.status = "failed";
            donation.status = "failed";

            await payment.save();
            await donation.save();

            return res.status(400).json({
                message: "Verification failed",
            });
        }

        /* 🔥 SUCCESS */
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = "paid";

        await payment.save();

        donation.status = "paid";
        donation.paidAt = dayjs().toDate();

        await donation.save();

        return res.json({
            success: true,
            message: "Donation successful",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Verification failed",
        });
    }
};

export const getMyDonations = async (req, res) => {
    try {
        const userId = req.user._id;

        const donations = await Donation.find({
            user: userId,
        })
            .populate({
                path: "payment",
                select:
                    "type amount currency status razorpayOrderId razorpayPaymentId receipt createdAt",
            })
            .sort({ createdAt: -1 })
            .lean();

        const formattedDonations = donations.map((item) => ({
            _id: item._id,
            fullName: item.fullName,
            email: item.email,
            phone: item.phone,
            mode: item.mode,
            amount: item.amount,
            currency: item.currency,
            purpose: item.purpose,
            message: item.message,
            notes: item.notes,
            offlineReference: item.offlineReference,
            status: item.status,
            paidAt: item.paidAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,

            payment: item.payment
                ? {
                    _id: item.payment._id,
                    type: item.payment.type,
                    amount: item.payment.amount,
                    amountInRupees:
                        item.payment.amount / 100,
                    currency: item.payment.currency,
                    status: item.payment.status,
                    razorpayOrderId:
                        item.payment.razorpayOrderId,
                    razorpayPaymentId:
                        item.payment.razorpayPaymentId,
                    receipt: item.payment.receipt,
                    createdAt: item.payment.createdAt,
                }
                : null,
        }));

        return res.status(200).json({
            success: true,
            count: formattedDonations.length,
            donations: formattedDonations,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch donations",
        });
    }
};

// payments 
export const getMyPayments = async (req, res) => {
    try {
        const userId = req.user._id;

        const payments = await Payment.find({ user: userId })
            .populate({
                path: "subscription",
                select: "plan status startDate endDate",
                populate: {
                    path: "plan",
                    select: "name price billingPeriod",
                },
            })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: payments.length,
            payments,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch donations",
        });
    }
};



// contact
export const submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, queryType, message } = req.body;

        const contact = await Contact.create({
            name,
            email: email || null,
            phone,
            subject,
            queryType,
            message,
            activityLog: [
                {
                    action: "created",
                    byName: name,
                    detail: `New contact submitted — type: ${queryType}`,
                    at: new Date(),
                },
            ],
        });

        return res.status(201).json({
            success: true,
            message: "Your message has been received. We'll get back to you soon.",
            contactId: contact._id,
        });
    } catch (err) {
        // Mongoose validation errors
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        console.error("submitContact error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};












cron.schedule("*/10 * * * *", async () => {
    const expiredPayments = await Payment.find({
        status: "created",
        createdAt: { $lt: dayjs().subtract(30, "minute").toDate() },
    });

    for (const p of expiredPayments) {
        p.status = "failed";
        await p.save();

        await Subscription.findByIdAndUpdate(p.subscription, {
            status: "failed",
        });

        try {
            await razorpay.subscriptions.cancel(p.razorpaySubscriptionId);
        } catch (_) { }
    }
});