import { useEffect, useState, useCallback } from "react";
import {
    Users, FileText, HelpCircle, UserCheck, Award,
    RefreshCw, TrendingUp, TrendingDown, CheckCircle, XCircle,
    DollarSign, CreditCard, LayoutGrid, Mail, Phone, Calendar, Clock,
} from "lucide-react";
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import StatCard from "./StatCard";
import WidgetCard from "./WidgetCard";
import { getDashboardStatsAPI } from "../../utils/dashboardapi";

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingSkeleton = ({ className = "" }) => (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

const ChangeTag = ({ pct }) => {
    if (pct === null || pct === undefined) return null;
    const positive = pct >= 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            {positive ? "+" : ""}{pct}%
        </span>
    );
};

const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// ─── Recent Users Table ───────────────────────────────────────────────────────

const RecentUsersWidget = ({ users = [], loading }) => (
    <WidgetCard title="Recent Users">
        <div className="flex flex-col gap-2.5">
            {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <LoadingSkeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                            <LoadingSkeleton className="h-2.5 w-32" />
                            <LoadingSkeleton className="h-2 w-48" />
                        </div>
                        <LoadingSkeleton className="h-4 w-14 rounded-full" />
                    </div>
                ))
                : users.map((u) => {
                    const initials = u.name?.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "?";
                    const colors = ["bg-violet-500", "bg-emerald-400", "bg-blue-500", "bg-orange-400", "bg-pink-500"];
                    const color = colors[u.name?.charCodeAt(0) % colors.length] || "bg-slate-400";
                    return (
                        <div key={u._id} className="flex items-center gap-3 py-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${color}`}>
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] font-semibold text-slate-700 truncate">{u.name || "—"}</p>
                                <p className="text-[10px] text-slate-400 truncate">{u.email || u.phone}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${u.isPhoneVerified ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {u.isPhoneVerified ? <CheckCircle size={9} /> : <Clock size={9} />}
                                {u.isPhoneVerified ? "Verified" : "Pending"}
                            </span>
                        </div>
                    );
                })}
            {!loading && users.length === 0 && (
                <p className="text-center text-slate-400 text-xs py-4">No users yet.</p>
            )}
        </div>
    </WidgetCard>
);

// ─── Recent Contacts Widget ───────────────────────────────────────────────────

const RecentContactsWidget = ({ contacts = [], loading }) => {
    const statusColors = {
        open: "bg-blue-100 text-blue-700",
        in_progress: "bg-yellow-100 text-yellow-700",
        resolved: "bg-emerald-100 text-emerald-700",
        closed: "bg-slate-100 text-slate-700",
    };

    const queryTypeColors = {
        volunteer: "bg-purple-100 text-purple-700",
        dignitory: "bg-indigo-100 text-indigo-700",
        donation: "bg-green-100 text-green-700",
        membership: "bg-orange-100 text-orange-700",
        other: "bg-slate-100 text-slate-700",
    };

    return (
        <WidgetCard title="Recent Contact Queries">
            <div className="flex flex-col gap-2.5">
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 py-1">
                            <LoadingSkeleton className="w-8 h-8 rounded-lg" />
                            <div className="flex-1 space-y-1.5">
                                <LoadingSkeleton className="h-3 w-40" />
                                <LoadingSkeleton className="h-2 w-32" />
                                <LoadingSkeleton className="h-2 w-24" />
                            </div>
                        </div>
                    ))
                    : contacts.map((c) => (
                        <div key={c._id} className="flex items-start gap-3 py-1 border-b border-slate-50 last:border-0 pb-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Mail size={14} className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] font-semibold text-slate-700 truncate">{c.subject}</p>
                                <p className="text-[10px] text-slate-500 truncate">{c.name} · {c.phone}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${queryTypeColors[c.queryType] || queryTypeColors.other}`}>
                                        {c.queryType}
                                    </span>
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[c.status] || statusColors.open}`}>
                                        {c.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                {!loading && contacts.length === 0 && (
                    <p className="text-center text-slate-400 text-xs py-4">No contacts yet.</p>
                )}
            </div>
        </WidgetCard>
    );
};

