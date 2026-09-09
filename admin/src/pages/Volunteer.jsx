// pages/VolunteersPage.jsx

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
    Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
    Eye, Check, X, Trash2, Loader2, RefreshCw,
    User, Mail, Phone, MapPin, Briefcase, FileText,
    Award, Calendar, Hash, Shield, Download, RotateCcw,
    Users, Clock, CheckCircle, XCircle, FileSpreadsheet
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import VolunteerIDCard from "../components/dashboard/VolunteerCard";

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

    // Apply preset shortcuts
    useEffect(() => {
        if (preset === "7d") {
            const d = new Date(); d.setDate(d.getDate() - 7);
            setFrom(d.toISOString().slice(0, 10));
            setTo(today);
        } else if (preset === "30d") {
            const d = new Date(); d.setDate(d.getDate() - 30);
            setFrom(d.toISOString().slice(0, 10));
            setTo(today);
        } else if (preset === "all") {
            setFrom("");
            setTo(today);
        }
    }, [preset]);

    // Debounced count fetch
    useEffect(() => {
        clearTimeout(countTimer.current);
        countTimer.current = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ status });
                if (from) params.set("from", from);
                if (to) params.set("to", to);
                const { data } = await axiosInstance.get(`/volunteers/export/count?${params}`);
                setCount(data.count);
            } catch { setCount(null); }
        }, 350);
        return () => clearTimeout(countTimer.current);
    }, [from, to, status]);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ format, status });
            if (from) params.set("from", from);
            if (to) params.set("to", to);

            const res = await axiosInstance.get(`/volunteers/export?${params}`, {
                responseType: "blob",
            });

            const ext = format === "xlsx" ? "xlsx" : "csv";
            const mime = format === "xlsx"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv";

            const url = URL.createObjectURL(new Blob([res.data], { type: mime }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `volunteers_${status}_${Date.now()}.${ext}`;
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
            onClick={() => setPreset(key)}
            className={`py-1.5 rounded-lg text-[11px] font-medium border transition-all ${preset === key
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
        >{label}</button>
    );

    const statusPill = (val, label) => (
        <button
            key={val}
            onClick={() => setStatus(val)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${status === val
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
        >{label}</button>
    );

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-[3px] bg-emerald-500" />

                <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Download className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-gray-900">Export volunteers</p>
                                <p className="text-[11px] text-gray-400">Choose format and date range</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
                        >
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
                                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${format === key
                                        ? "border-emerald-300 bg-emerald-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${format === key ? "text-emerald-600" : "text-gray-400"}`} />
                                    <div>
                                        <p className={`text-[12px] font-semibold ${format === key ? "text-emerald-700" : "text-gray-700"}`}>{label}</p>
                                        <p className={`text-[10px] ${format === key ? "text-emerald-500" : "text-gray-400"}`}>{sub}</p>
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
                                <input
                                    type="date" value={from} max={to || today}
                                    onChange={e => { setFrom(e.target.value); setPreset("custom"); }}
                                    className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none focus:border-emerald-400 transition-all"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 mb-1">To</p>
                                <input
                                    type="date" value={to} min={from} max={today}
                                    onChange={e => { setTo(e.target.value); setPreset("custom"); }}
                                    className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status filter */}
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
                            {count === null ? "—" : `${count} volunteer${count !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    {/* Download */}
                    <button
                        onClick={handleDownload}
                        disabled={loading || count === 0}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

/* ─── tiny helpers ───────────────────────────────────────────────────── */
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

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
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}14` }}>
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
function RejectModal({ volunteer, onClose, onConfirm, loading }) {
    const [reason, setReason] = useState("");
    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-1" style={{ background: "var(--primary)" }} />
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-gray-900">Reject volunteer</h3>
                            <p className="text-[11px] text-gray-400">{volunteer?.fullName}</p>
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
        axiosInstance.get(`/volunteers/${id}`)
            .then(r => setData(r.data))
            .catch(() => toast.error("Failed to load details"))
            .finally(() => setLoading(false));
    }, [id]);

    const act = async (action, extra) => {
        setActing(action);
        try {
            let res;
            if (action === "approve") res = await axiosInstance.put(`/volunteers/${id}/approve`);
            else if (action === "dignitary") res = await axiosInstance.put(`/volunteers/${id}/dignitary-approve`);
            else if (action === "reject") res = await axiosInstance.put(`/volunteers/${id}/reject`, { reason: extra });
            else if (action === "reset") res = await axiosInstance.put(`/volunteers/${id}/reset`);
            else if (action === "delete") {
                await axiosInstance.delete(`/volunteers/${id}`);
                toast.success("Volunteer deleted");
                onAction();
                onClose();
                return;
            }
            setData(res.data.volunteer);
            toast.success(res.data.message);
            onAction();
            setShowReject(false);
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
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-gray-900">Volunteer details</p>
                            {data?.volunteerId && (
                                <p className="text-[10px] text-gray-400">{data.volunteerId}</p>
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
                                <StatusPill status={data.status} />
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400">Applied</p>
                                    <p className="text-[11px] font-medium text-gray-600">{fmtDate(data.createdAt)}</p>
                                </div>
                            </div>

                            {/* personal */}
                            <Section title="Personal information">
                                <Row icon={<User className="w-3.5 h-3.5" />} label="Full name" value={data.fullName} />
                                <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={data.email} />
                                <Row icon={<Phone className="w-3.5 h-3.5" />} label="Mobile" value={data.mobile} />
                                <Row icon={<User className="w-3.5 h-3.5" />} label="Gender" value={data.gender} />
                                <Row icon={<Briefcase className="w-3.5 h-3.5" />} label="Occupation" value={data.occupation} />
                            </Section>

                            {/* address */}
                            <Section title="Address">
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={data.address} />
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="City" value={data.city} />
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="State" value={data.state} />
                                <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Country" value={data.country} />
                                <Row icon={<Hash className="w-3.5 h-3.5" />} label="Pincode" value={data.pincode} />
                            </Section>

                            {/* volunteer info */}
                            <Section title="Volunteer information">
                                <Row icon={<Award className="w-3.5 h-3.5" />} label="Role" value={data.role} />
                                <Row icon={<FileText className="w-3.5 h-3.5" />} label="Role description" value={data.roleDesc} />
                                <Row icon={<CheckCircle className="w-3.5 h-3.5" />} label="Contribution" value={data.contribution} />
                                <Row icon={<Shield className="w-3.5 h-3.5" />} label="Dignitary code" value={data.dignitaryCode} />
                                <Row icon={<User className="w-3.5 h-3.5" />} label="Dignitary name" value={data.dignitaryName} />
                            </Section>

                            {/* timeline */}
                            <Section title="Timeline">
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Applied on" value={fmtDate(data.createdAt)} />
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Dignitary approved" value={fmtDate(data.dignitaryApprovedAt)} />
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Admin approved" value={fmtDate(data.adminApprovedAt)} />
                                {data.volunteerId && (
                                    <Row icon={<Hash className="w-3.5 h-3.5" />} label="Volunteer ID" value={data.volunteerId} />
                                )}
                                {data.status === "rejected" && (
                                    <Row icon={<XCircle className="w-3.5 h-3.5" />} label="Rejection reason" value={data.rejectedReason} />
                                )}
                            </Section>

                            {/* documents */}
                            {data.documents?.length > 0 && (
                                <Section title={`Documents (${data.documents.length})`}>
                                    <div className="space-y-2">
                                        {data.documents.map((doc, i) => (
                                            <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:border-[var(--primary)] transition-all group">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                    <FileText className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-medium text-gray-700 truncate">{doc.fileName || `Document ${i + 1}`}</p>
                                                    <p className="text-[10px] text-gray-400">{doc.fileType} · {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ""}</p>
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
                    <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 space-y-2.5">
                        <div className="flex gap-2">
                            {data.status !== "approved" && (
                                <ActionBtn
                                    label="Approve" icon={<Check className="w-3.5 h-3.5" />}
                                    loading={acting === "approve"}
                                    onClick={() => act("approve")}
                                    cls="bg-emerald-500 hover:bg-emerald-600 text-white flex-1" />
                            )}
                            {/* {!data.dignitaryApprovedAt && (
                                <ActionBtn
                                    label="Dignitary approve" icon={<Shield className="w-3.5 h-3.5" />}
                                    loading={acting === "dignitary"}
                                    onClick={() => act("dignitary")}
                                    cls="text-white flex-1"
                                    style={{ background: "var(--primary)" }} />
                            )} */}
                        </div>
                        <div className="flex gap-2 grid grid-cols-2 gap-2">
                            {data.status !== "rejected" && (
                                <ActionBtn
                                    label="Reject" icon={<XCircle className="w-3.5 h-3.5" />}
                                    onClick={() => setShowReject(true)}
                                    cls="bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 flex-1" />
                            )}
                            {(data.status === "rejected" || data.status === "approved") && (
                                <ActionBtn
                                    label="Reset to pending" icon={<RotateCcw className="w-3.5 h-3.5" />}
                                    loading={acting === "reset"}
                                    onClick={() => act("reset")}
                                    cls="bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 flex-1 w-full" />
                            )}
                            <ActionBtn
                                label="Delete" icon={<Trash2 className="w-3.5 h-3.5" />}
                                loading={acting === "delete"}
                                onClick={() => { if (confirm("Delete this volunteer permanently?")) act("delete"); }}
                                cls="bg-red-500 hover:bg-red-600 text-white border border-gray-200 w-10 flex-shrink-0 !px-0 w-full" />
                        </div>
                    </div>
                )}
            </div>

            {showReject && (
                <RejectModal
                    volunteer={data}
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
export default function VolunteersPage() {
    const [volunteers, setVolunteers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [detailId, setDetailId] = useState(null);
    const [showExport, setShowExport] = useState(false);
    const [idCardVolunteer, setIdCardVolunteer] = useState(null);
    // filters
    const [search, setSearch] = useState("");
    const [statusF, setStatusF] = useState("all");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const fetchStats = () =>
        axiosInstance.get("/volunteers/stats").then(r => setStats(r.data)).catch(() => { });

    const fetchVolunteers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, status: statusF, search, sortBy, sortOrder };
            const { data } = await axiosInstance.get("/volunteers", { params });
            setVolunteers(data.volunteers);
            setPagination(data.pagination);
        } catch { toast.error("Failed to load volunteers"); }
        finally { setLoading(false); }
    }, [page, statusF, search, sortBy, sortOrder]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchVolunteers(); }, [fetchVolunteers]);

    // debounce search
    const [searchInput, setSearchInput] = useState("");
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const onAction = () => { fetchVolunteers(); fetchStats(); };

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
                            <Users className="w-[18px] h-[18px] text-white" />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-semibold text-gray-900">Volunteers</h1>
                            <p className="text-[11px] text-gray-400">Review and manage volunteer applications</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { fetchVolunteers(); fetchStats(); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[12px] text-gray-500 font-medium hover:bg-gray-50 transition-all"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button
                            onClick={() => setShowExport(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-[12px] text-emerald-700 font-medium hover:bg-emerald-100 transition-all"
                        >
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <StatCard label="Total" value={stats.total} icon={<Users className="w-4 h-4" />} color="#8B5CF6" />
                    <StatCard label="Pending" value={stats.pending} icon={<Clock className="w-4 h-4" />} color="#F59E0B" />
                    <StatCard label="Approved" value={stats.approved} icon={<CheckCircle className="w-4 h-4" />} color="#22C55E" />
                    <StatCard label="Rejected" value={stats.rejected} icon={<XCircle className="w-4 h-4" />} color="#EF4444" />
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 mb-4 flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text" placeholder="Search by name, email, ID…"
                            value={searchInput} onChange={e => setSearchInput(e.target.value)}
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

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <TH label="#" cls="w-10 pl-4" />
                                    <TH label="Name" col="fullName" />
                                    <TH label="Volunteer ID" />
                                    <TH label="Role" col="role" />
                                    <TH label="Contribution" />
                                    <TH label="Dignitary" />
                                    <TH label="Status" col="status" />
                                    <TH label="Applied" col="createdAt" />
                                    <TH label="" cls="w-16" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-16">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--primary)" }} />
                                            <p className="text-[12px] text-gray-400">Loading volunteers…</p>
                                        </td>
                                    </tr>
                                ) : volunteers.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-16">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                                style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                <Users className="w-5 h-5" style={{ color: "var(--primary)" }} />
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-700">No volunteers found</p>
                                            <p className="text-[11px] text-gray-400 mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : volunteers.map((v, idx) => (
                                    <tr key={v._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setDetailId(v._id)}>
                                        <td className="px-4 py-3 text-[11px] text-gray-400">
                                            {(pagination.page - 1) * 15 + idx + 1}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-white"
                                                    style={{ background: "var(--primary)" }}>
                                                    {v.fullName?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-medium text-gray-800">{v.fullName}</p>
                                                    <p className="text-[10px] text-gray-400">{v.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            {v.volunteerId
                                                ? <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-mono text-gray-600">{v.volunteerId}</span>
                                                : <span className="text-[10px] text-gray-300">—</span>}
                                        </td>
                                        <td className="px-3 py-3 text-[12px] text-gray-600 max-w-[140px] truncate">{v.role || "—"}</td>
                                        <td className="px-3 py-3 text-[12px] text-gray-600 max-w-[120px] truncate">{v.contribution || "—"}</td>
                                        <td className="px-3 py-3">
                                            {v.dignitaryName
                                                ? <div>
                                                    <p className="text-[11px] text-gray-700">{v.dignitaryName}</p>
                                                    <p className="text-[10px] text-gray-400">{v.dignitaryCode}</p>
                                                </div>
                                                : <span className="text-[10px] text-gray-300">—</span>}
                                        </td>
                                        <td className="px-3 py-3"><StatusPill status={v.status} /></td>
                                        <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">{fmtDate(v.createdAt)}</td>
                                        <td className="px-3 py-3 flex gap-2" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => setDetailId(v._id)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,white)] transition-all">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setIdCardVolunteer(v); }}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-purple-500 hover:bg-purple-50 transition-all"
                                                title="View ID Card">
                                                <Award className="w-3.5 h-3.5" />
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

            {idCardVolunteer && (
                <VolunteerIDCard
                    volunteer={idCardVolunteer}
                    onClose={() => setIdCardVolunteer(null)}
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
                ${active
                    ? "text-white"
                    : "text-gray-500 hover:bg-gray-100"}`}
            style={active ? { background: "var(--primary)" } : {}}>
            {children}
        </button>
    );
}