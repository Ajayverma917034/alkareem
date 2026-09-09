// pages/SubscriptionsPage.jsx
// Fully aligned with backend: Subscription model (startDate/endDate),
// Payment model, getSubscriptionStats (/payments/stats/),
// getSubscriptionById → { subscription, payments },
// cancelSubscription → { subscription }

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
    Eye, X, Trash2, Loader2, RefreshCw,
    User, Mail, Phone, Calendar,
    Hash, TrendingUp, Repeat,
    CheckCircle, XCircle, CreditCard, IndianRupee,
    Package, AlertCircle, Award, Clock,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

/* ─── constants ──────────────────────────────────────────────────────── */
// Subscription statuses — from Subscription model enum
const SUB_STATUS_CFG = {
    created: { label: "Created", cls: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
    active: { label: "Active", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-400" },
    cancelled: { label: "Cancelled", cls: "bg-orange-50 text-orange-500 border-orange-200", dot: "bg-orange-400" },
    expired: { label: "Expired", cls: "bg-gray-100 text-gray-500 border-gray-300", dot: "bg-gray-400" },
    failed: { label: "Failed", cls: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-400" },
};

// Payment statuses — from Payment model enum
const PAY_STATUS_CFG = {
    created: { label: "Created", cls: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
    paid: { label: "Paid", cls: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-400" },
    active: { label: "Active", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-400" },
    failed: { label: "Failed", cls: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-400" },
    cancelled: { label: "Cancelled", cls: "bg-orange-50 text-orange-500 border-orange-200", dot: "bg-orange-400" },
    refunded: { label: "Refunded", cls: "bg-purple-50 text-purple-500 border-purple-200", dot: "bg-purple-400" },
};

/* ─── helpers ────────────────────────────────────────────────────────── */
const fmtDate = d =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = d =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtCurrency = (amt, curr = "INR") => {
    if (!amt && amt !== 0) return "—";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: curr, maximumFractionDigits: 0 }).format(amt);
};
// Payment amounts are stored in paise → convert to rupees
const paiseToRupees = p => (p || 0) / 100;

function getDaysRemaining(endDate) {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
}
function getDurationMonths(start, end) {
    if (!start || !end) return null;
    return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24 * 30));
}

/* ─── small components ───────────────────────────────────────────────── */
function StatusPill({ status, cfg = SUB_STATUS_CFG }) {
    const c = cfg[status] ?? cfg.created;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

function StatCard({ label, value, icon, color, subtitle }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}14` }}>
                <span style={{ color }}>{icon}</span>
            </div>
            <div>
                <p className="text-[18px] font-semibold text-gray-900 leading-none">{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
                {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

/* ─── Detail Drawer ──────────────────────────────────────────────────── */
function DetailDrawer({ id, onClose, onAction }) {
    // GET /subscriptions/:id/ → { subscription, payments }
    const [subscription, setSubscription] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        axiosInstance.get(`/subscriptions/${id}`)
            .then(r => {
                setSubscription(r.data.subscription);
                setPayments(r.data.payments || []);
            })
            .catch(() => toast.error("Failed to load subscription details"))
            .finally(() => setLoading(false));
    }, [id]);

    const act = async (action) => {
        setActing(action);
        try {
            if (action === "cancel") {
                // PUT /subscriptions/:id/ → { message, subscription }
                const res = await axiosInstance.put(`/subscriptions/${id}`);
                setSubscription(res.data.subscription);
                toast.success("Subscription cancelled");
                onAction();
            } else if (action === "delete") {
                await axiosInstance.delete(`/subscriptions/${id}`);
                toast.success("Subscription deleted");
                onAction();
                onClose();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        } finally {
            setActing(null);
        }
    };

    const Row = ({ icon, label, value }) => (
        <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span className="flex-shrink-0 mt-px" style={{ color: "var(--primary)" }}>{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-[12px] text-gray-800 mt-0.5 break-words">{value || "—"}</p>
            </div>
        </div>
    );

    const s = subscription;
    const daysLeft = getDaysRemaining(s?.endDate);
    const duration = getDurationMonths(s?.startDate, s?.endDate);

    // revenue from successful payments attached to this subscription
    const paidPayments = payments.filter(p => p.status === "paid");
    const totalPaid = paidPayments.reduce((acc, p) => acc + paiseToRupees(p.amount), 0);

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

            <div className="fixed top-0 right-0 h-full z-50 w-full max-w-[460px] bg-white shadow-2xl flex flex-col">
                {/* top accent */}
                <div className="h-1 flex-shrink-0" style={{ background: "var(--primary)" }} />

                {/* header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
                            <Award className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-gray-900">Subscription details</p>
                            {s?._id && (
                                <p className="text-[10px] text-gray-400 font-mono">{s._id.slice(-8)}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
                        </div>
                    ) : s ? (
                        <>
                            {/* status + created */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <StatusPill status={s.status} />
                                    {s.status === "active" && daysLeft !== null && (
                                        <span className={`text-[10px] font-medium ${daysLeft <= 7 ? "text-red-500" : daysLeft <= 30 ? "text-amber-500" : "text-gray-500"}`}>
                                            {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                                        </span>
                                    )}
                                    {s.isAutoRenew && s.status === "active" && (
                                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                                            <Repeat className="w-2.5 h-2.5" /> Auto-renew
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400">Created</p>
                                    <p className="text-[11px] font-medium text-gray-600">{fmtDate(s.createdAt)}</p>
                                </div>
                            </div>

                            {/* plan highlight */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl px-5 py-4 text-center border border-blue-200">
                                <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wide mb-1">
                                    Membership Plan
                                </p>
                                <p className="text-[22px] font-bold text-blue-700">{s.plan?.name || "—"}</p>
                                {s.plan?.billingPeriod && (
                                    <p className="text-[11px] text-blue-500 mt-0.5">{s.plan.billingPeriod}</p>
                                )}
                                {s.plan?.price != null && (
                                    <p className="text-[13px] font-semibold text-blue-600 mt-1">
                                        {fmtCurrency(s.plan.price)} / cycle
                                    </p>
                                )}
                            </div>

                            {/* membership period */}
                            {s.startDate && s.endDate && (
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl px-5 py-4 border border-emerald-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-emerald-600" />
                                            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
                                                Membership Period
                                            </p>
                                        </div>
                                        {duration && (
                                            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-700 rounded-full text-[9px] font-medium">
                                                {duration} month{duration !== 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[9px] text-emerald-600/70 font-medium uppercase mb-1">Start Date</p>
                                            <p className="text-[13px] font-semibold text-emerald-800">{fmtDate(s.startDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-emerald-600/70 font-medium uppercase mb-1">End Date</p>
                                            <p className="text-[13px] font-semibold text-emerald-800">{fmtDate(s.endDate)}</p>
                                        </div>
                                    </div>
                                    {s.status === "active" && daysLeft !== null && (
                                        <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
                                            <p className="text-[10px] text-emerald-600/80 font-medium">Time Remaining</p>
                                            <p className={`text-[12px] font-bold ${daysLeft <= 7 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-emerald-700"}`}>
                                                {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* billing tracking dates */}
                            {(s.lastPaymentDate || s.nextBillingDate) && (
                                <div className="grid grid-cols-2 gap-2">
                                    {s.lastPaymentDate && (
                                        <div className="bg-gray-50 rounded-xl px-3 py-3 border border-gray-100">
                                            <p className="text-[9px] text-gray-400 font-medium uppercase mb-1">Last payment</p>
                                            <p className="text-[12px] font-semibold text-gray-700">{fmtDate(s.lastPaymentDate)}</p>
                                        </div>
                                    )}
                                    {s.nextBillingDate && (
                                        <div className="bg-gray-50 rounded-xl px-3 py-3 border border-gray-100">
                                            <p className="text-[9px] text-gray-400 font-medium uppercase mb-1">Next billing</p>
                                            <p className="text-[12px] font-semibold text-gray-700">{fmtDate(s.nextBillingDate)}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* subscriber info */}
                            <Section title="Subscriber information">
                                <Row icon={<User className="w-3.5 h-3.5" />} label="Name" value={s.user?.name} />
                                <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={s.user?.email} />
                                <Row icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={s.user?.phone} />
                            </Section>

                            {/* razorpay */}
                            {s.razorpaySubscriptionId && (
                                <Section title="Razorpay information">
                                    <Row icon={<Hash className="w-3.5 h-3.5" />} label="Subscription ID" value={s.razorpaySubscriptionId} />
                                </Section>
                            )}

                            {/* cancellation */}
                            {s.status === "cancelled" && s.cancelledAt && (
                                <Section title="Cancellation">
                                    <Row icon={<XCircle className="w-3.5 h-3.5" />} label="Cancelled at" value={fmtDateTime(s.cancelledAt)} />
                                </Section>
                            )}

                            {/* notes */}
                            {s.notes && (
                                <Section title="Notes">
                                    <div className="px-3 py-2.5">
                                        <p className="text-[12px] text-gray-600 whitespace-pre-wrap">{s.notes}</p>
                                    </div>
                                </Section>
                            )}

                            {/* timeline */}
                            <Section title="Timeline">
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Created at" value={fmtDateTime(s.createdAt)} />
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Updated at" value={fmtDateTime(s.updatedAt)} />
                            </Section>

                            {/* payment history — from payments[] returned by getSubscriptionById */}
                            {payments.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                            Payment history
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400">
                                                {payments.length} payment{payments.length !== 1 ? "s" : ""}
                                            </span>
                                            {totalPaid > 0 && (
                                                <span className="text-[10px] font-semibold text-emerald-600">
                                                    {fmtCurrency(totalPaid)} collected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {payments.map(p => (
                                            <div key={p._id}
                                                className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                        <CreditCard className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[12px] font-semibold text-gray-800">
                                                            {fmtCurrency(paiseToRupees(p.amount), p.currency)}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">{fmtDateTime(p.createdAt)}</p>
                                                        {p.razorpayPaymentId && (
                                                            <p className="text-[9px] text-gray-300 font-mono truncate">{p.razorpayPaymentId}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    <StatusPill status={p.status} cfg={PAY_STATUS_CFG} />
                                                    {p.method && (
                                                        <span className="text-[9px] text-gray-400 capitalize">{p.method}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* action footer */}
                {s && (
                    <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4">
                        <div className="grid grid-cols-2 gap-2">
                            {s.status === "active" && (
                                <ActionBtn
                                    label="Cancel subscription"
                                    icon={<XCircle className="w-3.5 h-3.5" />}
                                    loading={acting === "cancel"}
                                    onClick={() => {
                                        if (confirm("Cancel this subscription? This will also cancel it on Razorpay.")) act("cancel");
                                    }}
                                    cls="bg-orange-50 hover:bg-orange-100 text-orange-500 border border-orange-200"
                                />
                            )}
                            <ActionBtn
                                label="Delete"
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                loading={acting === "delete"}
                                onClick={() => { if (confirm("Delete this subscription permanently?")) act("delete"); }}
                                cls={`bg-red-500 hover:bg-red-600 text-white ${s.status === "active" ? "" : "col-span-2"}`}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
            <div className="bg-white border border-gray-100 rounded-xl px-3 divide-y divide-gray-50">
                {children}
            </div>
        </div>
    );
}

function ActionBtn({ label, icon, onClick, loading, cls, style }) {
    return (
        <button onClick={onClick} disabled={loading} style={style}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50 ${cls}`}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
            {label}
        </button>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

    // Keys match getSubscriptionStats response exactly
    const [stats, setStats] = useState({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        cancelledSubscriptions: 0,
        failedSubscriptions: 0,
        expiredSubscriptions: 0,
        totalRevenue: 0,
        totalPayments: 0,
    });

    const [loading, setLoading] = useState(true);
    const [detailId, setDetailId] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusF, setStatusF] = useState("all");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    // GET /payments/stats/ — route is router.get("/payments/stats/", getSubscriptionStats)
    const fetchStats = () =>
        axiosInstance.get("/payments/stats")
            .then(r => setStats(r.data))
            .catch(() => { });

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            // GET /subscriptions/ — Subscription model has no "type", so no type filter needed
            const params = { page, limit: 15, sortBy, sortOrder };
            if (statusF !== "all") params.status = statusF;
            if (search) params.search = search;
            const { data } = await axiosInstance.get("/subscriptions", { params });
            setSubscriptions(data.subscriptions);
            setPagination(data.pagination);
        } catch {
            toast.error("Failed to load subscriptions");
        } finally {
            setLoading(false);
        }
    }, [page, statusF, search, sortBy, sortOrder]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const onAction = () => { fetchSubscriptions(); fetchStats(); };

    const toggleSort = col => {
        if (sortBy === col) setSortOrder(o => o === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortOrder("desc"); }
    };

    const TH = ({ label, col, cls = "" }) => (
        <th
            onClick={col ? () => toggleSort(col) : undefined}
            className={`px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap
                ${col ? "cursor-pointer hover:text-gray-600 select-none" : ""} ${cls}`}>
            <span className="flex items-center gap-1">
                {label}
                {col && sortBy === col && (
                    <ChevronDown className={`w-3 h-3 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
                )}
            </span>
        </th>
    );

    const selectCls = `appearance-none pl-7 pr-7 py-2 rounded-lg bg-white border border-gray-200 text-[12px] text-gray-600 font-medium outline-none cursor-pointer focus:border-[var(--primary)] transition-all`;

    return (
        <>
            <div className="max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: "var(--primary)" }}>
                            <Award className="w-[18px] h-[18px] text-white" />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-semibold text-gray-900">Subscriptions</h1>
                            <p className="text-[11px] text-gray-400">Manage all recurring membership subscriptions</p>
                        </div>
                    </div>
                    <button onClick={() => { fetchSubscriptions(); fetchStats(); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[12px] text-gray-500 font-medium hover:bg-gray-50 transition-all">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                </div>

                {/* ── Stats row 1 ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <StatCard
                        label="Total subscriptions"
                        value={stats.totalSubscriptions}
                        subtitle={`${stats.totalPayments} payments`}
                        icon={<TrendingUp className="w-4 h-4" />}
                        color="#8B5CF6"
                    />
                    <StatCard
                        label="Total revenue"
                        value={fmtCurrency(stats.totalRevenue)}
                        subtitle="Paid payments only"
                        icon={<IndianRupee className="w-4 h-4" />}
                        color="#0EA5E9"
                    />
                    <StatCard
                        label="Active"
                        value={stats.activeSubscriptions}
                        icon={<CheckCircle className="w-4 h-4" />}
                        color="#22C55E"
                    />
                    <StatCard
                        label="Cancelled"
                        value={stats.cancelledSubscriptions}
                        icon={<XCircle className="w-4 h-4" />}
                        color="#F59E0B"
                    />
                </div>

                {/* ── Stats row 2 ── */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatCard
                        label="Failed"
                        value={stats.failedSubscriptions}
                        icon={<AlertCircle className="w-4 h-4" />}
                        color="#EF4444"
                    />
                    <StatCard
                        label="Expired"
                        value={stats.expiredSubscriptions}
                        icon={<Clock className="w-4 h-4" />}
                        color="#94A3B8"
                    />
                </div>

                {/* ── Toolbar ── */}
                <div className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 mb-4 flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text" placeholder="Search by name, email, phone…"
                            value={searchInput} onChange={e => setSearchInput(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 focus:border-[var(--primary)] outline-none transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        {/* statuses from Subscription model enum only */}
                        <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className={selectCls}>
                            <option value="all">All status</option>
                            <option value="created">Created</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                            <option value="failed">Failed</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <TH label="#" cls="w-10 pl-4" />
                                    <TH label="Subscriber" col="user" />
                                    <TH label="Plan" />
                                    <TH label="Billing" />
                                    <TH label="Status" col="status" />
                                    <TH label="Start date" />
                                    <TH label="End date" />
                                    <TH label="Next billing" />
                                    <TH label="Created" col="createdAt" />
                                    <TH label="" cls="w-16" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-16">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--primary)" }} />
                                            <p className="text-[12px] text-gray-400">Loading subscriptions…</p>
                                        </td>
                                    </tr>
                                ) : subscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-16">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                                style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                <Award className="w-5 h-5" style={{ color: "var(--primary)" }} />
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-700">No subscriptions found</p>
                                            <p className="text-[11px] text-gray-400 mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : subscriptions.map((s, idx) => {
                                    const days = getDaysRemaining(s.endDate);
                                    const expiringSoon = s.status === "active" && days !== null && days <= 30 && days > 0;

                                    return (
                                        <tr key={s._id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => setDetailId(s._id)}>

                                            <td className="px-4 py-3 text-[11px] text-gray-400">
                                                {(pagination.page - 1) * 15 + idx + 1}
                                            </td>

                                            {/* subscriber */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-white"
                                                        style={{ background: "var(--primary)" }}>
                                                        {s.user?.name?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-medium text-gray-800">{s.user?.name || "Unknown"}</p>
                                                        <p className="text-[10px] text-gray-400">{s.user?.email || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* plan name */}
                                            <td className="px-3 py-3">
                                                <p className="text-[12px] font-medium text-gray-800">{s.plan?.name || "—"}</p>
                                            </td>

                                            {/* billing period + price from populated plan */}
                                            <td className="px-3 py-3">
                                                <p className="text-[11px] text-gray-600 font-medium">{s.plan?.billingPeriod || "—"}</p>
                                                {s.plan?.price != null && (
                                                    <p className="text-[10px] text-gray-400">{fmtCurrency(s.plan.price)}</p>
                                                )}
                                            </td>

                                            {/* status */}
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <StatusPill status={s.status} />
                                                    {expiringSoon && (
                                                        <span className="text-[9px] text-amber-500 font-medium">⚠ {days}d left</span>
                                                    )}
                                                    {s.isAutoRenew && s.status === "active" && (
                                                        <span className="text-[9px] text-emerald-500 flex items-center gap-0.5">
                                                            <Repeat className="w-2.5 h-2.5" /> Auto
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* startDate — correct field name from model */}
                                            <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                                {fmtDate(s.startDate)}
                                            </td>

                                            {/* endDate */}
                                            <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                                {fmtDate(s.endDate)}
                                            </td>

                                            {/* nextBillingDate */}
                                            <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                                {fmtDate(s.nextBillingDate)}
                                            </td>

                                            {/* createdAt */}
                                            <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                                {fmtDate(s.createdAt)}
                                            </td>

                                            {/* view */}
                                            <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setDetailId(s._id)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,white)] transition-all">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {!loading && pagination.total > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-[11px] text-gray-400">
                                Showing <span className="font-medium text-gray-600">
                                    {(pagination.page - 1) * 15 + 1}–{Math.min(pagination.page * 15, pagination.total)}
                                </span> of <span className="font-medium text-gray-600">{pagination.total}</span>
                            </p>
                            <div className="flex items-center gap-1">
                                <PgBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </PgBtn>

                                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                                    .reduce((acc, p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === "…"
                                            ? <span key={`e${i}`} className="px-1.5 text-[11px] text-gray-400">…</span>
                                            : <PgBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PgBtn>
                                    )}

                                <PgBtn disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </PgBtn>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Drawer ── */}
            {detailId && (
                <DetailDrawer
                    id={detailId}
                    onClose={() => setDetailId(null)}
                    onAction={onAction}
                />
            )}
        </>
    );
}

function PgBtn({ children, onClick, disabled, active }) {
    return (
        <button
            onClick={onClick} disabled={disabled}
            className={`min-w-[28px] h-7 px-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${active ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
            style={active ? { background: "var(--primary)" } : {}}>
            {children}
        </button>
    );
}