// ─── Recent Volunteers Widget ─────────────────────────────────────────────────

const RecentVolunteersWidget = ({ volunteers = [], loading }) => {
    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        approved: "bg-emerald-100 text-emerald-700",
        rejected: "bg-red-100 text-red-700",
    };

    return (
        <WidgetCard title="Recent Volunteer Applications">
            <div className="flex flex-col gap-2.5">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <LoadingSkeleton className="w-8 h-8 rounded-full" />
                            <div className="flex-1 space-y-1.5">
                                <LoadingSkeleton className="h-2.5 w-32" />
                                <LoadingSkeleton className="h-2 w-24" />
                            </div>
                            <LoadingSkeleton className="h-4 w-16 rounded-full" />
                        </div>
                    ))
                    : volunteers.map((v) => {
                        const initials = v.fullName?.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "V";
                        return (
                            <div key={v._id} className="flex items-center gap-3 py-1">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12.5px] font-semibold text-slate-700 truncate">
                                        {v.fullName}
                                        {v.volunteerId && <span className="ml-2 text-[10px] text-slate-400">({v.volunteerId})</span>}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">{v.role} · {v.mobile}</p>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[v.status] || statusColors.pending}`}>
                                    {v.status}
                                </span>
                            </div>
                        );
                    })}
                {!loading && volunteers.length === 0 && (
                    <p className="text-center text-slate-400 text-xs py-4">No volunteers yet.</p>
                )}
            </div>
        </WidgetCard>
    );
};

// ─── Recent Donations Widget ──────────────────────────────────────────────────

const RecentDonationsWidget = ({ donations = [], loading }) => (
    <WidgetCard title="Recent Donations">
        <div className="flex flex-col gap-2.5">
            {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <LoadingSkeleton className="w-8 h-8 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                            <LoadingSkeleton className="h-2.5 w-32" />
                            <LoadingSkeleton className="h-2 w-24" />
                        </div>
                        <LoadingSkeleton className="h-5 w-16" />
                    </div>
                ))
                : donations.map((d) => (
                    <div key={d._id} className="flex items-center gap-3 py-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${d.mode === "online" ? "bg-green-100" : "bg-blue-100"}`}>
                            {d.mode === "online"
                                ? <CreditCard size={14} className="text-green-500" />
                                : <DollarSign size={14} className="text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-semibold text-slate-700 truncate">{d.fullName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{d.purpose || "General Donation"}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-emerald-600">{fmtCurrency(d.amount)}</p>
                            <p className="text-[9px] text-slate-400">{d.mode}</p>
                        </div>
                    </div>
                ))}
            {!loading && donations.length === 0 && (
                <p className="text-center text-slate-400 text-xs py-4">No donations yet.</p>
            )}
        </div>
    </WidgetCard>
);

