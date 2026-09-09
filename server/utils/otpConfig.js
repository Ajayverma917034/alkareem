// ==============================
// OTP CONFIG
// ==============================
// Everything about "how OTP behaves" lives here so it's controlled entirely
// by env vars and never hardcoded in controllers/schema again.
//
// OTP_MODE (process.env.OTP_MODE):
//   "prod" (default) -> real random OTP, real SMS sent via the gateway,
//                        strict verification against the stored hash.
//   "dev"             -> real random OTP generated, but SMS is NOT sent
//                        (saves SMS credits while building). The OTP is
//                        logged to the server console and echoed back in
//                        the API response so you can log in without a
//                        working SMS gateway.
//   "test"            -> OTP is always OTP_STATIC_CODE (default "123456")
//                        for every phone number. SMS is NOT sent. Meant for
//                        QA / App Store & Play Store reviewers / automated
//                        e2e tests where you don't want to depend on real
//                        phones receiving real SMS.
//
// IMPORTANT: Always set OTP_MODE=prod on your production server. "dev" and
// "test" intentionally weaken security and must never run in prod.

export const OTP_MODE = (process.env.OTP_MODE || "prod").toLowerCase();

export const isProdMode = OTP_MODE === "prod";
export const isDevMode = OTP_MODE === "dev";
export const isTestMode = OTP_MODE === "test";

if (!["prod", "dev", "test"].includes(OTP_MODE)) {
    console.warn(
        `[otpConfig] Unrecognized OTP_MODE="${process.env.OTP_MODE}". Falling back to "prod" behaviour.`
    );
}

// Fixed code used only when OTP_MODE=test
export const OTP_STATIC_CODE = process.env.OTP_STATIC_CODE || "123456";

// Core OTP shape
export const OTP_LENGTH = Number(process.env.OTP_LENGTH || 6);
export const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);
export const OTP_RESEND_COOLDOWN_SECONDS = Number(
    process.env.OTP_RESEND_COOLDOWN_SECONDS || 30
);

// Abuse / rate-limit controls (per phone number, enforced in schema methods)
export const OTP_MAX_PER_HOUR = Number(process.env.OTP_MAX_PER_HOUR || 5);
export const OTP_MAX_PER_DAY = Number(process.env.OTP_MAX_PER_DAY || 10);
export const OTP_MAX_VERIFY_ATTEMPTS = Number(
    process.env.OTP_MAX_VERIFY_ATTEMPTS || 5
);
export const OTP_ABUSE_BLOCK_MINUTES = Number(
    process.env.OTP_ABUSE_BLOCK_MINUTES || 60
);

// Per-IP controls (enforced in middleware/otpRateLimiter.js)
export const OTP_IP_SEND_MAX_PER_HOUR = Number(
    process.env.OTP_IP_SEND_MAX_PER_HOUR || 20
);
export const OTP_IP_VERIFY_MAX_PER_15MIN = Number(
    process.env.OTP_IP_VERIFY_MAX_PER_15MIN || 30
);

/**
 * Generates the OTP to issue for this send.
 * In "test" mode this is always OTP_STATIC_CODE so QA/reviewers have a
 * predictable code. In "dev"/"prod" it's a real random N-digit code.
 */
export const generateOtp = () => {
    if (isTestMode) return OTP_STATIC_CODE;

    const min = 10 ** (OTP_LENGTH - 1);
    const span = 9 * min; // keeps the leading digit non-zero
    return Math.floor(min + Math.random() * span).toString();
};
