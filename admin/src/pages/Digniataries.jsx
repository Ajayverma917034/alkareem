// pages/DignitariesPage.jsx

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
    Eye, Check, X, Trash2, Loader2, RefreshCw,
    User, Mail, Phone, MapPin, FileText,
    Award, Calendar, Hash, Download, RotateCcw,
    Users, Clock, CheckCircle, XCircle, Building2,
    ShieldCheck, BadgeCheck, Crown,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { useRef } from "react";
import { FileSpreadsheet, } from "lucide-react";

/* ─── Export Modal ───────────────────────────────────────────────────── */
function ExportModal({ onClose }) {
    const today = new Date().toISOString().slice(0, 10);
    const [format, setFormat] = useState("xlsx");
    const [preset, setPreset] = useState("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState(today);
    const [status, setStatus] = useState("all");
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
                const p = new URLSearchParams({ status });
                if (from) p.set("from", from);
                if (to) p.set("to", to);
                const { data } = await axiosInstance.get(`/dignitaries/export/count?${p}`);
                setCount(data.count);
            } catch { setCount(null); }
        }, 350);
        return () => clearTimeout(countTimer.current);
    }, [from, to, status]);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ format, status });
            if (from) p.set("from", from);
            if (to) p.set("to", to);

            const res = await axiosInstance.get(`/dignitaries/export?${p}`, { responseType: "blob" });

            const ext = format === "xlsx" ? "xlsx" : "csv";
            const mime = format === "xlsx"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv";

            const url = URL.createObjectURL(new Blob([res.data], { type: mime }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `dignitaries_${status}_${Date.now()}.${ext}`;
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
        <button
            key={key}
            onClick={() => setPreset(key)}
            className={`py-1.5 rounded-lg text-[11px] font-medium border transition-all ${preset === key
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
            style={preset === key ? { background: "color-mix(in srgb, var(--primary) 8%, white)" } : {}}
        >{label}</button>
    );

    const statusPill = (val, label) => (
        <button
            key={val}
            onClick={() => setStatus(val)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${status === val
                ? "text-[var(--primary)] border-[var(--primary)]"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
            style={status === val ? { background: "color-mix(in srgb, var(--primary) 8%, white)" } : {}}
        >{label}</button>
    );

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* accent bar uses --primary */}
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
                                <p className="text-[14px] font-semibold text-gray-900">Export dignitaries</p>
                                <p className="text-[11px] text-gray-400">Choose format and date range</p>
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
                                <button
                                    key={key}
                                    onClick={() => setFormat(key)}
                                    className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all"
                                    style={{
                                        borderColor: format === key ? "var(--primary)" : "#e5e7eb",
                                        borderWidth: format === key ? 2 : 1,
                                        background: format === key ? "color-mix(in srgb, var(--primary) 6%, white)" : "",
                                    }}
                                >
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
                                    className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none transition-all"
                                    style={{ "--tw-ring-color": "var(--primary)" }}
                                    onFocus={e => e.target.style.borderColor = "var(--primary)"}
                                    onBlur={e => e.target.style.borderColor = ""}
                                />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 mb-1">To</p>
                                <input type="date" value={to} min={from} max={today}
                                    onChange={e => { setTo(e.target.value); setPreset("custom"); }}
                                    className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none transition-all"
                                    onFocus={e => e.target.style.borderColor = "var(--primary)"}
                                    onBlur={e => e.target.style.borderColor = ""}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <p className="text-[11px] font-semibold text-gray-500 mb-2">
                            Status <span className="font-normal text-gray-400">(optional)</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {statusPill("all", "All")}
                            {statusPill("pending", "Pending")}
                            {statusPill("approved", "Approved")}
                            {statusPill("rejected", "Rejected")}
                        </div>
                    </div>

                    {/* Record count */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[11px] text-gray-400">Estimated records</span>
                        <span className="text-[13px] font-semibold text-gray-800">
                            {count === null ? "—" : `${count} dignitar${count !== 1 ? "ies" : "y"}`}
                        </span>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleDownload}
                        disabled={loading || count === 0}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ background: "var(--primary)" }}
                    >
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
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-400" },
    approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-400" },
    rejected: { label: "Rejected", cls: "bg-red-50 text-red-500 border-red-200", dot: "bg-red-400" },
};

/* ─── helpers ────────────────────────────────────────────────────────── */
const fmtDate = d =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDateTime = d =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

function StatusPill({ status }) {
    const c = STATUS_CFG[status] ?? STATUS_CFG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}14` }}>
                <span style={{ color }}>{icon}</span>
            </div>
            <div>
                <p className="text-[18px] font-semibold text-gray-900 leading-none">{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

/* ─── Reject Modal ───────────────────────────────────────────────────── */
function RejectModal({ dignitary, onClose, onConfirm, loading }) {
    const [reason, setReason] = useState("");
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-1" style={{ background: "var(--primary)" }} />
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-gray-900">Reject dignitary</h3>
                            <p className="text-[11px] text-gray-400">{dignitary?.dignitaryName || dignitary?.fullName}</p>
                        </div>
                    </div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                        Rejection reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={4}
                        placeholder="Explain why this application is being rejected…"
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 outline-none focus:border-red-400 resize-none transition-all"
                    />
                    <div className="flex gap-2 mt-4">
                        <button onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 font-medium hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={() => reason.trim() && onConfirm(reason)}
                            disabled={!reason.trim() || loading}
                            className="flex-1 py-2.5 rounded-lg bg-red-500 text-[12px] text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Reject
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
    const [showReject, setShowReject] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        axiosInstance.get(`/dignitaries/${id}`)
            .then(r => setData(r.data))
            .catch(() => toast.error("Failed to load details"))
            .finally(() => setLoading(false));
    }, [id]);

    const act = async (action, extra) => {
        setActing(action);
        try {
            let res;
            if (action === "approve")
                res = await axiosInstance.put(`/dignitaries/${id}/approve`);
            else if (action === "reject")
                res = await axiosInstance.put(`/dignitaries/${id}/reject`, { reason: extra });
            else if (action === "reset")
                res = await axiosInstance.put(`/dignitaries/${id}/reset`);
            else if (action === "delete") {
                await axiosInstance.delete(`/dignitaries/${id}`);
                toast.success("Dignitary deleted");
                onAction();
                onClose();
                return;
            }
            setData(res.data.dignitary);
            toast.success(res.data.message);
            onAction();
            setShowReject(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        } finally {
            setActing(null);
        }
    };

    /* small row component */
    const Row = ({ icon, label, value }) => (
        <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span className="flex-shrink-0 mt-px" style={{ color: "var(--primary)" }}>{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-[12px] text-gray-800 mt-0.5 break-words">{value || "—"}</p>
            </div>
        </div>
    );

    /* who-did-it chip */
    const ActorChip = ({ label, actor, at, colorCls, iconEl }) => {
        if (!at) return null;
        return (
            <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${colorCls}`}>
                <div className="flex-shrink-0 mt-0.5">{iconEl}</div>
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{label}</p>
                    <p className="text-[12px] font-medium text-gray-800 mt-0.5">
                        {actor?.name || actor?.email || "Admin"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{fmtDateTime(at)}</p>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* backdrop */}
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

            {/* drawer */}
            <div className="fixed top-0 right-0 h-full z-50 w-full max-w-[460px] bg-white shadow-2xl flex flex-col">
                <div className="h-1 flex-shrink-0" style={{ background: "var(--primary)" }} />

                {/* header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
                            <Crown className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-gray-900">Dignitary details</p>
                            {data?.dignitaryId && (
                                <p className="text-[10px] text-gray-400 font-mono">{data.dignitaryId}</p>
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
                    ) : data ? (
                        <>
                            {/* status banner */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                <StatusPill status={data.status} />
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400">Applied</p>
                                    <p className="text-[11px] font-medium text-gray-600">{fmtDate(data.createdAt)}</p>
                                </div>
                            </div>

                            {/* who approved / rejected chips */}
                            <div className="space-y-2">
                                <ActorChip
                                    label="Approved by"
                                    actor={data.approvedBy}
                                    at={data.approvedAt}
                                    colorCls="bg-emerald-50 border-emerald-200"
                                    iconEl={<BadgeCheck className="w-4 h-4 text-emerald-500" />}
                                />
                                <ActorChip
                                    label="Rejected by"
                                    actor={data.rejectedBy}
                                    at={data.rejectedAt}
                                    colorCls="bg-red-50 border-red-200"
                                    iconEl={<XCircle className="w-4 h-4 text-red-400" />}
                                />
                                {data.status === "rejected" && data.rejectedReason && (
                                    <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide mb-1">Rejection reason</p>
                                        <p className="text-[12px] text-red-700">{data.rejectedReason}</p>
                                    </div>
                                )}
                            </div>

                            {/* personal info */}
                            <Section title="Personal information">
                                <Row icon={<User className="w-3.5 h-3.5" />} label="Full name" value={data.fullName} />
                                <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={data.email} />
                                <Row icon={<Phone className="w-3.5 h-3.5" />} label="Mobile" value={data.mobile} />
                                <Row icon={<User className="w-3.5 h-3.5" />} label="Gender" value={data.gender} />
                            </Section>

                            {/* personal address */}
                            <Section title="Personal address">
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="City" value={data.city} />
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="State" value={data.state} />
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Country" value={data.country} />
                                <Row icon={<Hash className="w-3.5 h-3.5" />} label="Pincode" value={data.pincode} />
                            </Section>

                            {/* dignitary details */}
                            <Section title="Dignitary details">
                                <Row icon={<Crown className="w-3.5 h-3.5" />} label="Dignitary name" value={data.dignitaryName} />
                                <Row icon={<Award className="w-3.5 h-3.5" />} label="Role" value={data.role} />
                                <Row icon={<Building2 className="w-3.5 h-3.5" />} label="Place type" value={data.placeType} />
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Full address" value={data.fullAddress} />
                            </Section>

                            {/* place address */}
                            <Section title="Place address">
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="City" value={data.placeCity} />
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="State" value={data.placeState} />
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Country" value={data.placeCountry} />
                                <Row icon={<Hash className="w-3.5 h-3.5" />} label="Pincode" value={data.placePincode} />
                            </Section>

                            {/* timeline */}
                            <Section title="Timeline">
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Applied on" value={fmtDate(data.createdAt)} />
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Approved at" value={fmtDateTime(data.approvedAt)} />
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Rejected at" value={fmtDateTime(data.rejectedAt)} />
                                {data.dignitaryId && (
                                    <Row icon={<Hash className="w-3.5 h-3.5" />} label="Dignitary ID" value={data.dignitaryId} />
                                )}
                            </Section>

                            {/* documents */}
                            {data.documents?.length > 0 && (
                                <Section title={`Documents (${data.documents.length})`}>
                                    <div className="space-y-2 py-2">
                                        {data.documents.map((doc, i) => (
                                            <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:border-[var(--primary)] transition-all group">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                    <FileText className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-medium text-gray-700 truncate">
                                                        {doc.fileName || `Document ${i + 1}`}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {doc.fileType}{doc.fileSize ? ` · ${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                                                    </p>
                                                </div>
                                                <Download className="w-3.5 h-3.5 text-gray-300 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </Section>
                            )}
                        </>
                    ) : null}
                </div>

                {/* action footer */}
                {data && (
                    <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 space-y-2">
                        {/* approve */}
                        {data.status !== "approved" && (
                            <button
                                onClick={() => act("approve")}
                                disabled={acting === "approve"}
                                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] text-white font-medium disabled:opacity-50 transition-all hover:opacity-90"
                                style={{ background: "var(--primary)" }}>
                                {acting === "approve"
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <ShieldCheck className="w-4 h-4" />}
                                Approve dignitary
                            </button>
                        )}

                        <div className="flex gap-2">
                            {/* reject */}
                            {data.status !== "rejected" && (
                                <button
                                    onClick={() => setShowReject(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] text-red-500 font-medium bg-red-50 hover:bg-red-100 border border-red-200 transition-all">
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                            )}

                            {/* reset */}
                            {(data.status === "rejected" || data.status === "approved") && (
                                <button
                                    onClick={() => act("reset")}
                                    disabled={acting === "reset"}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] text-gray-600 font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all disabled:opacity-50">
                                    {acting === "reset"
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <RotateCcw className="w-4 h-4" />}
                                    Reset to pending
                                </button>
                            )}

                            {/* delete */}
                            <button
                                onClick={() => { if (confirm("Delete this dignitary permanently?")) act("delete"); }}
                                disabled={acting === "delete"}
                                title="Delete"
                                className="w-10 flex items-center justify-center py-2.5 rounded-lg text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all disabled:opacity-50">
                                {acting === "delete"
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showReject && (
                <RejectModal
                    dignitary={data}
                    onClose={() => setShowReject(false)}
                    onConfirm={reason => act("reject", reason)}
                    loading={acting === "reject"}
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

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function DignitariesPage() {
    const [dignitaries, setDignitaries] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [detailId, setDetailId] = useState(null);
    const [showExport, setShowExport] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusF, setStatusF] = useState("all");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const fetchStats = () =>
        axiosInstance.get("/dignitaries/stats")
            .then(r => setStats(r.data))
            .catch(() => { });

    const fetchDignitaries = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get("/dignitaries", {
                params: { page, status: statusF, search, sortBy, sortOrder },
            });
            setDignitaries(data.dignitaries);
            setPagination(data.pagination);
        } catch {
            toast.error("Failed to load dignitaries");
        } finally {
            setLoading(false);
        }
    }, [page, statusF, search, sortBy, sortOrder]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchDignitaries(); }, [fetchDignitaries]);

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const onAction = () => { fetchDignitaries(); fetchStats(); };

    const toggleSort = col => {
        if (sortBy === col) setSortOrder(o => o === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortOrder("desc"); }
    };

    /* ── table header cell ── */
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
                            <Crown className="w-[18px] h-[18px] text-white" />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-semibold text-gray-900">Dignitaries</h1>
                            <p className="text-[11px] text-gray-400">Review and manage dignitary applications</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { fetchDignitaries(); fetchStats(); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[12px] text-gray-500 font-medium hover:bg-gray-50 transition-all"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button
                            onClick={() => setShowExport(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-medium transition-all hover:opacity-90"
                            style={{
                                borderColor: "color-mix(in srgb, var(--primary) 40%, white)",
                                background: "color-mix(in srgb, var(--primary) 8%, white)",
                                color: "var(--primary)",
                            }}
                        >
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <StatCard label="Total" value={stats.total} icon={<Crown className="w-4 h-4" />} color="#8B5CF6" />
                    <StatCard label="Pending" value={stats.pending} icon={<Clock className="w-4 h-4" />} color="#F59E0B" />
                    <StatCard label="Approved" value={stats.approved} icon={<CheckCircle className="w-4 h-4" />} color="#22C55E" />
                    <StatCard label="Rejected" value={stats.rejected} icon={<XCircle className="w-4 h-4" />} color="#EF4444" />
                </div>

                {/* ── Toolbar ── */}
                <div className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 mb-4 flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, ID, city…"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 focus:border-[var(--primary)] outline-none transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className={selectCls}>
                            <option value="all">All status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
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
                                    <TH label="Applicant" col="fullName" />
                                    <TH label="Dignitary ID" />
                                    <TH label="Dignitary name" col="dignitaryName" />
                                    <TH label="Place type" col="placeType" />
                                    <TH label="Role" col="role" />
                                    <TH label="Location" />
                                    <TH label="Status" col="status" />
                                    <TH label="Applied" col="createdAt" />
                                    <TH label="" cls="w-12" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-16">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--primary)" }} />
                                            <p className="text-[12px] text-gray-400">Loading dignitaries…</p>
                                        </td>
                                    </tr>
                                ) : dignitaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-16">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                                style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                <Crown className="w-5 h-5" style={{ color: "var(--primary)" }} />
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-700">No dignitaries found</p>
                                            <p className="text-[11px] text-gray-400 mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : dignitaries.map((d, idx) => (
                                    <tr key={d._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setDetailId(d._id)}>

                                        {/* # */}
                                        <td className="px-4 py-3 text-[11px] text-gray-400">
                                            {(pagination.page - 1) * 15 + idx + 1}
                                        </td>

                                        {/* applicant */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-white"
                                                    style={{ background: "var(--primary)" }}>
                                                    {d.fullName?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-medium text-gray-800">{d.fullName || "—"}</p>
                                                    <p className="text-[10px] text-gray-400">{d.email || ""}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* dignitary ID */}
                                        <td className="px-3 py-3">
                                            {d.dignitaryId
                                                ? <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-mono text-gray-600">{d.dignitaryId}</span>
                                                : <span className="text-[10px] text-gray-300">—</span>}
                                        </td>

                                        {/* dignitary name */}
                                        <td className="px-3 py-3">
                                            <p className="text-[12px] font-medium text-gray-800 max-w-[140px] truncate">{d.dignitaryName || "—"}</p>
                                        </td>

                                        {/* place type */}
                                        <td className="px-3 py-3">
                                            {d.placeType
                                                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
                                                    style={{ background: "color-mix(in srgb, var(--primary) 8%, white)", color: "var(--primary)" }}>
                                                    <Building2 className="w-2.5 h-2.5" />
                                                    {d.placeType}
                                                </span>
                                                : <span className="text-[10px] text-gray-300">—</span>}
                                        </td>

                                        {/* role */}
                                        <td className="px-3 py-3 text-[12px] text-gray-600 max-w-[120px] truncate">{d.role || "—"}</td>

                                        {/* location */}
                                        <td className="px-3 py-3">
                                            {d.placeCity || d.placeState
                                                ? <div>
                                                    <p className="text-[11px] text-gray-700">{d.placeCity}</p>
                                                    <p className="text-[10px] text-gray-400">{d.placeState}</p>
                                                </div>
                                                : <span className="text-[10px] text-gray-300">—</span>}
                                        </td>

                                        {/* status */}
                                        <td className="px-3 py-3"><StatusPill status={d.status} /></td>

                                        {/* date */}
                                        <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">{fmtDate(d.createdAt)}</td>

                                        {/* eye btn */}
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

                    {/* ── Pagination ── */}
                    {!loading && pagination.total > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-[11px] text-gray-400">
                                Showing{" "}
                                <span className="font-medium text-gray-600">
                                    {(pagination.page - 1) * 15 + 1}–{Math.min(pagination.page * 15, pagination.total)}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-gray-600">{pagination.total}</span>
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
            onClick={onClick}
            disabled={disabled}
            className={`min-w-[28px] h-7 px-1.5 rounded-lg text-[11px] font-medium transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                ${active ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
            style={active ? { background: "var(--primary)" } : {}}>
            {children}
        </button>
    );
}