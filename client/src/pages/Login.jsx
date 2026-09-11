// src/pages/Login.jsx
// Install dependency: npm i sonner

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, CheckCircle2, ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// ─── Config ─────────────────────────────────────────────────────────────────
// Keep this in sync with the backend's OTP_LENGTH (default 6).
const OTP_LENGTH = 6;
// Fallback only — the real cooldown comes back from the API as `resendIn`,
// which reflects OTP_RESEND_COOLDOWN_SECONDS on the server. This value is
// only used if that field is ever missing from the response.
const DEFAULT_RESEND_SECONDS = 30;

const validIndianMobile = (digits) => /^[6-9]\d{9}$/.test(digits);

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({ length = OTP_LENGTH, value, onChange, onComplete, disabled, invalid }) {
    const inputRefs = useRef([]);
    const digits = Array.from({ length }, (_, i) => value[i] || '');

    const focusInput = (i) => inputRefs.current[i]?.focus();

    const setDigitAt = (i, char, { advance = true } = {}) => {
        const chars = value.padEnd(length, '\u0000').split('');
        chars[i] = char || '\u0000';
        const next = chars.join('').replace(/\u0000/g, '');
        onChange(next);
        if (char && advance && i < length - 1) focusInput(i + 1);
        if (next.length === length) onComplete?.(next);
    };

    const handleChange = (e, i) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (!raw) return;
        setDigitAt(i, raw[raw.length - 1]);
    };

    const handleKeyDown = (e, i) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (digits[i]) {
                setDigitAt(i, '', { advance: false });
            } else if (i > 0) {
                focusInput(i - 1);
                setDigitAt(i - 1, '', { advance: false });
            }
        } else if (e.key === 'ArrowLeft' && i > 0) {
            focusInput(i - 1);
        } else if (e.key === 'ArrowRight' && i < length - 1) {
            focusInput(i + 1);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (!pasted) return;
        onChange(pasted);
        focusInput(Math.min(pasted.length, length - 1));
        if (pasted.length === length) onComplete?.(pasted);
    };

    return (
        <div className={['flex gap-2 justify-center', invalid ? 'animate-otp-shake' : ''].join(' ')}>
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    aria-label={`OTP digit ${i + 1} of ${length}`}
                    value={d}
                    disabled={disabled}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    className={[
                        'w-11 h-14 text-center text-xl font-bold rounded-xl border-2',
                        'outline-none transition-all duration-150',
                        disabled ? 'cursor-not-allowed opacity-50' : '',
                        invalid
                            ? 'border-red-400 bg-red-50 text-red-600'
                            : d
                                ? 'border-(--primary) bg-(--primary)/5 text-(--primary)'
                                : 'border-gray-200 bg-white text-gray-900 focus:border-(--primary) focus:bg-(--primary)/5 focus:ring-4 focus:ring-(--primary)/10',
                    ].join(' ')}
                />
            ))}
        </div>
    );
}

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown() {
    const [remaining, setRemaining] = useState(0);
    const start = useCallback((seconds) => setRemaining(seconds), []);
    useEffect(() => {
        if (remaining <= 0) return;
        const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
        return () => clearTimeout(id);
    }, [remaining]);
    return { remaining, start, isRunning: remaining > 0 };
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function Spinner({ className = 'w-5 h-5 text-white' }) {
    return <Loader2 className={[className, 'animate-spin'].join(' ')} />;
}

// ─── Step indicator ─────────────────────────────────────────────────────────
function StepTrack({ step }) {
    return (
        <div className="flex gap-1.5 justify-center" aria-hidden="true">
            <div className="w-8 h-1 rounded-full bg-(--primary)" />
            <div className={['w-8 h-1 rounded-full transition-colors duration-300', step === 'otp' ? 'bg-(--primary)' : 'bg-gray-200'].join(' ')} />
        </div>
    );
}

// ─── Inline status banner (lockouts / attempts remaining) ───────────────────
function StatusBanner({ message }) {
    if (!message) return null;
    return (
        <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800"
        >
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message}</span>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Login() {
    const navigate = useNavigate();
    const { remaining, start: startCountdown, isRunning } = useCountdown();

    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [otp, setOtp] = useState('');
    const [otpInvalid, setOtpInvalid] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [devOtp, setDevOtp] = useState(null); // only populated when the API is running in dev/test mode
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const otpSubmitLock = useRef(false);

    const formatPhone = (raw) => {
        const d = raw.replace(/\D/g, '').slice(0, 10);
        if (d.length <= 5) return d;
        return `${d.slice(0, 5)} ${d.slice(5)}`;
    };

    // Reset per-attempt UI state whenever the user starts a fresh OTP entry
    useEffect(() => {
        if (step === 'otp') otpSubmitLock.current = false;
    }, [step]);

    // WebOTP: on supporting Android browsers, auto-fills the code the moment
    // the SMS arrives, no typing needed. Requires the SMS text to end with
    // an app-hash binding line (e.g. "#<hash>") — coordinate with backend/
    // SMS template if you want this to actually trigger; it fails silently
    // everywhere else (iOS, desktop, unsupported browsers).
    useEffect(() => {
        if (step !== 'otp' || !('OTPCredential' in window)) return;
        const ac = new AbortController();
        navigator.credentials
            .get({ otp: { transport: ['sms'] }, signal: ac.signal })
            .then((cred) => {
                if (cred?.code) {
                    const digits = cred.code.replace(/\D/g, '').slice(0, OTP_LENGTH);
                    setOtp(digits);
                    if (digits.length === OTP_LENGTH) handleVerifyOtp(null, digits);
                }
            })
            .catch(() => { });
        return () => ac.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        const cleaned = phone.replace(/\D/g, '');

        if (!cleaned) {
            setPhoneError('Please enter your mobile number.');
            return;
        }
        if (cleaned.length !== 10 || !validIndianMobile(cleaned)) {
            setPhoneError('Enter a valid 10-digit mobile number.');
            return;
        }

        setPhoneError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/send-otp', { phone: cleaned });
            toast.success(`OTP sent to +91 ${formatPhone(cleaned)}`);
            setStep('otp');
            setOtp('');
            setOtpInvalid(false);
            setStatusMessage('');
            setDevOtp(data?.otp ? { code: data.otp, mode: data.mode } : null);
            startCountdown(data?.resendIn || DEFAULT_RESEND_SECONDS);
        } catch (err) {
            const message = err?.response?.data?.message || err.userMessage || 'Failed to send OTP. Please try again.';
            if (err?.response?.status === 429) {
                setStatusMessage(message);
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e, codeOverride) => {
        e?.preventDefault();
        const cleaned = (codeOverride ?? otp).replace(/\D/g, '');
        if (cleaned.length !== OTP_LENGTH) {
            toast.error(`Please enter all ${OTP_LENGTH} digits.`);
            return;
        }

        setLoading(true);
        setStatusMessage('');
        try {
            const { data } = await api.post('/auth/verify-otp', {
                phone: phone.replace(/\D/g, ''),
                otp: cleaned,
            });
            login(data.user);
            toast.success('Login successful! Redirecting…');
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            const body = err?.response?.data;
            const message = body?.message || err.userMessage || 'Invalid or expired OTP. Please try again.';

            setOtpInvalid(true);
            setOtp('');
            otpSubmitLock.current = false;
            setTimeout(() => setOtpInvalid(false), 500);

            if (body?.blocked) {
                setStatusMessage(message);
            } else if (typeof body?.attemptsLeft === 'number') {
                setStatusMessage(
                    body.attemptsLeft > 0
                        ? `Incorrect code — ${body.attemptsLeft} attempt${body.attemptsLeft === 1 ? '' : 's'} left.`
                        : message
                );
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpComplete = useCallback(
        (code) => {
            if (otpSubmitLock.current || loading) return;
            otpSubmitLock.current = true;
            handleVerifyOtp(null, code);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [loading, phone]
    );

    const handleResend = async () => {
        if (isRunning || loading) return;
        setOtp('');
        setOtpInvalid(false);
        await handleSendOtp();
    };

    const phoneValid = validIndianMobile(phone.replace(/\D/g, ''));

    return (
        <>
            <style>{`
                @keyframes otp-shake {
                    10%, 90% { transform: translateX(-1px); }
                    20%, 80% { transform: translateX(2px); }
                    30%, 50%, 70% { transform: translateX(-4px); }
                    40%, 60% { transform: translateX(4px); }
                }
                .animate-otp-shake { animation: otp-shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }

                @keyframes step-in {
                    from { opacity: 0; transform: translateX(12px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-step-in { animation: step-in 0.28s ease-out; }

                @media (prefers-reduced-motion: reduce) {
                    .animate-otp-shake, .animate-step-in { animation: none; }
                }
            `}</style>

            <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-white px-4 py-10">
                <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-xl px-4 sm:px-10 pb-11 pt-8">
                    <img src="/logo.png" className="w-auto h-20 mx-auto mb-8" alt="" />

                    {/* ── STEP 1: Phone ── */}
                    {step === 'phone' && (
                        <form onSubmit={handleSendOtp} className="space-y-5 animate-step-in" noValidate>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mobile Number
                                    <span className="text-red-400 ml-1">*</span>
                                </label>
                                <div
                                    className={[
                                        'flex items-center h-12 border-2 rounded-lg px-3 gap-2.5 bg-white transition-colors duration-150',
                                        phoneError ? 'border-red-300' : 'border-gray-200 focus-within:border-(--primary)',
                                    ].join(' ')}
                                >
                                    <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200 shrink-0 h-6">
                                        <span className="text-lg leading-none">🇮🇳</span>
                                        <span className="text-sm font-semibold text-gray-500">+91</span>
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        placeholder="98765 43210"
                                        autoComplete="tel-national"
                                        value={formatPhone(phone)}
                                        onChange={(e) => {
                                            setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                                            if (phoneError) setPhoneError('');
                                        }}
                                        autoFocus
                                        disabled={loading}
                                        aria-invalid={!!phoneError}
                                        className="flex-1 outline-none text-sm text-gray-900 bg-transparent placeholder-gray-300 tracking-wide disabled:cursor-not-allowed"
                                    />
                                    {phoneValid && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 max-sm:hidden" />}
                                </div>
                                <p className={['text-xs mt-1.5 ml-0.5', phoneError ? 'text-red-500' : 'text-gray-400'].join(' ')}>
                                    {phoneError || "We'll send a 6-digit OTP to this number."}
                                </p>
                            </div>

                            <StatusBanner message={statusMessage} />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-(--primary) hover:bg-(--primary)/90 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-(--primary)/20 disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? <Spinner /> : (<><span>Send OTP</span><ArrowRight size={16} /></>)}
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                By continuing, you agree to our{' '}
                                <a href="/terms" className="text-(--primary) underline underline-offset-2">Terms</a>
                                {' '}and{' '}
                                <a href="/privacy" className="text-(--primary) underline underline-offset-2">Privacy Policy</a>.
                            </p>
                        </form>
                    )}

                    {/* ── STEP 2: OTP ── */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5 animate-step-in" noValidate>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => { setStep('phone'); setOtp(''); setOtpInvalid(false); setStatusMessage(''); }}
                                    className="text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3 flex items-center gap-1 cursor-pointer"
                                >
                                    <ArrowLeft className="size-4" /> Change number
                                </button>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Enter OTP</h2>
                                <p className="text-sm text-gray-500">
                                    We sent a 6-digit code to{' '}
                                    <span className="font-semibold text-gray-700">+91 {formatPhone(phone)}</span>
                                </p>
                            </div>

                            {devOtp && (
                                <button
                                    type="button"
                                    onClick={() => setOtp(devOtp.code)}
                                    className="w-full text-left text-xs rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    {devOtp.mode} mode — tap to fill code <span className="font-mono font-semibold text-gray-700">{devOtp.code}</span>
                                </button>
                            )}

                            <div>
                                <OtpInput value={otp} onChange={setOtp} onComplete={handleOtpComplete} disabled={loading} invalid={otpInvalid} />
                                <p className="text-center text-xs text-gray-400 mt-2.5">
                                    Tip: You can paste the OTP directly
                                </p>
                            </div>

                            <StatusBanner message={statusMessage} />

                            <button
                                type="submit"
                                disabled={loading || otp.replace(/\D/g, '').length < OTP_LENGTH}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-(--primary) hover:bg-(--primary)/90 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-(--primary)/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Spinner /> : (<><span>Verify &amp; Login</span><CheckCircle2 size={16} /></>)}
                            </button>

                            <div className="text-center">
                                {isRunning ? (
                                    <p className="text-sm text-gray-400">
                                        Resend OTP in{' '}
                                        <span className="font-semibold text-(--primary) tabular-nums">
                                            00:{String(remaining).padStart(2, '0')}
                                        </span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary) hover:underline underline-offset-2 disabled:opacity-50 mx-auto cursor-pointer"
                                    >
                                        <RotateCcw size={13} /> Resend OTP
                                    </button>
                                )}
                            </div>

                            <StepTrack step={step} />
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}