// ─── Main DashboardPage ───────────────────────────────────────────────────────

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const res = await getDashboardStatsAPI();
            if (res.success) setData(res.data);
            else throw new Error(res.message || "Failed to load dashboard");
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const s = data?.stats;
    const charts = data?.charts;
    const recent = data?.recent;

    // Stat cards config
    const statCards = [
        {
            title: "Total Users",
            value: loading ? "—" : s?.users.total.toLocaleString(),
            change: loading ? null : `${s?.users.changePercent >= 0 ? "+" : ""}${s?.users.changePercent}%`,
            label: "vs last month",
            icon: Users,
            gradient: "bg-gradient-to-br from-violet-500 to-indigo-500",
        },
        {
            title: "Contacts",
            value: loading ? "—" : s?.contacts.total.toLocaleString(),
            change: loading ? null : `${s?.contacts.changePercent >= 0 ? "+" : ""}${s?.contacts.changePercent}%`,
            label: "vs last month",
            icon: Mail,
            gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
        },
        {
            title: "Volunteers",
            value: loading ? "—" : s?.volunteers.total.toLocaleString(),
            change: loading ? null : `${s?.volunteers.changePercent >= 0 ? "+" : ""}${s?.volunteers.changePercent}%`,
            label: "vs last month",
            icon: UserCheck,
            gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
        },
        {
            title: "Dignitaries",
            value: loading ? "—" : s?.dignitaries.total.toLocaleString(),
            change: loading ? null : `${s?.dignitaries.changePercent >= 0 ? "+" : ""}${s?.dignitaries.changePercent}%`,
            label: "vs last month",
            icon: Award,
            gradient: "bg-gradient-to-br from-orange-400 to-red-500",
        },
        {
            title: "Total Donations",
            value: loading ? "—" : fmtCurrency(s?.donations.totalAmount || 0),
            change: loading ? null : `${s?.donations.changePercent >= 0 ? "+" : ""}${s?.donations.changePercent}%`,
            label: `${s?.donations.total || 0} donations`,
            icon: DollarSign,
            gradient: "bg-gradient-to-br from-emerald-400 to-teal-500",
        },
        {
            title: "Active Subscriptions",
            value: loading ? "—" : s?.subscriptions.active.toLocaleString(),
            change: null,
            label: `${s?.subscriptions.total || 0} total`,
            icon: CreditCard,
            gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
        },
        {
            title: "Total Payments",
            value: loading ? "—" : s?.payments.total.toLocaleString(),
            change: loading ? null : `${s?.payments.changePercent >= 0 ? "+" : ""}${s?.payments.changePercent}%`,
            label: "vs last month",
            icon: CreditCard,
            gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
        },
        {
            title: "Admins",
            value: loading ? "—" : s?.admins.total.toLocaleString(),
            change: null,
            label: `${s?.admins.verified || 0} verified`,
            icon: Users,
            gradient: "bg-gradient-to-br from-slate-500 to-slate-700",
        },
    ];

    // User verification pie
    const userPieData = s
        ? [
            { name: "Verified", value: s.users.verified, color: "#10b981" },
            { name: "Unverified", value: s.users.unverified, color: "#e2e8f0" },
        ]
        : [{ name: "Verified", value: 1, color: "#e2e8f0" }];

    // Volunteer status pie
    const volunteerPieData = s
        ? [
            { name: "Approved", value: s.volunteers.approved, color: "#10b981" },
            { name: "Pending", value: s.volunteers.pending, color: "#fbbf24" },
            { name: "Rejected", value: s.volunteers.rejected, color: "#ef4444" },
        ]
        : [];

    // Dignitary status pie
    const dignitaryPieData = s
        ? [
            { name: "Approved", value: s.dignitaries.approved, color: "#10b981" },
            { name: "Pending", value: s.dignitaries.pending, color: "#fbbf24" },
            { name: "Rejected", value: s.dignitaries.rejected, color: "#ef4444" },
        ]
        : [];

    return (
        <div className="p-4 sm:p-5 lg:p-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Welcome to Dashboard!</h2>
                    <p className="text-xs text-slate-400 mt-0.5">All Kareem Tarbiyat Admin › Dashboard</p>
                </div>
                <button
                    onClick={() => fetchStats(true)}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:shadow-sm transition-all disabled:opacity-50 w-fit"
                >
                    <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                    <XCircle size={15} />
                    {error}
                    <button onClick={() => fetchStats()} className="ml-auto text-red-500 underline text-xs">Retry</button>
                </div>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-5">
                {statCards.map((card) => (
                    <StatCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        change={card.change}
                        label={card.label}
                        icon={card.icon}
                        gradient={card.gradient}
                    />
                ))}
            </div>

            {/* Row 1: Users Chart + User Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-4">
                <WidgetCard title="New Users (Last 7 Days)">
                    {loading ? (
                        <LoadingSkeleton className="h-[200px] w-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={charts?.usersByDay || []}>
                                <defs>
                                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                                <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#userGrad)" name="New Users" dot={{ fill: "#8b5cf6", r: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </WidgetCard>

                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
                    <div className="flex-1">
                        {loading ? (
                            <div className="space-y-1">
                                <LoadingSkeleton className="h-7 w-16" />
                                <LoadingSkeleton className="h-2 w-24 mt-1" />
                            </div>
                        ) : (
                            <>
                                <p className="text-2xl font-extrabold text-slate-800 mb-0.5">
                                    {s?.users.total > 0 ? Math.round((s.users.verified / s.users.total) * 100) : 0}%
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified Users</p>
                            </>
                        )}
                    </div>
                    <div className="ml-auto">
                        <PieChart width={60} height={60}>
                            <Pie data={userPieData} dataKey="value" cx={28} cy={28} innerRadius={16} outerRadius={28} startAngle={90} endAngle={-270} strokeWidth={0}>
                                {userPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                        </PieChart>
                    </div>
                </div>
            </div>

            {/* Row 2: Contacts Chart + Volunteers Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <WidgetCard title="Contact Queries (Last 7 Days)">
                    {loading ? (
                        <LoadingSkeleton className="h-[180px] w-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={charts?.contactsByDay || []} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                                <Bar dataKey="contacts" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Contacts" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </WidgetCard>

                <WidgetCard title="Volunteer Applications (Last 6 Months)">
                    {loading ? (
                        <LoadingSkeleton className="h-[180px] w-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={charts?.volunteersByMonth || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                                <Line type="monotone" dataKey="volunteers" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: "#a855f7", r: 4 }} name="Volunteers" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </WidgetCard>
            </div>

            {/* Row 3: Donations Chart + Status Pies */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_540px] gap-4 mb-4">
                <WidgetCard title="Donations (Last 7 Days)">
                    {loading ? (
                        <LoadingSkeleton className="h-[200px] w-full" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={charts?.donationsByDay || []} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                                <Bar dataKey="donations" fill="#10b981" radius={[3, 3, 0, 0]} name="Donations" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </WidgetCard>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <WidgetCard title="Volunteer Status">
                        <div className="flex items-center justify-center gap-6 py-2">
                            <PieChart width={100} height={100}>
                                <Pie data={volunteerPieData} dataKey="value" cx={48} cy={48} innerRadius={28} outerRadius={46} strokeWidth={0}>
                                    {volunteerPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                            </PieChart>
                            <div className="flex flex-col gap-2">
                                {volunteerPieData.map((entry) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                                        <span className="text-[11px] text-slate-600">{entry.name}</span>
                                        <span className="text-[11px] font-bold text-slate-800 ml-auto">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </WidgetCard>

                    <WidgetCard title="Dignitary Status">
                        <div className="flex items-center justify-center gap-6 py-2">
                            <PieChart width={100} height={100}>
                                <Pie data={dignitaryPieData} dataKey="value" cx={48} cy={48} innerRadius={28} outerRadius={46} strokeWidth={0}>
                                    {dignitaryPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                            </PieChart>
                            <div className="flex flex-col gap-2">
                                {dignitaryPieData.map((entry) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                                        <span className="text-[11px] text-slate-600">{entry.name}</span>
                                        <span className="text-[11px] font-bold text-slate-800 ml-auto">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </WidgetCard>
                </div>
            </div>

            {/* Row 4: Recent Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <RecentUsersWidget users={recent?.users || []} loading={loading} />
                <RecentContactsWidget contacts={recent?.contacts || []} loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RecentVolunteersWidget volunteers={recent?.volunteers || []} loading={loading} />
                <RecentDonationsWidget donations={recent?.donations || []} loading={loading} />
            </div>
        </div>
    );
};

export default DashboardPage;