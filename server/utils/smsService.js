import axios from "axios";

const SMS_BASE_URL = process.env.SMS_BASE_URL || "https://pgapi.smartping.ai";
const SMS_USERNAME = process.env.SMS_USERNAME;
const SMS_PASSWORD = process.env.SMS_PASSWORD;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID; // "AKTEAW"
const SMS_DLT_CONTENT_ID = process.env.SMS_DLT_CONTENT_ID; // update this to the new template's DLT content id

console.log("[smsService] SMS config:", {
    SMS_BASE_URL,
    SMS_USERNAME: SMS_USERNAME ? "SET" : "MISSING",
    SMS_PASSWORD: SMS_PASSWORD ? "SET" : "MISSING",
    SMS_SENDER_ID,
    SMS_DLT_CONTENT_ID,
});

/**
 * Builds the OTP SMS text to EXACTLY match the approved DLT template:
 * "Your OTP is {#var#}. It is valid for 5 minutes. Do not share this OTP
 *  with anyone. - AL-KAREEM TARBIYAT EDUCATIONAL AND WELFARE TRUST"
 */
const buildOtpText = (otp) =>
    `Your OTP is ${otp}. It is valid for 5 minutes. Do not share this OTP with anyone. - AL-KAREEM TARBIYAT EDUCATIONAL AND WELFARE TRUST`;

/**
 * Sends an OTP SMS via the gateway's GET-based /fe/api/v1/send API using the
 * approved AL-KAREEM DLT template (Template Id from env, Header from env).
 *
 * @param {string} mobile - recipient number with country code, e.g. "919876543210"
 * @param {string} otp - the OTP code to embed in the template
 * @returns {Promise<{success: boolean, raw?: object|string, error?: string}>}
 */
export const sendOtpSms = async (mobile, otp) => {
    if (!SMS_USERNAME || !SMS_PASSWORD || !SMS_SENDER_ID || !SMS_DLT_CONTENT_ID) {
        console.error("[smsService] Missing SMS env vars — check .env");
        return { success: false, error: "SMS gateway not configured" };
    }

    const text = buildOtpText(otp);

    try {
        const { data } = await axios.get(`${SMS_BASE_URL}/fe/api/v1/send`, {
            params: {
                username: SMS_USERNAME,
                password: SMS_PASSWORD,
                unicode: false,
                from: SMS_SENDER_ID,
                to: mobile,
                text,
                dltContentId: SMS_DLT_CONTENT_ID,
            },
            timeout: 10000,
        });

        if (data?.statusCode && data.statusCode !== 200) {
            console.error("[smsService] Gateway error:", data);
            return { success: false, error: data.description || "SMS gateway error", raw: data };
        }

        return { success: true, raw: data };
    } catch (error) {
        console.error("[smsService] Send failed:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.description || error.message };
    }
};