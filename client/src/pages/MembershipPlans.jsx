import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { toast } from "sonner";
import { getErrorMessage } from "../utils";
import { Bell, Gift, Info, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

const CheckIcon = ({ color }) => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="mt-0.5 flex-shrink-0">
        <circle cx="10" cy="10" r="10" fill={color} opacity="0.18" />
        <path d="M6 10l2.5 2.5L14 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

/* ── Keyframe animations (minimal inline styles needed for dynamic values only) ── */
const GlobalStyles = () => (
    <style>{`
        @keyframes _shimmer {
            0%   { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(250%)  skewX(-15deg); }
        }
        @keyframes _fadeUp {
            from { opacity:0; transform:translateY(20px); }
            to   { opacity:1; transform:translateY(0); }
        }
        @keyframes _pulseDot {
            0%,100% { opacity:1;  transform:scale(1);    }
            50%     { opacity:.5; transform:scale(.75);  }
        }
        @keyframes _blobFloat {
            0%,100% { transform:translateY(0)     scale(1);    }
            50%     { transform:translateY(-16px) scale(1.03); }
        }
        .shimmer-always::after,
        .shimmer-hover::after {
            content:''; position:absolute; inset:0 auto 0 0;
            width:40%; border-radius:9999px;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,.38),transparent);
        }
        .shimmer-always::after { animation:_shimmer 1.6s infinite; }
        .shimmer-hover::after  { opacity:0; transition:opacity .2s; }
        .shimmer-hover:hover::after { opacity:1; animation:_shimmer 1.2s ease-in-out; }
        .fade-up  { animation:_fadeUp .55s cubic-bezier(.22,1,.36,1) both; }
        .d-100 { animation-delay:.10s; }
        .d-200 { animation-delay:.20s; }
        .d-300 { animation-delay:.30s; }
        .d-400 { animation-delay:.40s; }
        .d-500 { animation-delay:.50s; }
        .d-600 { animation-delay:.60s; }
        .pulse-dot { animation:_pulseDot 2s infinite; }
        .blob  { animation:_blobFloat  9s ease-in-out infinite; }
        .blob2 { animation:_blobFloat 11s ease-in-out infinite 2s; }
        .plans-scroll { scrollbar-width:thin; scrollbar-color:#d1d5db transparent; }
        .plans-scroll::-webkit-scrollbar { height:4px; }
        .plans-scroll::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:9px; }
    `}</style>
);

/* ─────────────────────────────────────────
   PlanCard — logic & visuals untouched
───────────────────────────────────────── */
function PlanCard({ plan, onSubscribe, isLoading, activePlanId }) {
    const isActive = activePlanId === plan._id;
    const busy = isLoading === plan._id;
    const accent = plan.accentColor || "#3B82F6";
    const btnColor = plan.buttonColor || accent;

    return (
        <div className="relative h-full w-full group">
            <div
                className="relative h-full flex flex-col bg-white rounded-2xl p-6 py-8 overflow-hidden transition-all duration-300 min-h-[420px]"
                style={{
                    border: `2px solid ${plan.isMostPopular ? "#fb2c36" : "#e5e7eb"}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,.07)",
                }}
            >
                {/* Corner ribbon */}
                {plan.badge && !plan.isMostPopular && (
                    <div className="absolute top-[22px] -left-[30px] w-[150px] bg-green-500 text-white text-[11px] font-bold text-center py-[5px] -rotate-45 shadow-sm tracking-wider z-10">
                        {plan.badge}
                    </div>
                )}
                {plan.isMostPopular && (
                    <div className="absolute top-[22px] -left-[30px] w-[150px] bg-red-500 text-white text-[11px] font-bold text-center py-[5px] -rotate-45 shadow-sm tracking-wider z-10">
                        Most Popular
                    </div>
                )}

                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">{plan.name}</h3>

                <div className="text-center mb-1">
                    <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                        {plan.billingLabel && (
                            <span className="text-base text-gray-500 ml-1">{plan.billingLabel}</span>
                        )}
                    </div>
                </div>

                {plan.annualEquivalent && (
                    <div className="flex items-center justify-center gap-1.5 mt-1.5 mb-2">
                        <CalendarIcon />
                        <span className="text-sm text-gray-500">₹ {plan.annualEquivalent}/year</span>
                    </div>
                )}

                <div className="h-1 rounded-full mt-4 mb-5" style={{ backgroundColor: accent }} />

                <div className="flex-1 mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3">What&apos;s included:</p>
                    <ul className="space-y-2.5">
                        {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <CheckIcon color={accent} />
                                <span className="text-sm text-gray-700 leading-snug">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={() => onSubscribe(plan)}
                    disabled={busy || isActive}
                    className={`relative overflow-hidden w-full py-3 px-4 font-bold text-base text-white rounded-full transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${plan.isMostPopular ? "shimmer-always" : "shimmer-hover"}`}
                    style={{
                        backgroundColor: isActive ? "#9ca3af" : btnColor,
                        boxShadow: !busy && !isActive ? `0 4px 14px ${btnColor}55` : "none",
                    }}
                >
                    {busy ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                        </span>
                    ) : isActive ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                            </svg>
                            Current Plan
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            {plan.isMostPopular && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2 19h20v2H2v-2zM2 5l5 3 5-5 5 5 5-3-2 9H4L2 5zm10-1.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                </svg>
                            )}
                            Subscribe Now
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

/* ── Static data ── */
const faqItems = [
    { icon: <Lock size={16} />, q: "Can I cancel my membership anytime?", a: "Yes, you can cancel at any time. For monthly and quarterly plans, cancellation takes effect from the next billing cycle." },
    { icon: <Info size={16} />, q: "Are there any hidden charges?", a: "No, all prices are fully inclusive of taxes. There are absolutely no hidden charges or additional fees." },
    { icon: <Gift size={16} />, q: "How do I receive my membership benefits?", a: "Once subscribed, you'll get a welcome email with instructions to access all member benefits within 24 hours." },
    { icon: <ShieldCheck size={16} />, q: "Is my payment secure?", a: "Absolutely. We use 256-bit SSL encryption and trusted payment gateways to fully protect your financial data." },
];

const trustItems = [
    {
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
        label: "Secure Payment", color: "#6366f1", bg: "#eef2ff",
    },
    {
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
        label: "256-bit SSL", color: "#059669", bg: "#ecfdf5",
    },
    {
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
        label: "No Risk Guarantee", color: "#d97706", bg: "#fffbeb",
    },
    {
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        label: "Cancel Anytime", color: "#dc2626", bg: "#fef2f2",
    },
];

const featurePills = [
    { icon: "✦", label: "Access to all NGO programs" },
    { icon: "⚡", label: "Priority event registration" },
    { icon: "📋", label: "Monthly impact newsletter" },
    { icon: "🤝", label: "Exclusive volunteer opportunities" },
    { icon: "🏅", label: "Certificate of membership" },
    { icon: "💰", label: "Tax exemption benefits" },
];

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function MembershipPlans() {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [activePlanId, setActivePlanId] = useState(null);
    const [loadingPlanId, setLoadingPlanId] = useState(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [plansRes, subRes] = await Promise.allSettled([
                    api("/plans"),
                    api("/subscriptions/active"),
                ]);
                if (plansRes.status === "fulfilled" && plansRes.value.data.success) {
                    setPlans(
                        plansRes.value.data.plans
                            .filter(p => p.isActive)
                            .sort((a, b) => a.order - b.order)
                    );
                }
                if (subRes.status === "fulfilled" && subRes.value.data?.planId) {
                    setActivePlanId(subRes.value.data.planId);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setFetching(false);
            }
        })();
    }, []);

    async function handleSubscribe(plan) {
        if (!user) {
            toast.error("Please login to continue");

            // optional: save redirect path
            Navigate("/login", {
                state: { from: "/membership/paid" }
            });

            return; // ❗ stop execution
        }


        setLoadingPlanId(plan._id);
        try {
            const sdkLoaded = await loadRazorpay();
            if (!sdkLoaded) {
                toast.error("Unable to load payment gateway. Please try again.");
                setLoadingPlanId(null);
                return;
            }

            const { data: orderData } = await api.post("/payments/create-order", {
                type: "membership", planId: plan._id,
            });

            if (!orderData.success) {
                toast.error(getErrorMessage(orderData) || "Could not process your request.");
                setLoadingPlanId(null);
                return;
            }

            const rzp = new window.Razorpay({
                key: orderData.key,
                subscription_id: orderData.subscriptionId,
                name: plan.name,
                description: `${plan.name} - ${plan.billingPeriod}`,
                prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || "" },
                theme: { color: plan.accentColor || "#3B82F6" },
                handler: async (response) => {
                    try {
                        const { data } = await api.post("/payments/verify", {
                            paymentId: orderData.paymentId,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        if (data.success) { setActivePlanId(plan._id); toast.success("Membership Activated 🎉"); }
                        else { toast.error(data.message || "Verification failed"); }
                    } catch (e) {
                        toast.error(getErrorMessage(e) || "Verification error");
                    } finally {
                        setLoadingPlanId(null);
                    }
                },
                modal: { ondismiss: () => setLoadingPlanId(null) },
            });

            rzp.on("payment.failed", (r) => {
                toast.error(r.error?.description || "Payment failed. Please try again.");
                setLoadingPlanId(null);
            });

            rzp.open();
        } catch (err) {
            toast.error(getErrorMessage(err) || "Something went wrong. Please try again.");
            setLoadingPlanId(null);
        }
    }

    /* ── Render ── */
    return (
        <div className="min-h-screen w-full bg-slate-50 overflow-x-hidden">
            <GlobalStyles />

            {/* Background blobs */}
            {/* <div aria-hidden className="blob pointer-events-none fixed -top-24 -right-24 w-80 h-80 rounded-full z-0"
                style={{ background: "radial-gradient(circle, rgba(99,102,241,.10) 0%, transparent 70%)" }} />
            <div aria-hidden className="blob2 pointer-events-none fixed -bottom-20 -left-20 w-64 h-64 rounded-full z-0"
                style={{ background: "radial-gradient(circle, rgba(16,185,129,.09) 0%, transparent 70%)" }} /> */}

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20">

                {/* ── HERO ── */}
                <section className="text-center mb-12 sm:mb-14">


                    <h1 className="fade-up d-100 font-extrabold text-gray-900 mb-4 tracking-tight text-3xl sm:text-5xl"
                    >
                        Choose Your{" "}
                        <span className="text-(--primary)">Membership</span>
                    </h1>

                    <p className="fade-up d-200 text-gray-500 mx-auto mb-8 leading-relaxed"
                        style={{ fontSize: "clamp(.93rem,2vw,1.1rem)", maxWidth: 500 }}>
                        Select the plan that works best for you and start making a difference today
                    </p>

                    {/* Feature pills */}
                    <div className="fade-up d-300 flex flex-wrap justify-center gap-2">
                        {featurePills.map((p, i) => (
                            <span key={i}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200 shadow-sm">
                                <span className="text-sm">{p.icon}</span>
                                {p.label}
                            </span>
                        ))}
                    </div>
                </section>

                {/* ── PLANS ── */}
                <section className="fade-up d-400 mb-14">
                    {fetching ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-500 animate-spin" />
                            <p className="text-sm text-gray-500">Loading plans…</p>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-lg font-semibold text-gray-900 mb-1">No plans available</p>
                            <p className="text-gray-500 text-sm">Please check back later.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile: horizontal snap-scroll */}
                            <div className="plans-scroll sm:hidden flex gap-4 overflow-x-auto pb-3 -mx-4 px-4"
                                style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
                                {plans.map(plan => (
                                    <div key={plan._id}
                                        className="flex-shrink-0"
                                        style={{ width: "82vw", maxWidth: "320px", scrollSnapAlign: "center" }}>
                                        <PlanCard plan={plan} onSubscribe={handleSubscribe} isLoading={loadingPlanId} activePlanId={activePlanId} />
                                    </div>
                                ))}
                            </div>

                            {/* sm+: CSS Grid, up to 3 columns */}
                            <div className={`hidden sm:grid gap-5 items-stretch ${plans.length === 1 ? "grid-cols-1 max-w-sm mx-auto"
                                : plans.length === 2 ? "grid-cols-2 max-w-2xl mx-auto"
                                    : "grid-cols-3"
                                }`}>
                                {plans.map(plan => (
                                    <PlanCard key={plan._id} plan={plan} onSubscribe={handleSubscribe} isLoading={loadingPlanId} activePlanId={activePlanId} />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* ── TRUST STRIP ── */}
                <section className="fade-up d-500 bg-white rounded-2xl p-5 sm:p-6 max-w-3xl mx-auto mb-8 border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-center text-gray-400 uppercase tracking-[.16em] mb-5">
                        Trusted &amp; Secure
                    </p>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-3">
                        {trustItems.map((t, i) => (
                            <div key={i}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-transform duration-150 hover:-translate-y-0.5"
                                style={{ background: t.bg }}>
                                <span className="flex-shrink-0" style={{ color: t.color }}>{t.icon}</span>
                                <span className="text-xs font-semibold" style={{ color: t.color }}>{t.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── PAYMENT METHODS ── */}
                <section className="fade-up d-500 text-center mb-12">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[.16em] mb-3">
                        Accepted Payment Methods
                    </p>
                    <div className="inline-flex flex-wrap justify-center gap-2">
                        {["Credit Card", "Debit Card", "Net Banking", "UPI"].map(m => (
                            <span key={m} className="bg-white text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                {m}
                            </span>
                        ))}
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section className="fade-up d-600 max-w-4xl mx-auto mb-12">
                    <div className="text-center mb-8">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-[.14em] px-4 py-1.5 rounded-full mb-4 bg-indigo-50 border border-indigo-200 text-(--primary)">
                            Got Questions?
                        </span>
                        <h2 className="font-extrabold text-gray-900 mb-2 tracking-tight"
                            style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", lineHeight: 1.15 }}>
                            Frequently Asked <span className="text-(--primary)">Questions</span>
                        </h2>
                        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                            Everything you need to know about our membership plans
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {faqItems.map((item, i) => (
                            <div key={i}
                                className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                                <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 bg-indigo-50 text-indigo-600">
                                        {item.icon}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 leading-snug pt-1.5">{item.q}</p>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed pl-12">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── NOTIFICATION BANNER ── */}
                <div className="fade-up d-600 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 rounded-2xl px-5 sm:px-8 py-4 sm:py-5 bg-slate-900 text-center sm:text-left">
                    <Bell size={18} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-white">
                        You will receive renewal reminders via email &amp; SMS.{" "}
                        <span className="text-amber-400 font-semibold">Cancel anytime</span> with no questions asked.
                    </p>
                </div>

            </div>
        </div>
    );
}