import { useState, useEffect } from "react";
import {
    IndianRupee, TrendingUp, Calendar, DollarSign,
    RefreshCw, CheckCircle2, Wallet, Filter, X
} from "lucide-react";
import api from "../api/axiosInstance";

/* ─── helpers ─────────────────────────────────────── */
const fmt = (n) =>
    "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

/* ─── StatCard component ──────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, gradient, iconColor }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl border border-white/20 shadow-lg p-5 flex items-start gap-4 hover:shadow-xl transition-shadow`}>
        <div className={`rounded-xl p-3 ${iconColor} bg-white/20 backdrop-blur-sm`}>
            <Icon size={22} className="text-white drop-shadow" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-white/80 font-semibold uppercase tracking-wider truncate">{label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1 leading-tight drop-shadow">{value}</p>
            {sub && <p className="text-xs text-white/70 mt-1">{sub}</p>}
        </div>
    </div>
);

/* ─── Donation Table Component ───────────────────── */
const DonationTable = ({ donations, onDelete }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donation ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation, index) => (
                        <tr key={donation.donationId || index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {donation.donationId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {donation.donorName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                                {fmt(donation.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {donation.purpose}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${donation.category === "Education" ? "bg-blue-100 text-blue-700" :
                                    donation.category === "Health" ? "bg-green-100 text-green-700" :
                                        donation.category === "Women" ? "bg-pink-100 text-pink-700" :
                                            "bg-gray-100 text-gray-700"
                                    }`}>
                                    {donation.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                📅 {formatDate(donation.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {donation.paymentMethod}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                    {donation.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {donations.length === 0 && (
            <div className="text-center py-12">
                <p className="text-gray-500">No donations found for the selected date range</p>
            </div>
        )}
    </div>
);

/* ─── Pagination Component ───────────────────────── */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of{" "}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {getPageNumbers().map((page, idx) => (
                            page === '...' ? (
                                <span key={`dots-${idx}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                                        ? "z-10 bg-emerald-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

/* ─── Date Range Filter Component ────────────────── */
const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
            <Filter size={18} className="text-emerald-600" />
            <h3 className="font-semibold text-gray-700">Date Range Filter</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
            </div>
            <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
            </div>
            {(startDate || endDate) && (
                <button
                    onClick={onClear}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                    <X size={14} />
                    Clear
                </button>
            )}
        </div>
    </div>
);

/* ─── main component ──────────────────────────────── */
export default function DonationSummary() {
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [stats, setStats] = useState({
        totalDonations: 0,
        totalDonationsCount: 0,
        todayDonations: 0,
        todayDonationsCount: 0,
        totalExpenses: 0,
        totalExpensesCount: 0,
    });

    // Donation list states
    const [donations, setDonations] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalDocs: 0,
        limit: 10
    });

    // Filter states
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const loadStats = async () => {
        try {
            const donationRes = await api.get("/web/donations/summary");
            const expenseRes = await api.get("/web/expenses/total");

            if (donationRes.data.success && expenseRes.data.success) {
                setStats({
                    totalDonations: donationRes.data.data.allTime?.amount || 0,
                    totalDonationsCount: donationRes.data.data.allTime?.count || 0,
                    todayDonations: donationRes.data.data.today?.amount || 0,
                    todayDonationsCount: donationRes.data.data.today?.count || 0,
                    totalExpenses: expenseRes.data.data.totalAmount || 0,
                    totalExpensesCount: expenseRes.data.data.totalCount || 0,
                });
            }
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    const loadDonations = async (page = 1) => {
        setTableLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: pagination.limit,
            });

            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            const response = await api.get(`/web/donations/list?${params}`);

            if (response.data.success) {
                setDonations(response.data.data.donations);
                setPagination({
                    currentPage: response.data.data.pagination.currentPage,
                    totalPages: response.data.data.pagination.totalPages,
                    totalDocs: response.data.data.pagination.totalDocs,
                    limit: response.data.data.pagination.limit,
                });
            }
        } catch (error) {
            console.error("Failed to load donations:", error);
        } finally {
            setTableLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            loadDonations(newPage);
        }
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        // Reset to first page when filter changes
        loadDonations(1);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        loadDonations(1);
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        loadDonations(1);
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([loadStats(), loadDonations()]);
            setLoading(false);
        };
        fetchAllData();
    }, []);

    const netBalance = stats.totalDonations - stats.totalExpenses;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/10">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12 space-y-6">

                {/* ── header ── */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
                        <Wallet className="text-emerald-600" size={32} />
                        Donation Report
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
                        Transparency is our priority. Here is a record of recent and previous donations made to support our initiatives.
                    </p>

                </div>

                {/* ── stat cards grid ── */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                        <div className="h-8 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard
                                icon={IndianRupee}
                                label="Total Donations"
                                value={fmt(stats.totalDonations)}
                                sub={`${stats.totalDonationsCount} contributions received`}
                                gradient="from-emerald-500 to-emerald-600"
                                iconColor="text-emerald-600"
                            />
                            <StatCard
                                icon={Calendar}
                                label="Today's Donations"
                                value={fmt(stats.todayDonations)}
                                sub={`${stats.todayDonationsCount} donations today`}
                                gradient="from-blue-500 to-blue-600"
                                iconColor="text-blue-600"
                            />
                            <StatCard
                                icon={DollarSign}
                                label="Total Expenses"
                                value={fmt(stats.totalExpenses)}
                                sub={`${stats.totalExpensesCount} expense records`}
                                gradient="from-orange-500 to-orange-600"
                                iconColor="text-orange-600"
                            />

                        </div>
                        {/* Donation List Section */}
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <h2 className="text-xl font-bold text-gray-800">Recent Donations</h2>
                                <div className="text-sm text-gray-500">
                                    Total: <span className="font-semibold text-gray-700">{pagination.totalDocs}</span> donations
                                </div>
                            </div>

                            <DateRangeFilter
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={handleStartDateChange}
                                onEndDateChange={handleEndDateChange}
                                onClear={clearFilters}
                            />

                            {tableLoading ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
                                    <div className="flex items-center justify-center">
                                        <RefreshCw size={32} className="animate-spin text-emerald-600" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <DonationTable donations={donations} />
                                    <Pagination
                                        currentPage={pagination.currentPage}
                                        totalPages={pagination.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}