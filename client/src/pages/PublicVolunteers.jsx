import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Search,
    Users,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Briefcase,
    Phone,
    Heart,
    Award,
    BookOpen,
    Network,
    CalendarCheck,
    BarChart3,
    PartyPopper,
    ShieldCheck,
} from "lucide-react";
import api from "../api/axiosInstance";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────
   API helper
───────────────────────────────────────── */
async function fetchVolunteers(params) {
    const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ""))
    ).toString();
    const { data } = await api(`/web/volunteers?${qs}`);
    return data;
}

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const STATUS_CONFIG = {
    approved: {
        label: "Approved",
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        dot: "bg-emerald-500",
    },
    pending: {
        label: "Pending",
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
        dot: "bg-amber-400",
    },
    rejected: {
        label: "Rejected",
        badge: "bg-rose-50 text-rose-700 border border-rose-200",
        dot: "bg-rose-500",
    },
};

const PER_PAGE = 10;

const BENEFITS = [
    { icon: Award, title: "Certificate of Appreciation", desc: "Recognize your valuable contribution to society" },
    { icon: BookOpen, title: "Skill Development", desc: "Access free training workshops and certifications" },
    { icon: Network, title: "Networking Opportunities", desc: "Connect with like-minded change-makers" },
    { icon: CalendarCheck, title: "Flexible Hours", desc: "Choose your availability and area of interest" },
    { icon: BarChart3, title: "Impact Reports", desc: "See the difference you're making with regular updates" },
    { icon: PartyPopper, title: "Community Events", desc: "Join meetups, camps, and celebration events" },
];

const IMPACT_STATS = [
    { icon: Users, value: "500+", label: "Active Volunteers" },
    { icon: Clock, value: "50k+", label: "Hours Contributed" },
    { icon: MapPin, value: "100+", label: "Communities Reached" },
    { icon: ShieldCheck, value: "100%", label: "Safety Certified" },
];

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function VolunteerRow({ vol, index }) {
    const sc = STATUS_CONFIG[vol.status] || STATUS_CONFIG.pending;
    return (
        <tr className="hover:bg-blue-50/40 transition-colors cursor-pointer">
            <td className="px-5 py-3.5 text-gray-300 font-mono text-xs">{index}</td>
            <td className="px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                    {vol.volunteerId ? (
                        <span className="inline-flex w-fit items-center bg-[color:var(--primary)]/10 text-[color:var(--primary)] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[color:var(--primary)]/20">
                            {vol.volunteerId}
                        </span>
                    ) : (
                        <span className="inline-flex w-fit items-center bg-gray-100 text-gray-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Not Assigned
                        </span>
                    )}
                    {/* <span className="text-xs text-gray-500 font-medium">{vol.fullName}</span> */}
                </div>
            </td>
            <td className="px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-700">{vol.role}</span>
                    {/* {vol.contribution && (
                        <span className="text-xs text-gray-400 line-clamp-1">{vol.contribution}</span>
                    )} */}
                </div>
            </td>
            <td className="px-4 py-3.5 hidden md:table-cell">
                <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                    {vol.city && (
                        <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-gray-400" />
                            {vol.city}{vol.state ? `, ${vol.state}` : ""}
                        </span>
                    )}
                    {/* {vol.occupation && (
                        <span className="flex items-center gap-1">
                            <Briefcase size={11} className="text-gray-400" />
                            {vol.occupation}
                        </span>
                    )} */}
                </div>
            </td>
            {/* <td className="px-4 py-3.5 hidden lg:table-cell">
                {vol.mobile ? (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone size={11} className="text-gray-400" />
                        {vol.mobile}
                    </span>
                ) : (
                    <span className="text-xs text-gray-300">—</span>
                )}
            </td> */}
            <td className="px-4 py-3.5">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                </span>
            </td>
            <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-gray-400 whitespace-nowrap">
                {new Date(vol.adminApprovedAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                })}
            </td>
        </tr>
    );
}

