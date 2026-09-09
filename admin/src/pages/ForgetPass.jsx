import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../common/AuthCard";
import Input from "../common/Input";
import Btn from "../common/Btn";
import EyeIcon from "../common/EyeButton";

export const ForgotPasswordPage = () => {
    const { sendResetOtp, resetPassword } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email) {
            toast.error("Enter your email");
            return;
        }

        setLoading(true);

        const r = await sendResetOtp(email);

        if (r.success) {
            toast.success(r.message || "OTP sent successfully");
            setStep(2);
        } else {
            toast.error(r.message || "Failed to send OTP");
        }

        setLoading(false);
    };

    const handleReset = async () => {
        if (!otp || !newPassword) {
            toast.error("Fill in all fields");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        const r = await resetPassword({ email, otp, newPassword });

        if (r.success) {
            toast.success("Password reset! Redirecting…");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } else {
            toast.error(r.message || "Reset failed");
        }

        setLoading(false);
    };

    return (
        <AuthCard
            title={step === 1 ? "Reset your password" : "Enter new password"}
            subtitle={step === 1 ? "We'll send a code to your email" : "Use the OTP sent to your inbox"}
        >
            {/* Progress bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
                {[1, 2].map(s => (
                    <div
                        key={s}
                        style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 99,
                            background: s <= step ? "#3B82F6" : "#1E293B",
                            transition: "background 0.3s",
                        }}
                    />
                ))}
            </div>

            {step === 1 ? (
                <>
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />

                    <Btn loading={loading} onClick={handleSendOtp}>
                        Send OTP
                    </Btn>
                </>
            ) : (
                <>
                    <Input
                        label="OTP Code"
                        value={otp}
                        onChange={e =>
                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="6-digit code"
                    />

                    <Input
                        label="New Password"
                        type={showPass ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        rightEl={
                            <span onClick={() => setShowPass(p => !p)}>
                                <EyeIcon open={showPass} />
                            </span>
                        }
                    />

                    <Btn loading={loading} onClick={handleReset}>
                        Reset Password
                    </Btn>
                </>
            )}

            <div style={{ textAlign: "center", marginTop: 18, fontSize: 13 }}>
                <Link to="/login" className="text-white">
                    ← Back to login
                </Link>
            </div>
        </AuthCard>
    );
};