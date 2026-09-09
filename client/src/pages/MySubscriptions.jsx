import { useState, useEffect } from 'react';
import {
    Crown, Calendar, IndianRupee, X, CreditCard,
    Hash, CheckCircle, XCircle, Clock, Repeat,
    AlertTriangle, ChevronRight, Sparkles, RefreshCw,
    Ban, Info, Shield
} from 'lucide-react';
import api from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

/* ─── helpers ─────────────────────────────────────────────────────────── */
const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const formatAmount = (amt, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amt || 0);

const daysLeft = (endDate) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate) - new Date()) / 86400000);
};

/* ─── status config ───────────────────────────────────────────────────── */
const STATUS_CFG = {
    active: { label: "Active", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    created: { label: "Created", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
    cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    expired: { label: "Expired", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
    failed: { label: "Failed", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
};

function StatusBadge({ status }) {
    const c = STATUS_CFG[status] ?? STATUS_CFG.created;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

/* ─── Detail Modal ────────────────────────────────────────────────────── */
function SubscriptionDetailModal({ sub, onClose, onCancel }) {
    if (!sub) return null;

    useEffect(() => {
        const h = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, []);

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    const days = daysLeft(sub.endDate);
    const isActive = sub.status === "active";

    const DetailRow = ({ icon: Icon, label, value, mono = false, valueClass = "" }) => (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className={`text-sm text-gray-900 font-medium break-all ${mono ? "font-mono" : ""} ${valueClass}`}>
                    {value || "—"}
                </p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4" onClick={handleBackdrop}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-white text-lg font-bold">Subscription Details</h2>
                        <p className="text-blue-100 text-xs mt-0.5">Full membership breakdown</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Plan Hero */}
                <div className="px-6 py-5 text-center border-b border-gray-100 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                        <Crown className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Plan</p>
                    <p className="text-2xl font-bold text-gray-900">{sub.plan?.name || "—"}</p>
                    <p className="text-lg font-semibold text-blue-600 mt-0.5">{formatAmount(sub.plan?.price)} / {sub.plan?.billingPeriod}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <StatusBadge status={sub.status} />
                        {isActive && days !== null && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${days <= 7 ? "bg-red-100 text-red-600" : days <= 30 ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                                {days > 0 ? `${days} days left` : "Ending today"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-4">

                    {/* Plan Features */}
                    {sub.plan?.features?.length > 0 && (
                        <>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Plan Features</p>
                            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
                                <ul className="space-y-2">
                                    {sub.plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Subscription Info */}
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Subscription Info</p>
                    <div className="bg-gray-50 rounded-xl px-4 mb-4">
                        <DetailRow icon={Calendar} label="Start Date" value={formatDate(sub.startDate)} />
                        <DetailRow icon={Calendar} label="End Date" value={formatDate(sub.endDate)} />
                        {sub.cancelledAt && (
                            <DetailRow icon={XCircle} label="Cancelled At" value={formatDateTime(sub.cancelledAt)} valueClass="text-red-600" />
                        )}
                        {sub.nextBillingDate && sub.status === "active" && (
                            <DetailRow icon={Clock} label="Next Billing Date" value={formatDate(sub.nextBillingDate)} />
                        )}
                        {sub.lastPaymentDate && (
                            <DetailRow icon={CreditCard} label="Last Payment" value={formatDate(sub.lastPaymentDate)} />
                        )}
                        <DetailRow icon={Repeat} label="Auto Renew" value={sub.isAutoRenew ? "Yes" : "No"} />
                    </div>

                    {/* Payment Info */}
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment Reference</p>
                    <div className="bg-gray-50 rounded-xl px-4 mb-4">
                        <DetailRow icon={Hash} label="Razorpay Subscription ID" value={sub.razorpaySubscriptionId} mono />
                    </div>

                    {/* Cancel warning for active */}
                    {isActive && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3 mb-2">
                            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">
                                You can cancel anytime. Access continues until <strong>{formatDate(sub.endDate)}</strong>. Cancellations cannot be reversed.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
                    {isActive && (
                        <button onClick={() => { onClose(); onCancel(sub); }}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                            <Ban className="w-4 h-4" /> Cancel Subscription
                        </button>
                    )}
                    <button onClick={onClose}
                        className="ml-auto px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Cancel Confirm Modal ───────────────────────────────────────────── */
function CancelConfirmModal({ sub, onClose, onConfirm, loading }) {
    if (!sub) return null;

    useEffect(() => {
        const h = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, []);

    return (
        <div className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 pt-6 pb-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Cancel Subscription?</h2>
                    <p className="text-gray-500 text-sm">
                        You're about to cancel your <strong className="text-gray-700">{sub.plan?.name}</strong> plan.
                    </p>
                </div>

                {/* Warning box */}
                <div className="mx-6 mb-5 bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">This action <strong>cannot be undone or reversed</strong>.</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">Your subscription will <strong>not resume</strong> automatically.</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">Access continues until <strong>{formatDate(sub.endDate)}</strong>.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} disabled={loading}
                        className="flex-1 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                        Keep Subscription
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 py-3 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        {loading ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Subscription Card ───────────────────────────────────────────────── */
function SubscriptionCard({ sub, onView, onCancel }) {
    const days = daysLeft(sub.endDate);
    const isActive = sub.status === "active";

    return (
        <div className={`bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-md
            ${isActive ? "border-blue-200 shadow-sm" : "border-gray-200"}`}>

            {/* Top accent for active */}
            {isActive && <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />}

            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "bg-blue-100" : "bg-gray-100"}`}>
                            <Crown className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-900">{sub.plan?.name || "Plan"}</p>
                            <p className="text-sm text-gray-500">{sub.plan?.billingLabel || sub.plan?.billingPeriod}</p>
                        </div>
                    </div>
                    <StatusBadge status={sub.status} />
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-gray-900">{formatAmount(sub.plan?.price)}</span>
                    <span className="text-sm text-gray-400">/ {sub.plan?.billingPeriod}</span>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Start</p>
                        <p className="text-xs font-semibold text-gray-700">{formatDate(sub.startDate)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{sub.cancelledAt ? "Cancelled" : "Ends"}</p>
                        <p className="text-xs font-semibold text-gray-700">{sub.cancelledAt ? formatDate(sub.cancelledAt) : formatDate(sub.endDate)}</p>
                    </div>
                </div>

                {/* Next billing */}
                {isActive && sub.nextBillingDate && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-4">
                        <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-blue-600 font-medium">
                            Next payment: <strong>{formatDate(sub.nextBillingDate)}</strong>
                        </p>
                    </div>
                )}

                {/* Days left */}
                {isActive && days !== null && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-gray-500">Access remaining</span>
                            <span className={`font-semibold ${days <= 7 ? "text-red-500" : days <= 30 ? "text-amber-500" : "text-blue-600"}`}>
                                {days > 0 ? `${days} days` : "Ends today"}
                            </span>
                        </div>
                        {sub.endDate && sub.startDate && (
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${days <= 7 ? "bg-red-400" : days <= 30 ? "bg-amber-400" : "bg-blue-500"}`}
                                    style={{
                                        width: `${Math.min(100, Math.max(2, (days / Math.ceil((new Date(sub.endDate) - new Date(sub.startDate)) / 86400000)) * 100))}%`
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <button onClick={() => onView(sub)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
                        <Info className="w-3.5 h-3.5" /> View Details
                    </button>
                    {isActive && (
                        <button onClick={() => onCancel(sub)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                            <Ban className="w-3.5 h-3.5" /> Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Mobile Row Card (for past subscriptions) ────────────────────────── */
function PastSubMobileCard({ s, onView }) {
    return (
        <div className="p-4 border-b border-gray-200 last:border-0">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Crown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800 truncate">{s.plan?.name || "—"}</span>
                </div>
                <StatusBadge status={s.status} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Amount:</span> <span className="text-blue-600 font-semibold">{formatAmount(s.plan?.price)}</span></p>
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Start:</span> {formatDate(s.startDate)}</p>
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">End:</span> {formatDate(s.endDate)}</p>
            </div>
            <button onClick={() => onView(s)}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
                View Details
            </button>
        </div>
    );
}

/* ─── Main Page ───────────────────────────────────────────────────────── */
export default function MySubscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewSub, setViewSub] = useState(null);
    const [cancelSub, setCancelSub] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => { fetchSubscriptions(); }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/subscriptions/my-subscriptions");
            setSubscriptions(data.subscriptions || []);
        } catch {
            toast.error("Failed to load subscriptions");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCancel = async () => {
        if (!cancelSub) return;
        try {
            setCancelling(true);
            await api.post(`/subscriptions/${cancelSub._id}/cancel`);
            toast.success("Subscription cancelled successfully");
            setCancelSub(null);
            fetchSubscriptions();
        } catch {
            toast.error("Failed to cancel subscription");
        } finally {
            setCancelling(false);
        }
    };

    const active = subscriptions.filter(s => s.status === "active");
    const created = subscriptions.filter(s => s.status === "created");
    const past = subscriptions.filter(s => ["cancelled", "expired", "failed"].includes(s.status));
    const activeSub = active[0] || null;

    return (
        <div className="max-w-7xl mx-auto">

            {/* Modals */}
            {viewSub && (
                <SubscriptionDetailModal
                    sub={viewSub}
                    onClose={() => setViewSub(null)}
                    onCancel={(s) => { setViewSub(null); setCancelSub(s); }}
                />
            )}
            {cancelSub && (
                <CancelConfirmModal
                    sub={cancelSub}
                    onClose={() => setCancelSub(null)}
                    onConfirm={handleConfirmCancel}
                    loading={cancelling}
                />
            )}

            {/* Header */}
            <div className="mb-4">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">My Subscriptions</h1>
                <p className="text-gray-600 text-sm">Manage your membership plans</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6 mb-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Crown className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Plan</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeSub ? activeSub.plan?.name : "None"}</p>
                            {activeSub && (
                                <p className="text-xs text-blue-600 font-medium mt-0.5">
                                    {formatAmount(activeSub.plan?.price)} / {activeSub.plan?.billingPeriod}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Subscriptions</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{subscriptions.length}</p>
                            {activeSub?.nextBillingDate && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Next billing: {formatDate(activeSub.nextBillingDate)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Loading your subscriptions...</p>
                </div>
            ) : subscriptions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No subscriptions yet</h3>
                    <p className="text-gray-500 mb-4">Subscribe to a plan to unlock member benefits</p>
                    <Link to="/membership" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                        <Sparkles className="w-4 h-4" /> View Plans
                    </Link>
                </div>
            ) : (
                <>
                    {/* Active / Created */}
                    {(active.length > 0) && (
                        <div className="mb-8">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Current Subscription
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...active].map(s => (
                                    <SubscriptionCard
                                        key={s._id}
                                        sub={s}
                                        onView={setViewSub}
                                        onCancel={setCancelSub}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Subscriptions */}
                    {past.length > 0 && (
                        <div>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Past Subscriptions
                            </h2>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Plan</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Amount</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Start</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">End</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {past.map(s => (
                                                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Crown className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-800">{s.plan?.name || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-blue-600 whitespace-nowrap">
                                                        {formatAmount(s.plan?.price)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(s.startDate)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(s.endDate)}</td>
                                                    <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                                                    <td className="px-6 py-4">
                                                        <button onClick={() => setViewSub(s)}
                                                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden divide-y divide-gray-200">
                                    {past.map(s => (
                                        <PastSubMobileCard key={s._id} s={s} onView={setViewSub} />
                                    ))}
                                </div>

                            </div>
                        </div>
                    )}
                </>
            )}

            {/* CTA */}
            <div className="mt-4 bg-gradient-to-r from-(--primary) to-blue-500 rounded-2xl shadow-sm sm:shadow-lg p-4 sm:p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold sm:mb-2">
                            {activeSub ? "Enjoying your membership?" : "Unlock Member Benefits"}
                        </h3>
                        <p className="text-sm sm:text-blue-100">
                            {activeSub ? "Explore all features included in your plan" : "Subscribe to access exclusive features and content"}
                        </p>
                    </div>
                    <Link to="/membership/paid"
                        className="px-6 py-2 sm:py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all whitespace-nowrap">
                        {activeSub ? "View Plans" : "Subscribe Now"}
                    </Link>
                </div>
            </div>
        </div>
    );
}