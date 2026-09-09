// src/pages/Login.jsx
// Install dependency: npm i sonner

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, CheckCircle, ArrowLeft } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

// ─── OTP Input ────────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;

function OtpInput({ value, onChange, disabled }) {
    const inputRefs = useRef([]);
    const digits = value.padEnd(OTP_LENGTH, ' ').split('').slice(0, OTP_LENGTH);

    const handleChange = (e, idx) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (!raw) return;
        const char = raw[raw.length - 1];
        const next = [...digits];
        next[idx] = char;
        onChange(next.join('').replace(/ /g, ''));
        if (idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace') {
            const next = [...digits];
            if (next[idx] && next[idx] !== ' ') {
                next[idx] = ' ';
                onChange(next.join('').replace(/ /g, ''));
            } else if (idx > 0) {
                inputRefs.current[idx - 1]?.focus();
            }
        }
        if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus();
        if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        onChange(pasted.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).replace(/ /g, ''));
        const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[focusIdx]?.focus();
    };

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length: OTP_LENGTH }).map((_, idx) => {
                const filled = digits[idx] && digits[idx] !== ' ';
                return (
                    <input
                        key={idx}
                        ref={el => inputRefs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={filled ? digits[idx] : ''}
                        disabled={disabled}
                        onChange={e => handleChange(e, idx)}
                        onKeyDown={e => handleKeyDown(e, idx)}
                        onPaste={handlePaste}
                        className={[
                            'w-11 h-14 text-center text-xl font-bold rounded-xl border-2',
                            'outline-none transition-all duration-150',
                            disabled ? 'cursor-not-allowed opacity-50' : '',
                            filled
                                ? 'border-teal-600 bg-teal-50 text-teal-700'
                                : 'border-gray-200 bg-white text-gray-900 focus:border-teal-600 focus:bg-teal-50/30',
                        ].join(' ')}
                    />
                );
            })}
        </div>
    );
}

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(seconds) {
    const [remaining, setRemaining] = useState(0);
    const start = useCallback(() => setRemaining(seconds), [seconds]);
    useEffect(() => {
        if (remaining <= 0) return;
        const id = setTimeout(() => setRemaining(r => r - 1), 1000);
        return () => clearTimeout(id);
    }, [remaining]);
    return { remaining, start, isRunning: remaining > 0 };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const RESEND_SECONDS = 30;

export default function Login() {
    const navigate = useNavigate();
    const { remaining, start: startCountdown, isRunning } = useCountdown(RESEND_SECONDS);

    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const formatPhone = (raw) => {
        const d = raw.replace(/\D/g, '').slice(0, 10);
        if (d.length <= 5) return d;
        return `${d.slice(0, 5)} ${d.slice(5)}`;
    };

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned) { toast.error('Please enter your mobile number.'); return; }
        if (cleaned.length !== 10) { toast.error('Enter a valid 10-digit mobile number.'); return; }

        setLoading(true);
        try {
            await api.post('/auth/send-otp', { phone: cleaned });
            toast.success(`OTP sent to +91 ${formatPhone(cleaned)}`);
            setStep('otp');
            setOtp('');
            startCountdown();
        } catch (err) {
            toast.error(err.userMessage || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e?.preventDefault();
        const cleaned = otp.replace(/\D/g, '');
        if (cleaned.length !== OTP_LENGTH) {
            toast.error(`Please enter all ${OTP_LENGTH} digits.`);
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', {
                phone: phone.replace(/\D/g, ''),
                otp: cleaned,
            });
            login(data.user);
            toast.success('Login successful! Redirecting…');
            setTimeout(() => navigate('/'), 1200);
        } catch (err) {
            toast.error(err.userMessage || 'Invalid or expired OTP. Please try again.');
            setOtp('');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (isRunning) return;
        toast.info('Resending OTP…');
        await handleSendOtp();
    };

    const phoneValid = phone.replace(/\D/g, '').length === 10;

    return (
        <>

            <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-white px-4 py-10">
                <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-xl px-4 sm:px-10 pb-11 pt-8">

                    <img src='/logo.png' className='w-30 h-fit mx-auto mb-10' />


                    {/* ── STEP 1: Phone ── */}
                    {step === 'phone' && (
                        <form onSubmit={handleSendOtp} className="space-y-5">

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mobile Number
                                    <span className="text-red-400 mr-1"> *</span>
                                </label>
                                <div className="flex items-center h-12 border-2 border-gray-200 rounded-lg px-3 gap-2.5 bg-white focus-within:border-(--primary) transition-colors duration-150">
                                    <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200 shrink-0 h-6">
                                        <span className="text-lg leading-none">🇮🇳</span>
                                        <span className="text-sm font-semibold text-gray-500">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="98765 43210"
                                        value={formatPhone(phone)}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        autoFocus
                                        disabled={loading}
                                        className="flex-1 outline-none text-sm text-gray-900 bg-transparent placeholder-gray-300 tracking-wide disabled:cursor-not-allowed"
                                    />
                                    {phoneValid && (
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 max-sm:hidden" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5 ml-0.5">
                                    We'll send a 6-digit OTP to this number.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-(--primary)/90 hover:bg-(--primary) text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-slate-300 disabled:opacity-55 disabled:cursor-not-allowed mt-20 cursor-pointer"
                            >
                                {loading ? <Spinner /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
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
                        <form onSubmit={handleVerifyOtp} className="space-y-5">

                            <div>
                                <button
                                    type="button"
                                    onClick={() => { setStep('phone'); setOtp(''); }}
                                    className="text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3 flex items-center gap-1 cursor-pointer"
                                >
                                    <ArrowLeft className='size-4' /> Change number
                                </button>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Enter OTP</h2>
                                <p className="text-sm text-gray-500">
                                    We sent a 6-digit code to{' '}
                                    <span className="font-semibold text-gray-700">+91 {formatPhone(phone)}</span>
                                </p>
                            </div>

                            <div>
                                <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                                <p className="text-center text-xs text-gray-400 mt-2.5">
                                    Tip: You can paste the OTP directly
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.replace(/\D/g, '').length < OTP_LENGTH}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Spinner /> : <><span>Verify &amp; Login</span><CheckCircle size={16} /></>}
                            </button>

                            <div className="text-center">
                                {isRunning ? (
                                    <p className="text-sm text-gray-400">
                                        Resend OTP in{' '}
                                        <span className="font-semibold text-teal-600 tabular-nums">
                                            00:{String(remaining).padStart(2, '0')}
                                        </span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:underline underline-offset-2 disabled:opacity-50 mx-auto"
                                    >
                                        <RotateCcw size={13} /> Resend OTP
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-1.5 justify-center pt-1">
                                <div className="w-6 h-1 rounded-full bg-slate-700" />
                                <div className="w-6 h-1 rounded-full bg-slate-700" />
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </>
    );
}