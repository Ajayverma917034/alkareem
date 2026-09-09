// pages/admin/Contacts.jsx

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
    Eye, Trash2, Loader2, RefreshCw, X,
    User, Mail, Phone, FileText, Calendar,
    MessageSquare, Hash, CheckCircle, Clock,
    TrendingUp, XCircle, AlertCircle, BookOpen,
    Tag, StickyNote, Activity,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

/* ─── constants ───────────────────────────────────────────────────── */

const STATUS_CFG = {
    open: { label: "Open", cls: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" },
    in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-400" },
    resolved: { label: "Resolved", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
    closed: { label: "Closed", cls: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

const QUERY_CFG = {
    volunteer: { label: "Volunteer", cls: "bg-violet-50 text-violet-600 border-violet-200" },
    dignitory: { label: "Dignitory", cls: "bg-yellow-50 text-yellow-600 border-yellow-200" },
    donation: { label: "Donation", cls: "bg-pink-50 text-pink-600 border-pink-200" },
    membership: { label: "Membership", cls: "bg-cyan-50 text-cyan-600 border-cyan-200" },
    other: { label: "Other", cls: "bg-gray-50 text-gray-500 border-gray-200" },
};

const QUERY_EMOJI = {
    volunteer: "🤝",
    dignitory: "🎖️",
    donation: "💝",
    membership: "🏅",
    other: "💬",
};

/* ─── helpers ─────────────────────────────────────────────────────── */

const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = d => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

/* ─── pills ───────────────────────────────────────────────────────── */

function StatusPill({ status }) {
    const c = STATUS_CFG[status] ?? STATUS_CFG.open;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

function QueryPill({ type }) {
    const c = QUERY_CFG[type] ?? QUERY_CFG.other;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.cls}`}>
            {QUERY_EMOJI[type] ?? "💬"} {c.label}
        </span>
    );
}

/* ─── stat card ───────────────────────────────────────────────────── */

function StatCard({ label, value, icon, color, subtitle }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}>
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

/* ─── status update modal ─────────────────────────────────────────── */

function StatusModal({ contact, onClose, onConfirm, loading }) {
    const [status, setStatus] = useState(contact?.status ?? "open");
    const [notes, setNotes] = useState("");

    const options = [
        { value: "open", label: "Open", icon: <AlertCircle className="w-3.5 h-3.5 text-blue-500" /> },
        { value: "in_progress", label: "In Progress", icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
        { value: "resolved", label: "Resolved", icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> },
        { value: "closed", label: "Closed", icon: <XCircle className="w-3.5 h-3.5 text-gray-400" /> },
    ];

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-1" style={{ background: "var(--primary)" }} />
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--primary) 12%, white)" }}>
                            <Activity className="w-4 h-4" style={{ color: "var(--primary)" }} />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-semibold text-gray-900">Update status</h3>
                            <p className="text-[11px] text-gray-400">{contact?.name}</p>
                        </div>
                    </div>

                    {/* status options */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {options.map(opt => (
                            <button key={opt.value}
                                onClick={() => setStatus(opt.value)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[12px] font-medium transition-all text-left
                                    ${status === opt.value
                                        ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,white)] text-[var(--primary)]"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                                {opt.icon} {opt.label}
                            </button>
                        ))}
                    </div>

                    <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                        Admin note (optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Add a note about this status change…"
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 outline-none focus:border-[var(--primary)] resize-none transition-all"
                    />

                    <div className="flex gap-2 mt-4">
                        <button onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 font-medium hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(status, notes)}
                            disabled={loading || status === contact?.status}
                            className="flex-1 py-2.5 rounded-lg text-[12px] text-white font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                            style={{ background: "var(--primary)" }}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── detail drawer ───────────────────────────────────────────────── */

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

function ActionBtn({ label, icon, onClick, loading: isLoading, cls }) {
    return (
        <button onClick={onClick} disabled={isLoading}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all disabled:opacity-50 ${cls}`}>
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
            {label}
        </button>
    );
}

function DetailDrawer({ id, onClose, onAction }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null);
    const [showStatus, setShowStatus] = useState(false);
    const [notes, setNotes] = useState("");
    const [savingNote, setSavingNote] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        axiosInstance.get(`/contacts/${id}`)
            .then(r => { setData(r.data); setNotes(r.data.adminNotes || ""); })
            .catch(() => toast.error("Failed to load contact"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleStatusUpdate = async (status, note) => {
        setActing("status");
        try {
            const res = await axiosInstance.put(`/contacts/${id}/status`, { status, notes: note });
            setData(res.data.contact);
            toast.success(res.data.message);
            onAction();
            setShowStatus(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        } finally { setActing(null); }
    };

    const handleSaveNote = async () => {
        if (!notes.trim()) return;
        setSavingNote(true);
        try {
            const res = await axiosInstance.put(`/contacts/${id}/notes`, { notes });
            setData(res.data.contact);
            toast.success("Notes saved");
            onAction();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save notes");
        } finally { setSavingNote(false); }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this contact permanently?")) return;
        setActing("delete");
        try {
            await axiosInstance.delete(`/contacts/${id}`);
            toast.success("Contact deleted");
            onAction();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        } finally { setActing(null); }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

            <div className="fixed top-0 right-0 h-full z-50 w-full max-w-[440px] bg-white shadow-2xl flex flex-col">
                <div className="h-1 flex-shrink-0" style={{ background: "var(--primary)" }} />

                {/* header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-gray-900">Contact details</p>
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
                            {/* status + query row */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <StatusPill status={data.status} />
                                    <QueryPill type={data.queryType} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400">Submitted</p>
                                    <p className="text-[11px] font-medium text-gray-600">{fmtDate(data.createdAt)}</p>
                                </div>
                            </div>

                            {/* subject highlight */}
                            <div className="rounded-xl px-5 py-4 border"
                                style={{ background: "color-mix(in srgb, var(--primary) 6%, white)", borderColor: "color-mix(in srgb, var(--primary) 20%, white)" }}>
                                <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--primary)" }}>Subject</p>
                                <p className="text-[15px] font-semibold" style={{ color: "var(--primary)" }}>{data.subject}</p>
                            </div>

                            {/* submitter */}
                            <Section title="Submitter information">
                                <Row icon={<User className="w-3.5 h-3.5" />} label="Full name" value={data.name} />
                                <Row icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={data.phone} />
                                <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={data.email || "Not provided"} />
                            </Section>

                            {/* message */}
                            <Section title="Message">
                                <div className="py-3">
                                    <p className="text-[12px] text-gray-700 leading-relaxed whitespace-pre-wrap">{data.message}</p>
                                </div>
                            </Section>

                            {/* admin notes */}
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin notes</p>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Add internal notes about this contact…"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 outline-none focus:border-[var(--primary)] resize-none transition-all"
                                />
                                <button
                                    onClick={handleSaveNote}
                                    disabled={savingNote || !notes.trim()}
                                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white disabled:opacity-50 transition-all"
                                    style={{ background: "var(--primary)" }}>
                                    {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <StickyNote className="w-3.5 h-3.5" />}
                                    Save note
                                </button>
                            </div>

                            {/* resolution info */}
                            <Section title="Resolution tracking">
                                <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Created at" value={fmtDateTime(data.createdAt)} />
                                {data.resolvedAt && (
                                    <Row icon={<CheckCircle className="w-3.5 h-3.5" />} label="Resolved at" value={fmtDateTime(data.resolvedAt)} />
                                )}
                                {data.resolvedBy && (
                                    <Row icon={<User className="w-3.5 h-3.5" />} label="Resolved by" value={data.resolvedBy?.name || data.resolvedBy?.email} />
                                )}
                                {data.closedAt && (
                                    <Row icon={<XCircle className="w-3.5 h-3.5" />} label="Closed at" value={fmtDateTime(data.closedAt)} />
                                )}
                                {data.closedBy && (
                                    <Row icon={<User className="w-3.5 h-3.5" />} label="Closed by" value={data.closedBy?.name || data.closedBy?.email} />
                                )}
                                {data.assignedTo && (
                                    <Row icon={<User className="w-3.5 h-3.5" />} label="Assigned to" value={data.assignedTo?.name || data.assignedTo?.email} />
                                )}
                            </Section>

                            {/* activity log */}
                            {data.activityLog?.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Activity log</p>
                                    <div className="space-y-2">
                                        {[...data.activityLog].reverse().map((entry, i) => (
                                            <div key={i} className="flex gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--primary)" }} />
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-medium text-gray-700">{entry.detail || entry.action}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {entry.byName || "System"} · {fmtDateTime(entry.at)}
                                                    </p>
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
                {data && (
                    <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 space-y-2.5">
                        <ActionBtn
                            label="Update Status"
                            icon={<Activity className="w-3.5 h-3.5" />}
                            onClick={() => setShowStatus(true)}
                            cls="w-full text-white bg-blue-600"
                        />
                        <div style={{ marginTop: 0 }} className="grid grid-cols-1">
                            <ActionBtn
                                label="Delete contact"
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                loading={acting === "delete"}
                                onClick={handleDelete}
                                cls="bg-red-500 hover:bg-red-600 text-white w-full"
                            />
                        </div>
                    </div>
                )}
            </div>

            {showStatus && (
                <StatusModal
                    contact={data}
                    onClose={() => setShowStatus(false)}
                    onConfirm={handleStatusUpdate}
                    loading={acting === "status"}
                />
            )}
        </>
    );
}

/* ─── main page ───────────────────────────────────────────────────── */

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, byType: {} });
    const [loading, setLoading] = useState(true);
    const [detailId, setDetailId] = useState(null);

    // filters
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusF, setStatusF] = useState("all");
    const [queryTypeF, setQueryTypeF] = useState("all");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const fetchStats = () =>
        axiosInstance.get("/contacts/stats")
            .then(r => setStats(r.data))
            .catch(() => { });

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, status: statusF, queryType: queryTypeF, search, sortBy, sortOrder };
            const { data } = await axiosInstance.get("/contacts", { params });
            setContacts(data.contacts);
            setPagination(data.pagination);
        } catch {
            toast.error("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    }, [page, statusF, queryTypeF, search, sortBy, sortOrder]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    // debounced search
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const onAction = () => { fetchContacts(); fetchStats(); };

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
                            <MessageSquare className="w-[18px] h-[18px] text-white" />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-semibold text-gray-900">Contacts</h1>
                            <p className="text-[11px] text-gray-400">Manage all contact enquiries</p>
                        </div>
                    </div>
                    <button onClick={onAction}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[12px] text-gray-500 font-medium hover:bg-gray-50 transition-all">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                </div>

                {/* ── Stats row 1 ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <StatCard label="Total contacts" value={stats.total} icon={<TrendingUp className="w-4 h-4" />} color="#8B5CF6" />
                    <StatCard label="Open" value={stats.open} icon={<AlertCircle className="w-4 h-4" />} color="#3B82F6" />
                    <StatCard label="In Progress" value={stats.in_progress} icon={<Clock className="w-4 h-4" />} color="#F59E0B" />
                    <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle className="w-4 h-4" />} color="#22C55E" />
                </div>

                {/* ── Stats row 2 — by query type ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {Object.entries(QUERY_CFG).map(([key, cfg]) => (
                        <div key={key} className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 flex items-center gap-2">
                            <span className="text-[18px]">{QUERY_EMOJI[key]}</span>
                            <div>
                                <p className="text-[15px] font-semibold text-gray-900 leading-none">{stats.byType?.[key] ?? 0}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{cfg.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Toolbar ── */}
                <div className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 mb-4 flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone…"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 focus:border-[var(--primary)] outline-none transition-all"
                        />
                    </div>

                    {/* status filter */}
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} className={selectCls}>
                            <option value="all">All status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>

                    {/* query type filter */}
                    <div className="relative">
                        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <select value={queryTypeF} onChange={e => { setQueryTypeF(e.target.value); setPage(1); }} className={selectCls}>
                            <option value="all">All types</option>
                            <option value="volunteer">🤝 Volunteer</option>
                            <option value="dignitory">🎖️ Dignitory</option>
                            <option value="donation">💝 Donation</option>
                            <option value="membership">🏅 Membership</option>
                            <option value="other">💬 Other</option>
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
                                    <TH label="Submitter" col="name" />
                                    <TH label="Subject" col="subject" />
                                    <TH label="Type" col="queryType" />
                                    <TH label="Status" col="status" />
                                    <TH label="Submitted" col="createdAt" />
                                    <TH label="Resolved" col="resolvedAt" />
                                    <TH label="" cls="w-16" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--primary)" }} />
                                            <p className="text-[12px] text-gray-400">Loading contacts…</p>
                                        </td>
                                    </tr>
                                ) : contacts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                                style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }}>
                                                <MessageSquare className="w-5 h-5" style={{ color: "var(--primary)" }} />
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-700">No contacts found</p>
                                            <p className="text-[11px] text-gray-400 mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : contacts.map((c, idx) => (
                                    <tr key={c._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setDetailId(c._id)}>
                                        <td className="px-4 py-3 text-[11px] text-gray-400">
                                            {(pagination.page - 1) * 15 + idx + 1}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-white"
                                                    style={{ background: "var(--primary)" }}>
                                                    {c.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-medium text-gray-800">{c.name}</p>
                                                    <p className="text-[10px] text-gray-400">{c.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-[12px] text-gray-600 max-w-[180px] truncate">
                                            {c.subject}
                                        </td>
                                        <td className="px-3 py-3"><QueryPill type={c.queryType} /></td>
                                        <td className="px-3 py-3"><StatusPill status={c.status} /></td>
                                        <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                            {fmtDate(c.createdAt)}
                                        </td>
                                        <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                            {fmtDate(c.resolvedAt)}
                                        </td>
                                        <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => setDetailId(c._id)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,white)] transition-all">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* pagination */}
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

            {detailId && (
                <DetailDrawer id={detailId} onClose={() => setDetailId(null)} onAction={onAction} />
            )}
        </>
    );
}

function PgBtn({ children, onClick, disabled, active }) {
    return (
        <button onClick={onClick} disabled={disabled}
            className={`min-w-[28px] h-7 px-1.5 rounded-lg text-[11px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${active ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
            style={active ? { background: "var(--primary)" } : {}}>
            {children}
        </button>
    );
}