function Skeleton() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-4">
                            <div className="h-4 bg-gray-100 rounded-full w-full" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function PublicVolunteers() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetchVolunteers({
                page,
                limit: PER_PAGE,
                search: debouncedSearch,
                status: statusFilter,
            });
            setData(res);
        } catch {
            setError("Something went wrong!");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, statusFilter]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

    const pagination = data?.pagination;
    const volunteers = data?.volunteers ?? [];

    const pageNums = useMemo(() => {
        if (!pagination) return [];
        const total = pagination.totalPages;
        const cur = pagination.currentPage;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (cur <= 4) return [1, 2, 3, 4, 5, "...", total];
        if (cur >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
        return [1, "...", cur - 1, cur, cur + 1, "...", total];
    }, [pagination]);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ══════════════════════════════════════
                SECTION 1 — HERO
            ══════════════════════════════════════ */}
            <section className="relative bg-[#0d1b3e] ">
                {/* subtle dot grid bg */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "radial-gradient(circle, #ffffff18 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />
                <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-5 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                        Volunteer Membership
                    </h1>
                    <p className="text-blue-200 text-sm sm:text-base mb-8 max-w-xl mx-auto">
                        Join our mission to create lasting change. Your time and skills can transform lives.
                    </p>
                    <Link
                        href="/membership/volunteer-form"
                        className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm shadow-lg shadow-red-500/30"
                    >
                        Join Our Team
                    </Link>
                </div>

                {/* Impact stat cards — overlapping into next section */}
                <div className="relative max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-0 translate-y-1/2">
                        {IMPACT_STATS.map(({ icon: Icon, value, label }) => (
                            <div key={label} className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center gap-2 border border-gray-100">
                                <Icon size={24} className="text-[color:var(--primary)]" strokeWidth={1.5} />
                                <p className="text-2xl font-bold text-gray-800">{value}</p>
                                <p className="text-xs text-gray-400 text-center">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* spacer for stat cards overlap */}
            <div className="h-24 bg-gray-50" />

            {/* ══════════════════════════════════════
                SECTION 2 — VOLUNTEER TABLE
            ══════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 py-10 space-y-5">

                {/* Section heading */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Meet Our Volunteer Heroes</h2>
                    <p className="text-sm text-gray-400 mt-1">Dedicated individuals making a real difference in communities</p>
                </div>

                {/* Search + Filter */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Volunteer ID, mobile, name..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40 focus:border-[color:var(--primary)] bg-gray-50 text-gray-800 placeholder-gray-400 transition"
                            />
                        </div>

                        {(search || statusFilter) && (
                            <button
                                onClick={() => { setSearch(""); setStatusFilter(""); }}
                                className="text-xs text-rose-500 hover:text-rose-700 font-medium px-3 border border-rose-100 rounded-xl bg-rose-50 whitespace-nowrap"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                        <XCircle size={16} /> {error}
                        <button onClick={load} className="ml-auto underline text-xs">Retry</button>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-10">#</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Volunteer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Location</th>
                                    {/* <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Contact</th> */}
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <Skeleton />
                                ) : volunteers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                                            <div className="flex justify-center mb-3">
                                                <Search size={32} className="text-gray-300" />
                                            </div>
                                            <p className="font-medium text-gray-500">No Volunteer Found</p>
                                            <p className="text-xs mt-1">Please change the search or filter</p>
                                        </td>
                                    </tr>
                                ) : (
                                    volunteers.map((vol, i) => (
                                        <VolunteerRow
                                            key={vol._id}
                                            vol={vol}
                                            index={(page - 1) * PER_PAGE + i + 1}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                            <span className="text-xs text-gray-400">
                                Showing{" "}
                                <span className="text-gray-600 font-medium">
                                    {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, pagination.totalDocs)}
                                </span>{" "}
                                of {pagination.totalDocs} results
                            </span>
                            <div className="flex gap-1 items-center flex-wrap justify-center">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                {pageNums.map((n, i) =>
                                    n === "..." ? (
                                        <span key={`e${i}`} className="px-1 text-gray-300 text-xs">…</span>
                                    ) : (
                                        <button
                                            key={n}
                                            onClick={() => setPage(n)}
                                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${n === page
                                                ? "bg-[color:var(--primary)] text-white border-[color:var(--primary)]"
                                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {n}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════
                SECTION 3 — WHY VOLUNTEER WITH US
            ══════════════════════════════════════ */}
            <section className="bg-[#e8f5e9]/60 py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Why <span className="text-[color:var(--primary)] underline underline-offset-4 decoration-2">Volunteer</span> With Us?
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">Enjoy these amazing benefits while making a positive impact</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {BENEFITS.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="bg-white rounded-2xl p-6 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 mb-4">
                                    <Heart size={22} className="text-emerald-500" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                SECTION 4 — CTA BANNER
            ══════════════════════════════════════ */}
            <section className="bg-[#0d3d26] py-16 px-4 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                        Ready to Make a Difference?
                    </h2>
                    <p className="text-green-200 text-sm mb-8">
                        Join thousands of volunteers who are transforming lives every day.
                    </p>
                    <Link
                        to="/membership/volunteer-form"
                        className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm shadow-lg shadow-red-900/40"
                    >
                        Become a Volunteer Today
                    </Link>
                </div>
            </section>

        </div>
    );
}