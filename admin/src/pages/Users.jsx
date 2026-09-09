// pages/UsersPage.jsx
// Admin panel — Users list with full detail drawer
// Stats: user-centric only (total, active, inactive, verified, unverified, new today/month)
// Detail drawer: subscriptions, volunteer, dignitary, donations, payments

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
    Eye, X, Loader2, RefreshCw,
    User, Mail, Phone, Calendar, MapPin,
    Hash, TrendingUp, CheckCircle, XCircle,
    AlertCircle, Award, Clock, CreditCard,
    IndianRupee, Repeat, Shield, UserCheck,
    Briefcase, BadgeCheck, Star, FileText,
    Users, UserX, BadgeAlert, Sparkles,
    ToggleRight,
    ToggleLeft,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

/* ─── status configs ─────────────────────────────────────────────────── */
const ROLE_CFG = {
    donator: { label: "Donator", cls: "bg-sky-50 text-sky-600 border-sky-200", dot: "bg-sky-400" },
    volunteer: { label: "Volunteer", cls: "bg-violet-50 text-violet-600 border-violet-200", dot: "bg-violet-400" },
    dignitary: { label: "Dignitary", cls: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-400" },
};

const SUB_STATUS_CFG = {
    created: { label: "Created", cls: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
    active: { label: "Active", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-400" },
    cancelled: { label: "Cancelled", cls: "bg-orange-50 text-orange-500 border-orange-200", dot: "bg-orange-400" },
    expired: { label: "Expired", cls: "bg-gray-100 text-gray-500 border-gray-300", dot: "bg-gray-400" },
    failed: { label: "Failed", cls: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-400" },
};

const VOL_STATUS_CFG = {
    pending: { label: "Pending", cls: "bg-yellow-50 text-yellow-600 border-yellow-200", dot: "bg-yellow-400" },
    approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-400" },
    rejected: { label: "Rejected", cls: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-400" },
};

const DON_STATUS_CFG = {
    created: { label: "Created", cls: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
    pending: { label: "Pending", cls: "bg-yellow-50 text-yellow-600 border-yellow-200", dot: "bg-yellow-400" },
    paid: { label: "Paid", cls: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-400" },
    failed: { label: "Failed", cls: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-400" },
    cancelled: { label: "Cancelled", cls: "bg-orange-50 text-orange-500 border-orange-200", dot: "bg-orange-400" },
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
const paiseToRupees = p => (p || 0) / 100;

/* ─── reusable small components ──────────────────────────────────────── */
function StatusPill({ status, cfg = ROLE_CFG }) {
    const c = cfg[status] ?? { label: status, cls: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-400" };
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

function Section({ title, icon, children, badge }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                {icon && <span style={{ color: "var(--primary)" }}>{icon}</span>}
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex-1">{title}</p>
                {badge && (
                    <span className="text-[9px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
            </div>
            <div className="bg-white border border-gray-100 rounded-xl px-3 divide-y divide-gray-50">
                {children}
            </div>
        </div>
    );
}

function Row({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span className="flex-shrink-0 mt-px" style={{ color: "var(--primary)" }}>{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-[12px] text-gray-800 mt-0.5 break-words">{value || "—"}</p>
            </div>
        </div>
    );
}

/* ─── Detail Drawer ──────────────────────────────────────────────────── */
function UserDetailDrawer({ id, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("profile");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setTab("profile");
        axiosInstance.get(`/users/${id}`)
            .then(r => setData(r.data))
            .catch(() => toast.error("Failed to load user details"))
            .finally(() => setLoading(false));
    }, [id]);

    const u = data?.user;
    const subscriptions = data?.subscriptions || [];
    const volunteer = data?.volunteer || null;
    const dignitary = data?.dignitary || null;
    const donations = data?.donations || [];
    const payments = data?.payments || [];

    const totalDonated = donations.filter(d => d.status === "paid").reduce((a, d) => a + (d.amount || 0), 0);
    const activeSub = subscriptions.find(s => s.status === "active");

    const TABS = [
        { key: "profile", label: "Profile" },
        { key: "subscriptions", label: "Subs", badge: subscriptions.length || null },
        { key: "volunteer", label: "Volunteer", badge: volunteer ? 1 : null },
        { key: "dignitary", label: "Dignitary", badge: dignitary ? 1 : null },
        { key: "donations", label: "Donations", badge: donations.length || null },
        { key: "payments", label: "Payments", badge: payments.length || null },
    ];

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
            <div className="fixed top-0 right-0 h-full z-50 w-full max-w-[480px] bg-white shadow-2xl flex flex-col">
                {/* top accent */}
                <div className="h-1 flex-shrink-0" style={{ background: "var(--primary)" }} />

                {/* header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        {u?.profileImage ? (
                            <img src={u.profileImage} alt={u.name}
                                className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                        ) : (
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[14px] font-bold text-white"
                                style={{ background: "var(--primary)" }}>
                                {u?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}
                        <div>
                            <p className="text-[14px] font-semibold text-gray-900">{u?.name || "User details"}</p>
                            {u?._id && <p className="text-[10px] text-gray-400 font-mono">{u._id.slice(-8)}</p>}
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* summary strip */}
                {!loading && u && (
                    <div className="px-5 py-3 border-b border-gray-100 flex-shrink-0 flex items-center gap-3 flex-wrap">
                        <StatusPill status={u.role} cfg={ROLE_CFG} />
                        {u.volunteerId && (
                            <span className="text-[10px] font-mono text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">
                                {u.volunteerId}
                            </span>
                        )}
                        {u.dignitaryId && (
                            <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                {u.dignitaryId}
                            </span>
                        )}
                        {activeSub && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
                                ✓ Active sub
                            </span>
                        )}
                        <span className={`text-[10px] rounded-full px-2 py-0.5 border font-medium ml-auto ${u.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-500 border-red-200"}`}>
                            {u.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                )}

                {/* tab bar */}
                {!loading && u && (
                    <div className="flex-shrink-0 flex gap-0.5 px-3 py-2 border-b border-gray-100 overflow-x-auto">
                        {TABS.map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all
                                    ${tab === t.key ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
                                style={tab === t.key ? { background: "var(--primary)" } : {}}>
                                {t.label}
                                {t.badge != null && (
                                    <span className={`text-[9px] font-bold rounded-full px-1 min-w-[14px] text-center leading-[14px]
                                        ${tab === t.key ? "bg-white/30 text-white" : "bg-gray-200 text-gray-500"}`}>
                                        {t.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
                        </div>
                    ) : !u ? null : (

                        /* ── PROFILE ── */
                        tab === "profile" ? (
                            <>
                                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <StatusPill status={u.role} cfg={ROLE_CFG} />
                                        <span className={`text-[10px] font-medium ${u.isPhoneVerified ? "text-emerald-600" : "text-gray-400"}`}>
                                            {u.isPhoneVerified ? "✓ Verified" : "Unverified"}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400">Joined</p>
                                        <p className="text-[11px] font-medium text-gray-600">{fmtDate(u.createdAt)}</p>
                                    </div>
                                </div>

                                <Section title="Contact information" icon={<User className="w-3.5 h-3.5" />}>
                                    <Row icon={<User className="w-3.5 h-3.5" />} label="Name" value={u.name} />
                                    <Row icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={`${u.countryCode || ""} ${u.phone}`} />
                                    <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={u.email} />
                                </Section>

                                <Section title="Personal details" icon={<FileText className="w-3.5 h-3.5" />}>
                                    <Row icon={<User className="w-3.5 h-3.5" />} label="Gender" value={u.gender} />
                                    <Row icon={<Briefcase className="w-3.5 h-3.5" />} label="Occupation" value={u.occupation} />
                                </Section>

                                {(u.address || u.city || u.state || u.country) && (
                                    <Section title="Address" icon={<MapPin className="w-3.5 h-3.5" />}>
                                        <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={u.address} />
                                        <Row icon={<MapPin className="w-3.5 h-3.5" />} label="City" value={u.city} />
                                        <Row icon={<MapPin className="w-3.5 h-3.5" />} label="State" value={u.state} />
                                        <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Country" value={u.country} />
                                        <Row icon={<Hash className="w-3.5 h-3.5" />} label="Pincode" value={u.pincode} />
                                    </Section>
                                )}

                                <Section title="Account" icon={<Shield className="w-3.5 h-3.5" />}>
                                    {u.volunteerId && (
                                        <Row icon={<UserCheck className="w-3.5 h-3.5" />} label="Volunteer ID" value={u.volunteerId} />
                                    )}
                                    {u.dignitaryId && (
                                        <Row icon={<Award className="w-3.5 h-3.5" />} label="Dignitary ID" value={u.dignitaryId} />
                                    )}
                                    <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Last login" value={fmtDateTime(u.lastLoginAt)} />
                                    <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Created at" value={fmtDateTime(u.createdAt)} />
                                    <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Updated at" value={fmtDateTime(u.updatedAt)} />
                                </Section>
                            </>

                            /* ── SUBSCRIPTIONS ── */
                        ) : tab === "subscriptions" ? (
                            <>
                                {subscriptions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                                            style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                            <Award className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                        </div>
                                        <p className="text-[12px] text-gray-500 font-medium">No subscriptions</p>
                                    </div>
                                ) : subscriptions.map(s => {
                                    const days = s.endDate ? Math.ceil((new Date(s.endDate) - new Date()) / 86400000) : null;
                                    return (
                                        <div key={s._id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <StatusPill status={s.status} cfg={SUB_STATUS_CFG} />
                                                    {s.isAutoRenew && s.status === "active" && (
                                                        <span className="text-[9px] text-emerald-500 flex items-center gap-0.5">
                                                            <Repeat className="w-2.5 h-2.5" /> Auto
                                                        </span>
                                                    )}
                                                </div>
                                                {days !== null && s.status === "active" && (
                                                    <span className={`text-[10px] font-medium ${days <= 7 ? "text-red-500" : days <= 30 ? "text-amber-500" : "text-gray-500"}`}>
                                                        {days > 0 ? `${days}d left` : "Expired"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="px-4 py-3 divide-y divide-gray-50">
                                                <Row icon={<Award className="w-3.5 h-3.5" />} label="Plan" value={s.plan?.name} />
                                                <Row icon={<Repeat className="w-3.5 h-3.5" />} label="Billing" value={s.plan?.billingPeriod} />
                                                <Row icon={<IndianRupee className="w-3.5 h-3.5" />} label="Amount" value={s.plan?.price != null ? fmtCurrency(s.plan.price) : "—"} />
                                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Start date" value={fmtDate(s.startDate)} />
                                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="End date" value={fmtDate(s.endDate)} />
                                                {s.nextBillingDate && (
                                                    <Row icon={<Clock className="w-3.5 h-3.5" />} label="Next billing" value={fmtDate(s.nextBillingDate)} />
                                                )}
                                                {s.razorpaySubscriptionId && (
                                                    <Row icon={<Hash className="w-3.5 h-3.5" />} label="Razorpay ID" value={s.razorpaySubscriptionId} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </>

                            /* ── VOLUNTEER ── */
                        ) : tab === "volunteer" ? (
                            <>
                                {!volunteer ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                                            style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                            <UserCheck className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                        </div>
                                        <p className="text-[12px] text-gray-500 font-medium">No volunteer record</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <StatusPill status={volunteer.status} cfg={VOL_STATUS_CFG} />
                                                {volunteer.volunteerId && (
                                                    <span className="text-[10px] font-mono text-violet-600">{volunteer.volunteerId}</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400">Applied</p>
                                                <p className="text-[11px] font-medium text-gray-600">{fmtDate(volunteer.createdAt)}</p>
                                            </div>
                                        </div>

                                        <Section title="Volunteer details" icon={<UserCheck className="w-3.5 h-3.5" />}>
                                            <Row icon={<User className="w-3.5 h-3.5" />} label="Full name" value={volunteer.fullName} />
                                            <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={volunteer.email} />
                                            <Row icon={<Phone className="w-3.5 h-3.5" />} label="Mobile" value={volunteer.mobile} />
                                            <Row icon={<Briefcase className="w-3.5 h-3.5" />} label="Role" value={volunteer.role} />
                                            <Row icon={<FileText className="w-3.5 h-3.5" />} label="Role desc" value={volunteer.roleDesc} />
                                            <Row icon={<Star className="w-3.5 h-3.5" />} label="Contribution" value={volunteer.contribution} />
                                        </Section>

                                        {(volunteer.city || volunteer.state || volunteer.country) && (
                                            <Section title="Location" icon={<MapPin className="w-3.5 h-3.5" />}>
                                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="City" value={volunteer.city} />
                                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="State" value={volunteer.state} />
                                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Country" value={volunteer.country} />
                                                <Row icon={<Hash className="w-3.5 h-3.5" />} label="Pincode" value={volunteer.pincode} />
                                            </Section>
                                        )}

                                        {(volunteer.dignitaryCode || volunteer.dignitaryName) && (
                                            <Section title="Dignitary reference" icon={<Award className="w-3.5 h-3.5" />}>
                                                <Row icon={<Hash className="w-3.5 h-3.5" />} label="Code" value={volunteer.dignitaryCode} />
                                                <Row icon={<User className="w-3.5 h-3.5" />} label="Name" value={volunteer.dignitaryName} />
                                            </Section>
                                        )}

                                        {volunteer.status === "rejected" && volunteer.rejectedReason && (
                                            <Section title="Rejection reason" icon={<XCircle className="w-3.5 h-3.5" />}>
                                                <div className="px-3 py-2.5">
                                                    <p className="text-[12px] text-red-600">{volunteer.rejectedReason}</p>
                                                </div>
                                            </Section>
                                        )}

                                        <Section title="Timeline">
                                            {volunteer.adminApprovedAt && (
                                                <Row icon={<CheckCircle className="w-3.5 h-3.5" />} label="Approved at" value={fmtDateTime(volunteer.adminApprovedAt)} />
                                            )}
                                            <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Created at" value={fmtDateTime(volunteer.createdAt)} />
                                        </Section>
                                    </>
                                )}
                            </>

                            /* ── DIGNITARY ── */
                        ) : tab === "dignitary" ? (
                            <>
                                {!dignitary ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                                            style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                            <Award className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                        </div>
                                        <p className="text-[12px] text-gray-500 font-medium">No dignitary record</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <StatusPill status={dignitary.status} cfg={VOL_STATUS_CFG} />
                                                {dignitary.dignitaryId && (
                                                    <span className="text-[10px] font-mono text-amber-600">{dignitary.dignitaryId}</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400">Applied</p>
                                                <p className="text-[11px] font-medium text-gray-600">{fmtDate(dignitary.createdAt)}</p>
                                            </div>
                                        </div>

                                        <Section title="Dignitary details" icon={<Award className="w-3.5 h-3.5" />}>
                                            <Row icon={<User className="w-3.5 h-3.5" />} label="Full name" value={dignitary.fullName} />
                                            <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={dignitary.email} />
                                            <Row icon={<Phone className="w-3.5 h-3.5" />} label="Mobile" value={dignitary.mobile} />
                                            <Row icon={<Star className="w-3.5 h-3.5" />} label="Dignitary name" value={dignitary.dignitaryName} />
                                            <Row icon={<Briefcase className="w-3.5 h-3.5" />} label="Role" value={dignitary.role} />
                                            <Row icon={<FileText className="w-3.5 h-3.5" />} label="Place type" value={dignitary.placeType} />
                                        </Section>

                                        <Section title="Place / Institution" icon={<MapPin className="w-3.5 h-3.5" />}>
                                            <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Full address" value={dignitary.fullAddress} />
                                            <Row icon={<MapPin className="w-3.5 h-3.5" />} label="City" value={dignitary.placeCity} />
                                            <Row icon={<MapPin className="w-3.5 h-3.5" />} label="State" value={dignitary.placeState} />
                                            <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Country" value={dignitary.placeCountry} />
                                            <Row icon={<Hash className="w-3.5 h-3.5" />} label="Pincode" value={dignitary.placePincode} />
                                        </Section>

                                        {dignitary.status === "rejected" && dignitary.rejectedReason && (
                                            <Section title="Rejection reason" icon={<XCircle className="w-3.5 h-3.5" />}>
                                                <div className="px-3 py-2.5">
                                                    <p className="text-[12px] text-red-600">{dignitary.rejectedReason}</p>
                                                </div>
                                            </Section>
                                        )}

                                        <Section title="Timeline">
                                            {dignitary.approvedAt && (
                                                <Row icon={<CheckCircle className="w-3.5 h-3.5" />} label="Approved at" value={fmtDateTime(dignitary.approvedAt)} />
                                            )}
                                            {dignitary.rejectedAt && (
                                                <Row icon={<XCircle className="w-3.5 h-3.5" />} label="Rejected at" value={fmtDateTime(dignitary.rejectedAt)} />
                                            )}
                                            <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Created at" value={fmtDateTime(dignitary.createdAt)} />
                                        </Section>
                                    </>
                                )}
                            </>

                            /* ── DONATIONS ── */
                        ) : tab === "donations" ? (
                            <>
                                {donations.length > 0 && (
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/40 rounded-xl px-4 py-3 border border-blue-200 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wide mb-0.5">Total donated</p>
                                            <p className="text-[20px] font-bold text-blue-700">{fmtCurrency(totalDonated)}</p>
                                        </div>
                                        <span className="text-[11px] text-blue-500">{donations.length} donation{donations.length !== 1 ? "s" : ""}</span>
                                    </div>
                                )}
                                {donations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                                            style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                            <IndianRupee className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                        </div>
                                        <p className="text-[12px] text-gray-500 font-medium">No donations</p>
                                    </div>
                                ) : donations.map(d => (
                                    <div key={d._id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                                        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <StatusPill status={d.status} cfg={DON_STATUS_CFG} />
                                                <span className="text-[9px] text-gray-400 capitalize">{d.mode}</span>
                                            </div>
                                            <span className="text-[13px] font-bold text-gray-800">{fmtCurrency(d.amount, d.currency)}</span>
                                        </div>
                                        <div className="px-4 py-3 divide-y divide-gray-50">
                                            <Row icon={<User className="w-3.5 h-3.5" />} label="Donor" value={d.fullName} />
                                            {d.purpose && <Row icon={<FileText className="w-3.5 h-3.5" />} label="Purpose" value={d.purpose} />}
                                            {d.message && <Row icon={<FileText className="w-3.5 h-3.5" />} label="Message" value={d.message} />}
                                            {d.offlineReference && <Row icon={<Hash className="w-3.5 h-3.5" />} label="Reference" value={d.offlineReference} />}
                                            <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Date" value={fmtDate(d.paidAt || d.createdAt)} />
                                        </div>
                                    </div>
                                ))}
                            </>

                            /* ── PAYMENTS ── */
                        ) : tab === "payments" ? (
                            <>
                                {payments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                                            style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                            <CreditCard className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                        </div>
                                        <p className="text-[12px] text-gray-500 font-medium">No payments</p>
                                    </div>
                                ) : payments.map(p => (
                                    <div key={p._id}
                                        className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                <CreditCard className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[12px] font-semibold text-gray-800">
                                                        {fmtCurrency(paiseToRupees(p.amount), p.currency)}
                                                    </p>
                                                    <span className="text-[9px] text-gray-400 capitalize bg-gray-100 rounded px-1">{p.type}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400">{fmtDateTime(p.createdAt)}</p>
                                                {p.razorpayPaymentId && (
                                                    <p className="text-[9px] text-gray-300 font-mono truncate">{p.razorpayPaymentId}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <StatusPill status={p.status} cfg={{
                                                created: { label: "Created", cls: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
                                                paid: { label: "Paid", cls: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-400" },
                                                active: { label: "Active", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-400" },
                                                failed: { label: "Failed", cls: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-400" },
                                                cancelled: { label: "Cancelled", cls: "bg-orange-50 text-orange-500 border-orange-200", dot: "bg-orange-400" },
                                                refunded: { label: "Refunded", cls: "bg-purple-50 text-purple-500 border-purple-200", dot: "bg-purple-400" },
                                            }} />
                                            {p.method && (
                                                <span className="text-[9px] text-gray-400 capitalize">{p.method}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : null
                    )}
                </div>
            </div>
        </>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
// API:
//   GET /users/stats → { total, active, inactive, phoneVerified, phoneUnverified, newToday, newThisMonth }
//   GET /users?page&limit&role&search&sortBy&sortOrder → { users, pagination }
//   GET /users/:id   → { user, subscriptions, volunteer, dignitary, donations, payments }
export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [stats, setStats] = useState({
        total: 0, active: 0, inactive: 0,
        phoneVerified: 0, phoneUnverified: 0,
        newToday: 0, newThisMonth: 0,
    });
    const [loading, setLoading] = useState(true);
    const [detailId, setDetailId] = useState(null);

    // filters
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [roleF, setRoleF] = useState("all");
    const [activeF, setActiveF] = useState("all");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const fetchStats = () =>
        axiosInstance.get("/users/stats")
            .then(r => setStats(r.data))
            .catch(() => { });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15, sortBy, sortOrder };
            if (roleF !== "all") params.role = roleF;
            if (activeF !== "all") params.isActive = activeF === "active";
            if (search) params.search = search;
            const { data } = await axiosInstance.get("/users", { params });
            setUsers(data.users);
            setPagination(data.pagination);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [page, roleF, activeF, search, sortBy, sortOrder]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

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

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await axiosInstance.patch(`/users/${id}/toggle-active`);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
            toast.success(currentStatus ? "User blocked" : "User unblocked");
            fetchStats();
        } catch {
            toast.error("Failed to update user status");
        }
    };
    return (
        <>
            <div className="max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: "var(--primary)" }}>
                            <User className="w-[18px] h-[18px] text-white" />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-semibold text-gray-900">Users</h1>
                            <p className="text-[11px] text-gray-400">Manage all registered users</p>
                        </div>
                    </div>
                    <button onClick={() => { fetchUsers(); fetchStats(); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[12px] text-gray-500 font-medium hover:bg-gray-50 transition-all">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                </div>

                {/* ── Stats — user-centric only ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <StatCard
                        label="Total users"
                        value={stats.total}
                        icon={<Users className="w-4 h-4" />}
                        color="#8B5CF6"
                    />
                    <StatCard
                        label="Active"
                        value={stats.active}
                        icon={<CheckCircle className="w-4 h-4" />}
                        color="#22C55E"
                    />
                    <StatCard
                        label="Inactive"
                        value={stats.inactive}
                        icon={<UserX className="w-4 h-4" />}
                        color="#94A3B8"
                    />
                    <StatCard
                        label="Phone verified"
                        value={stats.phoneVerified}
                        icon={<BadgeCheck className="w-4 h-4" />}
                        color="#0EA5E9"
                    />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    <StatCard
                        label="Unverified"
                        value={stats.phoneUnverified}
                        icon={<BadgeAlert className="w-4 h-4" />}
                        color="#F59E0B"
                    />
                    <StatCard
                        label="New today"
                        value={stats.newToday}
                        icon={<Sparkles className="w-4 h-4" />}
                        color="#EC4899"
                    />
                    <StatCard
                        label="New this month"
                        value={stats.newThisMonth}
                        icon={<TrendingUp className="w-4 h-4" />}
                        color="#6366F1"
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
                    {/* <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={roleF} onChange={e => { setRoleF(e.target.value); setPage(1); }} className={selectCls}>
                            <option value="all">All roles</option>
                            <option value="donator">Donator</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="dignitary">Dignitary</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div> */}
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={activeF} onChange={e => { setActiveF(e.target.value); setPage(1); }} className={selectCls}>
                            <option value="all">All status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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
                                    <TH label="User" col="name" />
                                    <TH label="Phone" />
                                    {/* <TH label="Role" col="role" /> */}
                                    <TH label="ID" />
                                    {/* <TH label="Verified" /> */}
                                    <TH label="Status" col="isActive" />
                                    <TH label="Last login" col="lastLoginAt" />
                                    <TH label="Joined" col="createdAt" />
                                    <TH label="" cls="w-16" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-16">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--primary)" }} />
                                            <p className="text-[12px] text-gray-400">Loading users…</p>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-16">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                                style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                <User className="w-5 h-5" style={{ color: "var(--primary)" }} />
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-700">No users found</p>
                                            <p className="text-[11px] text-gray-400 mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : users.map((u, idx) => (
                                    <tr key={u._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setDetailId(u._id)}>

                                        <td className="px-4 py-3 text-[11px] text-gray-400">
                                            {(pagination.page - 1) * 15 + idx + 1}
                                        </td>

                                        {/* user */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                {u.profileImage ? (
                                                    <img src={u.profileImage} alt={u.name}
                                                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-white"
                                                        style={{ background: "var(--primary)" }}>
                                                        {u.name?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[12px] font-medium text-gray-800">{u.name || "—"}</p>
                                                    <p className="text-[10px] text-gray-400">{u.email || "—"}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* phone */}
                                        <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-nowrap">
                                            {u.countryCode} {u.phone}
                                        </td>

                                        {/* role
                                        <td className="px-3 py-3">
                                            <StatusPill status={u.role} cfg={ROLE_CFG} />
                                        </td> */}

                                        {/* volunteer/dignitary ID */}
                                        <td className="px-2 py-3">
                                            <span className="text-[10px]  text-amber-600">{u.clientId}</span>

                                        </td>

                                        {/* phone verified
                                        <td className="px-3 py-3">
                                            {u.isPhoneVerified
                                                ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                : <XCircle className="w-4 h-4 text-gray-300" />}
                                        </td> */}

                                        {/* active status */}
                                        <td className="px-3 py-3">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border
                                                ${u.isActive
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                    : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-400" : "bg-gray-400"}`} />
                                                {u.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        {/* last login */}
                                        <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                            {fmtDate(u.lastLoginAt)}
                                        </td>

                                        {/* joined */}
                                        <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                            {fmtDate(u.createdAt)}
                                        </td>

                                        {/* view */}
                                        <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleToggleActive(u._id, u.isActive)}
                                                    title={u.isActive ? "Block user" : "Unblock user"}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
                ${u.isActive
                                                            ? "text-gray-300 hover:text-red-500 hover:bg-red-50"
                                                            : "text-gray-300 hover:text-emerald-500 hover:bg-emerald-50"}`}>
                                                    {u.isActive
                                                        ? <ToggleRight className="w-3.5 h-3.5" />
                                                        : <ToggleLeft className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => setDetailId(u._id)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,white)] transition-all">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                <UserDetailDrawer
                    id={detailId}
                    onClose={() => setDetailId(null)}
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