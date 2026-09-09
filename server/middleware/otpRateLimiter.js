import rateLimit from "express-rate-limit";
import {
    OTP_IP_SEND_MAX_PER_HOUR,
    OTP_IP_VERIFY_MAX_PER_15MIN,
} from "../utils/otpConfig.js";

// Why this exists in ADDITION to the per-phone limits in user.schema.js:
// the per-phone counters can't stop one attacker from cycling through many
// DIFFERENT phone numbers from the same machine/network (number enumeration,
// SMS-bombing other people's numbers, brute-forcing OTPs across accounts).
// This middleware caps requests per IP address regardless of which phone
// number is targeted.
//
// NOTE: the default store is in-memory (per Node process). That's fine for
// a single instance. If you run this behind PM2 cluster mode, multiple
// containers, or a load balancer with several instances, counts will NOT be
// shared across processes — swap in a shared store such as
// `rate-limit-redis` so the limit is enforced globally instead of per-process.

export const sendOtpIpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: OTP_IP_SEND_MAX_PER_HOUR,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP requests from this network. Please try again later.",
    },
});

export const verifyOtpIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: OTP_IP_VERIFY_MAX_PER_15MIN,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many verification attempts from this network. Please try again later.",
    },
});
