import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { toast } from "sonner";
import { getErrorMessage } from "../utils";
import {
    Bell,
    Gift,
    Info,
    Lock,
    ShieldCheck,
    Check,
    Calendar,
    Loader2,
    Crown,
    ChevronDown,
    CreditCard,
    Landmark,
    Smartphone,
    Wallet,
    BadgeCheck,
    ShieldAlert,
    RotateCcw,
    CalendarX,
    Sparkles,
    Users,
    Target,
    Award,
    HeartHandshake,
    UserPlus,
    Rocket,
    Quote,
    TrendingUp,
    Newspaper,
    Percent,
} from "lucide-react";
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
        @keyframes _accordionIn {
            from { opacity:0; transform:translateY(-4px); }
            to   { opacity:1; transform:translateY(0); }
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
        .d-700 { animation-delay:.70s; }
        .d-800 { animation-delay:.80s; }
        .pulse-dot { animation:_pulseDot 2s infinite; }
        .blob  { animation:_blobFloat  9s ease-in-out infinite; }
        .blob2 { animation:_blobFloat 11s ease-in-out infinite 2s; }
        .plans-scroll { scrollbar-width:thin; scrollbar-color:#d1d5db transparent; }
        .plans-scroll::-webkit-scrollbar { height:4px; }
        .plans-scroll::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:9px; }
        .faq-answer { animation:_accordionIn .2s ease-out both; }
    `}</style>
);

/* ─────────────────────────────────────────
   PlanCard
───────────────────────────────────────── */
function PlanCard({ plan, onSubscribe, isLoading, activePlanId }) {
    const isActive = activePlanId === plan._id;
    const busy = isLoading === plan._id;
    const accent = plan.accentColor || "#3B82F6";
    const btnColor = plan.buttonColor || accent;

    return (
        <div className="relative h-full w-full group">
            <div
                className="relative h-full flex flex-col bg-white rounded-2xl p-6 py-8 overflow-hidden transition-all duration-300 min-h-[440px] hover:shadow-xl"
                style={{
                    border: `2px solid ${plan.isMostPopular ? "#fb2c36" : "#e5e7eb"}`,
                    boxShadow: plan.isMostPopular
                        ? "0 8px 24px rgba(251,44,54,.12)"
                        : "0 2px 12px rgba(0,0,0,.07)",
                }}
            >
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
                        <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500">₹ {plan.annualEquivalent}/year</span>
                    </div>
                )}

                <div className="h-1 rounded-full mt-4 mb-5" style={{ backgroundColor: accent }} />

                <div className="flex-1 mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3">What&apos;s included:</p>
                    <ul className="space-y-2.5">
                        {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span
                                    className="mt-0.5 flex-shrink-0 rounded-full p-0.5"
                                    style={{ backgroundColor: `${accent}22` }}
                                >
                                    <Check size={13} style={{ color: accent }} strokeWidth={3} />
                                </span>
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
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                        </span>
                    ) : isActive ? (
                        <span className="flex items-center justify-center gap-2">
                            <BadgeCheck size={18} />
                            Current Plan
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            {plan.isMostPopular && <Crown size={16} />}
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
    { icon: Lock, q: "Can I cancel my membership anytime?", a: "Yes, you can cancel at any time from your account settings. For monthly and quarterly plans, cancellation takes effect from the next billing cycle, so you keep access until the period you've already paid for ends." },
    { icon: Info, q: "Are there any hidden charges?", a: "No. All prices shown are fully inclusive of taxes. There are no setup fees, processing fees, or surprise charges added at checkout — the price you see is the price you pay." },
    { icon: Gift, q: "How do I receive my membership benefits?", a: "Once your payment is confirmed, you'll get a welcome email within 24 hours with instructions to access programs, events, and your member dashboard." },
    { icon: ShieldCheck, q: "Is my payment secure?", a: "Absolutely. All transactions run through Razorpay with 256-bit SSL encryption, and we never store your card or bank details on our servers." },
    { icon: RotateCcw, q: "Can I upgrade or downgrade my plan later?", a: "Yes. You can switch tiers at any time from your account. If you upgrade mid-cycle, we'll prorate the difference; downgrades take effect at your next renewal." },
    { icon: Landmark, q: "Will I get a receipt for tax exemption?", a: "Yes. Every contribution generates an 80G-eligible receipt, sent to your registered email and always available for download from your dashboard." },
    { icon: ShieldAlert, q: "What happens if a payment fails?", a: "If a renewal payment fails, we'll notify you by email and SMS and retry automatically for a few days before your membership lapses — so you won't lose access without warning." },
];

const trustItems = [
    { icon: ShieldCheck, label: "Secure Payment", color: "#6366f1", bg: "#eef2ff" },
    { icon: Lock, label: "256-bit SSL", color: "#059669", bg: "#ecfdf5" },
    { icon: ShieldAlert, label: "No Risk Guarantee", color: "#d97706", bg: "#fffbeb" },
    { icon: RotateCcw, label: "Cancel Anytime", color: "#dc2626", bg: "#fef2f2" },
];

const paymentMethods = [
    { icon: CreditCard, label: "Credit Card" },
    { icon: Wallet, label: "Debit Card" },
    { icon: Landmark, label: "Net Banking" },
    { icon: Smartphone, label: "UPI" },
];

const membershipBenefits = [
    { icon: Target, title: "Access to all NGO programs", desc: "Full access to every ongoing initiative and program we run, no exceptions." },
    { icon: Sparkles, title: "Priority event registration", desc: "First access and reserved seats whenever we open registration for events." },
    { icon: Newspaper, title: "Monthly impact newsletter", desc: "A monthly digest showing exactly where your contribution went and what it funded." },
    { icon: HeartHandshake, title: "Exclusive volunteer opportunities", desc: "Hands-on volunteering slots reserved specifically for members." },
    { icon: Award, title: "Certificate of membership", desc: "An official certificate recognizing you as a supporting member." },
    { icon: Percent, title: "Tax exemption benefits", desc: "80G-eligible receipts issued automatically for every contribution you make." },
];

const impactStats = [
    { icon: Users, value: "5,000+", label: "Active Members" },
    { icon: Target, value: "120+", label: "Programs Run" },
    { icon: HeartHandshake, value: "18,000+", label: "Lives Touched" },
    { icon: TrendingUp, value: "9", label: "Years of Impact" },
];

const steps = [
    { icon: UserPlus, title: "Choose your plan", desc: "Pick the membership tier that matches how involved you want to be." },
    { icon: CreditCard, title: "Complete secure checkout", desc: "Pay safely through Razorpay using cards, UPI, or net banking." },
    { icon: Rocket, title: "Start making an impact", desc: "Get instant access to programs, events, and your welcome email." },
];

const testimonials = [
    { name: "Ananya Sharma", role: "Gold Member since 2023", quote: "Being a member here isn't just a subscription — I actually see where my contribution goes every month." },
    { name: "Rajiv Mehta", role: "Silver Member since 2022", quote: "The volunteer opportunities are real and hands-on. My kids have joined two of the events with me." },
    { name: "Priya Nair", role: "Platinum Member since 2021", quote: "Renewal reminders, tax receipts, everything is handled smoothly. It just works." },
];


const Heading = ({ title, colorTitle, description = "" }) => {
    return (
        <div>
            <h2 className="fade-up d-100 font-bold text-gray-900 mb-1.5 tracking-tight text-3xl sm:text-4xl">
                {title}{" "}
                {colorTitle &&
                    <span className="text-(--primary)">{colorTitle}</span>
                }
            </h2>
            {
                description &&
                <p className="fade-up d-200 text-gray-500 max-w-xl mx-auto mb-2 leading-relaxed text-base sm:text-lg">
                    {description}
                </p>
            }
        </div>

    )
}
/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function MembershipPlans() {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [activePlanId, setActivePlanId] = useState(null);
    const [loadingPlanId, setLoadingPlanId] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [openFaq, setOpenFaq] = useState(0);

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
            Navigate("/login", { state: { from: "/membership/paid" } });
            return;
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

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20">

                {/* ── HERO ── */}
                <section className="text-center mb-10 sm:mb-12">
                    <h1 className="fade-up d-100 font-bold text-gray-900 mb-3 tracking-tight text-3xl sm:text-4xl">
                        Choose Your{" "}
                        <span className="text-(--primary)">Membership</span>
                    </h1>

                    <p className="fade-up d-200 text-gray-500 max-w-xl mx-auto mb-2 leading-relaxed text-base sm:text-lg">
                        Select the plan that works best for you and start making a real, trackable difference today.
                    </p>
                </section>



                {/* ── PLANS ── */}
                <section className="fade-up d-400 mb-16">
                    {fetching ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 size={40} className="animate-spin text-(--primary)" />
                            <p className="text-sm text-gray-500">Loading plans…</p>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-24 sm:py-40">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-50 mb-6">
                                <CalendarX className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-lg sm:text-4xl font-semibold text-gray-700 mb-1">No plans available</p>
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

                {/* ── IMPACT STATS ── */}
                <section className="fade-up d-300 mb-14">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {impactStats.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-5 text-center">
                                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 text-(--primary) mb-2.5">
                                        <Icon size={18} />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{s.value}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">{s.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── MEMBERSHIP BENEFITS ── */}
                <section className="fade-up d-500 max-w-5xl mx-auto my-20">
                    <div className="text-center mb-8">
                        <Heading title="Every Membership" colorTitle="Includes" description="The essentials every member gets, regardless of tier" />

                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {membershipBenefits.map((b, i) => {
                            const Icon = b.icon;
                            return (
                                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-(--primary) mb-3">
                                        <Icon size={18} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">{b.title}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section className="fade-up d-500 max-w-4xl mx-auto mb-16 py-20">
                    <div className="text-center mb-8">
                        <Heading title="How Its" colorTitle="Work" description="From sign-up to your first program in three steps" />

                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className="relative text-center">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-(--primary) text-white mb-4">
                                        <Icon size={22} />
                                    </div>
                                    <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1">{s.title}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed max-w-[240px] mx-auto">{s.desc}</p>
                                    {i < steps.length - 1 && (
                                        <div className="hidden sm:block absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gray-200" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* ── PAYMENT METHODS ── */}
                    <section className="fade-up d-500 text-center mt-14">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[.16em] mb-3">
                            Accepted Payment Methods
                        </p>
                        <div className="inline-flex flex-wrap justify-center gap-2">
                            {paymentMethods.map(({ icon: Icon, label }) => (
                                <span key={label}
                                    className="inline-flex items-center gap-1.5 bg-white text-gray-600 text-xs font-semibold px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <Icon size={14} className="text-gray-400" />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </section>
                </section>




                {/* ── TESTIMONIALS ── */}
                <section className="fade-up d-600 max-w-5xl mx-auto py-20">
                    <div className="text-center mb-8">
                        <Heading title="What Members" colorTitle="Says" description="Real feedback from people already on a plan" />

                    </div>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
                                <Quote size={20} className="text-indigo-200 mb-3" fill="currentColor" />
                                <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-1">&ldquo;{t.quote}&rdquo;</p>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── FAQ (accordion) ── */}
                <section className="fade-up d-600 max-w-4xl mx-auto py-15">
                    <div className="text-center mb-8">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-[.14em] px-4 py-1.5 rounded-full mb-4 bg-indigo-50 border border-indigo-200 text-(--primary)">
                            Got Questions?
                        </span>
                        <Heading title="Frequently Asked" colorTitle="Questions" description="Everything you need to know about our membership plans" />
                    </div>

                    <div className="flex flex-col gap-3">
                        {faqItems.map((item, i) => {
                            const Icon = item.icon;
                            const isOpen = openFaq === i;
                            return (
                                <div key={i}
                                    className="bg-white rounded-2xl border border-gray-200 shadow overflow-hidden transition-shadow duration-200 hover:shadow-sm py-4">
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? -1 : i)}
                                        className="w-full flex items-center gap-3 text-left px-4 cursor-pointer"
                                        aria-expanded={isOpen}
                                    >
                                        <div className={`flex items-center justify-center size-8 sm:size-10 rounded-lg sm:rounded-lg flex-shrink-0 transition-colors ${isOpen ? "bg-(--primary) text-white" : "bg-indigo-50 text-indigo-600"}`}>
                                            <Icon size={16} />
                                        </div>
                                        <p className="flex-1 text-sm sm:text-base md:text-lg font-medium text-gray-900 leading-snug">{item.q}</p>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="faq-answer px-5 pb-4 pl-[4.25rem] pt-2">
                                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.a}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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

            </div >
        </div >
    );
}