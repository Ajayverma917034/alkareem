import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import Input from "../common/Input";
import AuthCard from "../common/AuthCard";
import Btn from "../common/Btn";

export const VerifyOtpPage = () => {
    const { sendOtp, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const handleChange = (i, val) => {
        if (!/^\d?$/.test(val)) return;

        const next = [...otp];
        next[i] = val;
        setOtp(next);

        if (val && i < 5) {
            document.getElementById(`otp-${i + 1}`)?.focus();
        }
    };

    const handleKeyDown = (i, e) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) {
            document.getElementById(`otp-${i - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (p.length === 6) setOtp(p.split(""));
        e.preventDefault();
    };

    const handleSend = async () => {
        setSending(true);

        const r = await sendOtp();

        if (r.success) {
            toast.success(r.message || "OTP sent successfully");
        } else {
            toast.error(r.message || "Failed to send OTP");
        }

        setSending(false);
    };

    const handleVerify = async () => {
        const otpStr = otp.join("");

        if (otpStr.length < 6) {
            toast.error("Enter the full 6-digit OTP");
            return;
        }

        setLoading(true);

        const r = await verifyOtp(otpStr);

        if (r.success) {
            toast.success(r.message || "Email verified!");

            // optional redirect
            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } else {
            toast.error(r.message || "Invalid OTP");
        }

        setLoading(false);
    };

    return (
        <AuthCard
            title="Verify your email"
            subtitle="Enter the 6-digit code we sent you"
        >
            {/* OTP Inputs */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 28 }}>
                {otp.map((digit, i) => (
                    <Input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        style={{
                            width: 46,
                            height: 54,
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: 700,
                            background: "#0A1628",
                            border: `2px solid ${digit ? "#3B82F6" : "#1E293B"}`,
                            borderRadius: 10,
                            color: "#F1F5F9",
                            outline: "none",
                            caretColor: "#3B82F6",
                            transition: "border-color 0.15s",
                        }}
                    />
                ))}
            </div>

            <Btn loading={loading} onClick={handleVerify}>
                Verify Email
            </Btn>

            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748B" }}>
                Didn't receive it?{" "}
                <button onClick={handleSend}>
                    {sending ? "Sending…" : "Send OTP"}
                </button>
            </div>

            {/* ✅ Link instead of navigate */}
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 13 }}>
                <Link to="/login">
                    ← Back to login
                </Link>
            </div>
        </AuthCard>
    );
};