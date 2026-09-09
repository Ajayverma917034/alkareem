// pages/DonationsPage.jsx

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
    Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
    Eye, Check, X, Trash2, Loader2, RefreshCw,
    User, Mail, Phone, DollarSign, FileText,
    Calendar, Hash, Download, RotateCcw,
    TrendingUp, Clock, CheckCircle, XCircle,
    CreditCard, Wallet, IndianRupee, MessageSquare,
    FileSpreadsheet,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
function ExportModal({ onClose }) {
    const today = new Date().toISOString().slice(0, 10);
    const [format, setFormat] = useState("xlsx");
    const [preset, setPreset] = useState("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState(today);
    const [status, setStatus] = useState("all");
    const [mode, setMode] = useState("all");
    const [count, setCount] = useState(null);
    const [loading, setLoading] = useState(false);
    const countTimer = useRef(null);

    useEffect(() => {
        if (preset === "7d") {
            const d = new Date(); d.setDate(d.getDate() - 7);
            setFrom(d.toISOString().slice(0, 10)); setTo(today);
        } else if (preset === "30d") {
            const d = new Date(); d.setDate(d.getDate() - 30);
            setFrom(d.toISOString().slice(0, 10)); setTo(today);
        } else if (preset === "all") {
            setFrom(""); setTo(today);
        }
    }, [preset]);

    useEffect(() => {
        clearTimeout(countTimer.current);
        countTimer.current = setTimeout(async () => {
            try {
                const p = new URLSearchParams({ status, mode });
                if (from) p.set("from", from);
                if (to) p.set("to", to);
                const { data } = await axiosInstance.get(`/donations/export/count?${p}`);
                setCount(data.count);
            } catch { setCount(null); }
        }, 350);
        return () => clearTimeout(countTimer.current);
    }, [from, to, status, mode]);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ format, status, mode });
            if (from) p.set("from", from);
            if (to) p.set("to", to);

            const res = await axiosInstance.get(`/donations/export?${p}`, { responseType: "blob" });

            const ext = format === "xlsx" ? "xlsx" : "csv";
            const mime = format === "xlsx"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv";

            const url = URL.createObjectURL(new Blob([res.data], { type: mime }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `donations_${status}_${Date.now()}.${ext}`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Export downloaded!");
            onClose();
        } catch {
            toast.error("Export failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const presetBtn = (key, label) => (
        <button key={key} onClick={() => setPreset(key)}
            className={`py-1.5 rounded-lg text-[11px] font-medium border transition-all ${preset === key
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
            style={preset === key ? { background: "color-mix(in srgb, var(--primary) 8%, white)" } : {}}
        >{label}</button>
    );

    const pill = (val, label, current, setter) => (
        <button key={val} onClick={() => setter(val)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${current === val
                ? "text-[var(--primary)] border-[var(--primary)]"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
            style={current === val ? { background: "color-mix(in srgb, var(--primary) 8%, white)" } : {}}
        >{label}</button>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-[3px]" style={{ background: "var(--primary)" }} />
                <div className="p-5 space-y-4">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: "color-mix(in srgb, var(--primary) 12%, white)" }}>
                                <Download className="w-4 h-4" style={{ color: "var(--primary)" }} />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-gray-900">Export donations</p>
                                <p className="text-[11px] text-gray-400">Choose format, filters and date range</p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Format */}
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 mb-2">Format</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { key: "xlsx", label: "Excel", sub: ".xlsx file", Icon: FileSpreadsheet },
                                { key: "csv", label: "CSV", sub: ".csv file", Icon: FileText },
                            ].map(({ key, label, sub, Icon }) => (
                                <button key={key} onClick={() => setFormat(key)}
                                    className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all"
                                    style={{
                                        borderColor: format === key ? "var(--primary)" : "#e5e7eb",
                                        borderWidth: format === key ? 2 : 1,
                                        background: format === key ? "color-mix(in srgb, var(--primary) 6%, white)" : "",
                                    }}>
                                    <Icon className="w-5 h-5 flex-shrink-0"
                                        style={{ color: format === key ? "var(--primary)" : "#9ca3af" }} />
                                    <div>
                                        <p className="text-[12px] font-semibold"
                                            style={{ color: format === key ? "var(--primary)" : "#374151" }}>{label}</p>
                                        <p className="text-[10px]"
                                            style={{ color: format === key ? "var(--primary)" : "#9ca3af" }}>{sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date range */}
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 mb-2">Date range</p>
                        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                            {presetBtn("7d", "Last 7 days")}
                            {presetBtn("30d", "Last 30 days")}
                            {presetBtn("all", "All time")}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-[10px] text-gray-400 mb-1">From</p>
                                <input type="date" value={from} max={to || today}
                                    onChange={e => { setFrom(e.target.value); setPreset("custom"); }}
                                    onFocus={e => e.target.style.borderColor = "var(--primary)"}
                                    onBlur={e => e.target.style.borderColor = ""}
                                    className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none transition-all" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 mb-1">To</p>
                                <input type="date" value={to} min={from} max={today}
                                    onChange={e => { setTo(e.target.value); setPreset("custom"); }}
                                    onFocus={e => e.target.style.borderColor = "var(--primary)"}
                                    onBlur={e => e.target.style.borderColor = ""}
                                    className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Status filter */}
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 mb-2">
                            Status <span className="font-normal text-gray-400">(optional)</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {[["all", "All"], ["created", "Created"], ["pending", "Pending"], ["paid", "Paid"], ["failed", "Failed"], ["cancelled", "Cancelled"]]
                                .map(([v, l]) => pill(v, l, status, setStatus))}
                        </div>
                    </div>

                    {/* Mode filter */}
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 mb-2">
                            Mode <span className="font-normal text-gray-400">(optional)</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {[["all", "All"], ["online", "Online"], ["offline", "Offline"]]
                                .map(([v, l]) => pill(v, l, mode, setMode))}
                        </div>
                    </div>

                    {/* Record count */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[11px] text-gray-400">Estimated records</span>
                        <span className="text-[13px] font-semibold text-gray-800">
                            {count === null ? "—" : `${count} donation${count !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    {/* CTA */}
                    <button onClick={handleDownload} disabled={loading || count === 0}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ background: "var(--primary)" }}>
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing…</>
                            : <><Download className="w-4 h-4" /> Download {format === "xlsx" ? "Excel" : "CSV"}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
/* ─── constants ──────────────────────────────────────────────────────── */
const STATUS_CFG = {
    created: { label: "Created", cls: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" },
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-400" },
    paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-400" },
    failed: { label: "Failed", cls: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-400" },
    cancelled: { label: "Cancelled", cls: "bg-orange-50 text-orange-500 border-orange-200", dot: "bg-orange-400" },
};

const MODE_CFG = {
    online: { label: "Online", cls: "bg-blue-50 text-blue-600 border-blue-200" },
    offline: { label: "Offline", cls: "bg-purple-50 text-purple-600 border-purple-200" },
};

/* ─── tiny helpers ───────────────────────────────────────────────────── */
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = d => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtCurrency = (amt, curr = "INR") => {
    if (!amt && amt !== 0) return "—";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: curr,
        maximumFractionDigits: 0,
    }).format(amt);
};

function StatusPill({ status }) {
    const c = STATUS_CFG[status] ?? STATUS_CFG.created;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

function ModePill({ mode }) {
    const c = MODE_CFG[mode] ?? MODE_CFG.online;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.cls}`}>
            {mode === "online" ? <CreditCard className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
            {c.label}
        </span>
    );
}

function StatCard({ label, value, icon, color, subtitle }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}14` }}>
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

/* ─── Verify Modal ───────────────────────────────────────────────────── */
function VerifyModal({ donation, onClose, onConfirm, loading }) {
    const [notes, setNotes] = useState("");
    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-1" style={{ background: "var(--primary)" }} />
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-gray-900">Verify donation</h3>
                            <p className="text-[11px] text-gray-400">{donation?.fullName} · {fmtCurrency(donation?.amount)}</p>
                        </div>
                    </div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                        Verification notes (optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Add any notes about this verification…"
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 outline-none focus:border-emerald-400 resize-none transition-all"
                    />
                    <div className="flex gap-2 mt-4">
                        <button onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 font-medium hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(notes)}
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-[12px] text-white font-medium hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Verify
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Detail Drawer ──────────────────────────────────────────────────── */
function DetailDrawer({ id, onClose, onAction }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null);
    const [showVerify, setShowVerify] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        axiosInstance.get(`/donations/${id}`)
            .then(r => setData(r.data))
            .catch(() => toast.error("Failed to load details"))
            .finally(() => setLoading(false));
    }, [id]);

    const act = async (action, extra) => {
        setActing(action);
        try {
            let res;
            if (action === "verify") {
                res = await axiosInstance.put(`/donations/${id}/verify`, { notes: extra });
            } else if (action === "cancel") {
                res = await axiosInstance.put(`/donations/${id}/cancel`);
            } else if (action === "delete") {
                await axiosInstance.delete(`/donations/${id}`);
                toast.success("Donation deleted");
                onAction();
                onClose();
                return;
            }
            setData(res.data.donation);
            toast.success(res.data.message);
            onAction();
            setShowVerify(false);
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

    return (
        <>
            {/* overlay */}
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

            {/* drawer */}
            <div className="fixed top-0 right-0 h-full z-50 w-full max-w-[440px] bg-white shadow-2xl flex flex-col">
                {/* top accent */}
                <div className="h-1 flex-shrink-0" style={{ background: "var(--primary)" }} />

                {/* header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
                            <IndianRupee className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-gray-900">Donation details</p>
                            {data?._id && (
                                <p className="text-[10px] text-gray-400 font-mono">{data._id.slice(-8)}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
                        </div>
                    ) : data ? (
                        <>
                            {/* status row */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <StatusPill status={data.status} />
                                    <ModePill mode={data.mode} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400">Created</p>
                                    <p className="text-[11px] font-medium text-gray-600">{fmtDate(data.createdAt)}</p>
                                </div>
                            </div>

                            {/* amount highlight */}
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl px-5 py-4 text-center border border-emerald-200">
                                <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide mb-1">Donation amount</p>
                                <p className="text-[28px] font-bold text-emerald-700">{fmtCurrency(data.amount, data.currency)}</p>
                                {data.purpose && (
                                    <p className="text-[11px] text-emerald-600 mt-1">Purpose: {data.purpose}</p>
                                )}
                            </div>

                            {/* donor info */}
                            <Section title="Donor information">
                                <Row icon={<User className="w-3.5 h-3.5" />} label="Full name" value={data.fullName} />
                                <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={data.email} />
                                <Row icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={data.phone} />
                            </Section>

                            {/* donation details */}
                            <Section title="Donation details">
                                <Row icon={<IndianRupee className="w-3.5 h-3.5" />} label="Amount" value={fmtCurrency(data.amount, data.currency)} />
                                <Row icon={<CreditCard className="w-3.5 h-3.5" />} label="Mode" value={data.mode === "online" ? "Online Payment" : "Offline Payment"} />
                                <Row icon={<FileText className="w-3.5 h-3.5" />} label="Purpose" value={data.purpose} />
                                {data.mode === "offline" && (
                                    <Row icon={<Hash className="w-3.5 h-3.5" />} label="Reference" value={data.offlineReference} />
                                )}
                            </Section>

                            {/* messages */}
                            {(data.message || data.notes) && (
                                <Section title="Messages & notes">
                                    {data.message && (
                                        <Row icon={<MessageSquare className="w-3.5 h-3.5" />} label="Donor message" value={data.message} />
                                    )}
                                    {data.notes && (
                                        <Row icon={<FileText className="w-3.5 h-3.5" />} label="Admin notes" value={data.notes} />
                                    )}
                                </Section>
                            )}

                            {data.documents?.length > 0 && (
                                <Section title="Documents">
                                    <div className="space-y-2">
                                        {data.documents.map((doc, index) => (
                                            <a
                                                key={index}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                                            >
                                                <FileText className="w-4 h-4 text-blue-500" />

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-700 truncate">
                                                        {doc.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {doc.fileType}
                                                    </p>
                                                </div>

                                                <Download className="w-4 h-4 text-gray-400" />
                                            </a>
                                        ))}
                                    </div>
                                </Section>
                            )}
                            {/* timeline */}
                            <Section title="Timeline">
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Created at" value={fmtDateTime(data.createdAt)} />
                                {data.paidAt && (
                                    <Row icon={<CheckCircle className="w-3.5 h-3.5" />} label="Paid at" value={fmtDateTime(data.paidAt)} />
                                )}
                                {data.verifiedAt && (
                                    <Row icon={<CheckCircle className="w-3.5 h-3.5" />} label="Verified at" value={fmtDateTime(data.verifiedAt)} />
                                )}
                                {data.verifiedBy && (
                                    <Row icon={<User className="w-3.5 h-3.5" />} label="Verified by" value={data.verifiedBy.name || data.verifiedBy.email} />
                                )}
                            </Section>

                            {/* payment info */}
                            {data.payment && (
                                <Section title="Payment information">
                                    <Row icon={<Hash className="w-3.5 h-3.5" />} label="Payment ID" value={data.payment._id || data.payment} />
                                    {data.payment.razorpayOrderId && (
                                        <Row icon={<Hash className="w-3.5 h-3.5" />} label="Razorpay order ID" value={data.payment.razorpayOrderId} />
                                    )}
                                    {data.payment.razorpayPaymentId && (
                                        <Row icon={<Hash className="w-3.5 h-3.5" />} label="Razorpay payment ID" value={data.payment.razorpayPaymentId} />
                                    )}
                                </Section>
                            )}
                        </>
                    ) : null}
                </div>

                {/* action footer */}
                {data && (
                    <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 space-y-2.5">
                        {data.mode === "offline" && data.status !== "paid" && (
                            <ActionBtn
                                label="Verify payment" icon={<CheckCircle className="w-3.5 h-3.5" />}
                                onClick={() => setShowVerify(true)}
                                cls="bg-emerald-500 hover:bg-emerald-600 text-white w-full" />
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            {/* Only offline donations can be cancelled */}
                            {data.mode === "offline" && ["pending", "created"].includes(data.status) && (
                                <ActionBtn
                                    label="Cancel" icon={<XCircle className="w-3.5 h-3.5" />}
                                    loading={acting === "cancel"}
                                    onClick={() => {
                                        if (confirm("Cancel this offline donation?")) act("cancel");
                                    }}
                                    cls="bg-orange-50 hover:bg-orange-100 text-orange-500 border border-orange-200" />
                            )}
                            <ActionBtn
                                label="Delete" icon={<Trash2 className="w-3.5 h-3.5" />}
                                loading={acting === "delete"}
                                onClick={() => { if (confirm("Delete this donation permanently?")) act("delete"); }}
                                cls={`bg-red-500 hover:bg-red-600 text-white ${data.mode === "offline" && ["pending", "created"].includes(data.status) ? "" : "col-span-2"}`} />
                        </div>
                    </div>
                )}
            </div>

            {showVerify && (
                <VerifyModal
                    donation={data}
                    onClose={() => setShowVerify(false)}
                    onConfirm={notes => act("verify", notes)}
                    loading={acting === "verify"}
                />
            )}
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
export default function Donations() {
    const [donations, setDonations] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [stats, setStats] = useState({
        total: 0,
        totalAmount: 0,
        pending: 0,
        paid: 0,
        failed: 0,
        onlineCount: 0,
        offlineCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [detailId, setDetailId] = useState(null);

    // filters
    const [search, setSearch] = useState("");
    const [statusF, setStatusF] = useState("all");
    const [modeF, setModeF] = useState("all");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [showExport, setShowExport] = useState(false);
    const fetchStats = () =>
        axiosInstance.get("/donations/stats").then(r => setStats(r.data)).catch(() => { });

    const fetchDonations = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, status: statusF, mode: modeF, search, sortBy, sortOrder };
            const { data } = await axiosInstance.get("/donations", { params });
            setDonations(data.donations);
            setPagination(data.pagination);
        } catch { toast.error("Failed to load donations"); }
        finally { setLoading(false); }
    }, [page, statusF, modeF, search, sortBy, sortOrder]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchDonations(); }, [fetchDonations]);

    // debounce search
    const [searchInput, setSearchInput] = useState("");
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const onAction = () => { fetchDonations(); fetchStats(); };

    const toggleSort = col => {
        if (sortBy === col) setSortOrder(o => o === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortOrder("desc"); }
    };

    const TH = ({ label, col, cls = "" }) => (
        <th
            onClick={col ? () => toggleSort(col) : undefined}
            className={`px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${col ? "cursor-pointer hover:text-gray-600 select-none" : ""} ${cls}`}>
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
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: "var(--primary)" }}>
                            <IndianRupee className="w-[18px] h-[18px] text-white" />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-semibold text-gray-900">Donations</h1>
                            <p className="text-[11px] text-gray-400">Track and manage all donations</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowExport(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[12px] text-gray-500 font-medium hover:bg-gray-50 transition-all">
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                        <button onClick={() => { fetchDonations(); fetchStats(); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[12px] text-gray-500 font-medium hover:bg-gray-50 transition-all">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <StatCard
                        label="Total donations"
                        value={stats.total}
                        subtitle={fmtCurrency(stats.totalAmount)}
                        icon={<TrendingUp className="w-4 h-4" />}
                        color="#8B5CF6"
                    />
                    <StatCard
                        label="Pending"
                        value={stats.pending}
                        icon={<Clock className="w-4 h-4" />}
                        color="#F59E0B"
                    />
                    <StatCard
                        label="Paid"
                        value={stats.paid}
                        icon={<CheckCircle className="w-4 h-4" />}
                        color="#22C55E"
                    />
                    <StatCard
                        label="Failed"
                        value={stats.failed}
                        icon={<XCircle className="w-4 h-4" />}
                        color="#EF4444"
                    />
                </div>

                {/* Mode stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatCard
                        label="Online payments"
                        value={stats.onlineCount}
                        icon={<CreditCard className="w-4 h-4" />}
                        color="#3B82F6"
                    />
                    <StatCard
                        label="Offline payments"
                        value={stats.offlineCount}
                        icon={<Wallet className="w-4 h-4" />}
                        color="#A855F7"
                    />
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 mb-4 flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text" placeholder="Search by name, email, Donation Id, purpose…"
                            value={searchInput} onChange={e => setSearchInput(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 focus:border-[var(--primary)] outline-none transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className={selectCls}>
                            <option value="all">All status</option>
                            <option value="created">Created</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={modeF} onChange={e => { setModeF(e.target.value); setPage(1); }} className={selectCls}>
                            <option value="all">All modes</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <TH label="#" cls="w-10 pl-4" />
                                    <TH label="Donor" col="fullName" />
                                    <TH label="Donation Id" col="donationId" />
                                    <TH label="Amount" col="amount" />
                                    <TH label="Purpose" />
                                    <TH label="Mode" col="mode" />
                                    <TH label="Status" col="status" />
                                    <TH label="Created" col="createdAt" />
                                    <TH label="Paid at" />
                                    <TH label="" cls="w-16" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-16">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--primary)" }} />
                                            <p className="text-[12px] text-gray-400">Loading donations…</p>
                                        </td>
                                    </tr>
                                ) : donations.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-16">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                                style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                <IndianRupee className="w-5 h-5" style={{ color: "var(--primary)" }} />
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-700">No donations found</p>
                                            <p className="text-[11px] text-gray-400 mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : donations.map((d, idx) => (
                                    <tr key={d._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setDetailId(d._id)}>
                                        <td className="px-4 py-3 text-[11px] text-gray-400">
                                            {(pagination.page - 1) * 15 + idx + 1}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-white"
                                                    style={{ background: "var(--primary)" }}>
                                                    {d.fullName?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-medium text-gray-800">{d.fullName}</p>
                                                    <p className="text-[10px] text-gray-400">{d.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-[13px] font-semibold text-gray-900">
                                                {d.donationId}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-[13px] font-semibold text-gray-900">
                                                {fmtCurrency(d.amount, d.currency)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-[12px] text-gray-600 max-w-[140px] truncate">
                                            {d.purpose || "—"}
                                        </td>
                                        <td className="px-3 py-3"><ModePill mode={d.mode} /></td>
                                        <td className="px-3 py-3"><StatusPill status={d.status} /></td>
                                        <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                            {fmtDate(d.createdAt)}
                                        </td>
                                        <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                            {fmtDate(d.paidAt)}
                                        </td>
                                        <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => setDetailId(d._id)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,white)] transition-all">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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

            {/* Detail Drawer */}
            {detailId && (
                <DetailDrawer
                    id={detailId}
                    onClose={() => setDetailId(null)}
                    onAction={onAction}
                />
            )}
            {showExport && <ExportModal onClose={() => setShowExport(false)} />}
        </>
    );
}

function PgBtn({ children, onClick, disabled, active }) {
    return (
        <button
            onClick={onClick} disabled={disabled}
            className={`min-w-[28px] h-7 px-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${active
                    ? "text-white"
                    : "text-gray-500 hover:bg-gray-100"}`}
            style={active ? { background: "var(--primary)" } : {}}>
            {children}
        </button>
    );
}