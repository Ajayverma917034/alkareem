import { useState, useEffect, useMemo } from 'react';
import { Heart, Calendar, IndianRupee, Search, X, CreditCard, User, Mail, Phone, MessageSquare, Hash } from 'lucide-react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function MyDonations() {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedDonation, setSelectedDonation] = useState(null);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/donations/my-donations");
            if (data?.success) {
                setDonations(data.donations || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const filteredDonations = useMemo(() => {
        return donations.filter((item) => {
            const purpose = item?.purpose || "General Donation";
            const transactionId =
                item?.payment?.razorpayPaymentId ||
                item?.payment?.razorpayOrderId ||
                item?.offlineReference ||
                "";
            const status = item?.payment?.status || item?.status || "pending";

            const matchSearch =
                purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transactionId.toLowerCase().includes(searchTerm.toLowerCase());

            const matchFilter =
                filterStatus === "all"
                    ? true
                    : status.toLowerCase() === filterStatus.toLowerCase();

            return matchSearch && matchFilter;
        });
    }, [donations, searchTerm, filterStatus]);

    const totalDonated = donations.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
    );

    const getStatusClasses = (status) => {
        if (status === "paid" || status === "completed")
            return "bg-green-100 text-green-700";
        if (status === "pending")
            return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-700";
    };

    // ─── Detail Modal ────────────────────────────────────────────────────────────
    const DonationDetailModal = ({ donation, onClose }) => {
        if (!donation) return null;

        const status = donation?.payment?.status || donation?.status;

        // Close on backdrop click
        const handleBackdrop = (e) => {
            if (e.target === e.currentTarget) onClose();
        };

        // Close on Escape
        useEffect(() => {
            const handler = (e) => { if (e.key === "Escape") onClose(); };
            window.addEventListener("keydown", handler);
            return () => window.removeEventListener("keydown", handler);
        }, []);

        const DetailRow = ({ icon: Icon, label, value, mono = false }) => (
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className={`text-sm text-gray-900 font-medium break-all ${mono ? "font-mono" : ""}`}>
                        {value || "—"}
                    </p>
                </div>
            </div>
        );

        return (
            <div
                className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
                onClick={handleBackdrop}
            >
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="text-white text-lg font-bold">Donation Details</h2>
                            <p className="text-blue-100 text-xs mt-0.5">Full transaction breakdown</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Amount Hero */}
                    <div className="px-6 py-5 text-center border-b border-gray-100 flex-shrink-0">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Amount Donated</p>
                        <p className="text-4xl font-bold text-gray-900">{formatAmount(donation.amount)}</p>
                        <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status === "paid" || status === "completed" ? "bg-green-500" : status === "pending" ? "bg-yellow-500" : "bg-red-500"}`} />
                            {status}
                        </span>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">

                        {/* Donor Info */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Donor Information</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            <DetailRow icon={User} label="Full Name" value={donation.fullName} />
                            <DetailRow icon={Mail} label="Email" value={donation.email} />
                            <DetailRow icon={Phone} label="Phone" value={donation.phone} />
                        </div>

                        {/* Donation Info */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Donation Info</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            <DetailRow icon={Heart} label="Purpose" value={donation.purpose || "General Donation"} />
                            <DetailRow icon={CreditCard} label="Mode" value={donation.mode} />
                            <DetailRow icon={Calendar} label="Donated On" value={formatDateTime(donation.createdAt)} />
                            {donation.paidAt && (
                                <DetailRow icon={Calendar} label="Paid At" value={formatDateTime(donation.paidAt)} />
                            )}
                            {donation.message && (
                                <DetailRow icon={MessageSquare} label="Message" value={donation.message} />
                            )}
                        </div>

                        {/* Payment Info */}
                        {donation.payment && (
                            <>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment Info</p>
                                <div className="bg-gray-50 rounded-xl px-4 mb-4">
                                    {donation.payment.razorpayPaymentId && (
                                        <DetailRow icon={Hash} label="Payment ID" value={donation.payment.razorpayPaymentId} mono />
                                    )}
                                    {donation.payment.razorpayOrderId && (
                                        <DetailRow icon={Hash} label="Order ID" value={donation.payment.razorpayOrderId} mono />
                                    )}
                                    {donation.payment.receipt && (
                                        <DetailRow icon={Hash} label="Receipt" value={donation.payment.receipt} mono />
                                    )}
                                    <DetailRow icon={IndianRupee} label="Currency" value={donation.currency || donation.payment.currency} />
                                </div>
                            </>
                        )}

                        {/* Offline reference */}
                        {donation.offlineReference && (
                            <>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Reference</p>
                                <div className="bg-gray-50 rounded-xl px-4 mb-4">
                                    <DetailRow icon={Hash} label="Offline Reference" value={donation.offlineReference} mono />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ─── Main Render ─────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto">

            {/* Detail Modal */}
            {selectedDonation && (
                <DonationDetailModal
                    donation={selectedDonation}
                    onClose={() => setSelectedDonation(null)}
                />
            )}

            {/* Header */}
            <div className="mb-4">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">My Donations</h1>
                <p className="text-gray-600 text-sm">Track all your contributions and make a difference</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <IndianRupee className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Donated</p>
                            <p className="text-2xl font-bold text-gray-900">{formatAmount(totalDonated)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Donations</p>
                            <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
                        </div>
                    </div>
                </div>


            </div>

            {/* Donations List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Loading your donations...</p>
                    </div>
                ) : filteredDonations.length === 0 ? (
                    <div className="p-12 text-center">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No donations found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try adjusting your search criteria' : 'Start making a difference by donating today!'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Purpose</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Mode</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Transaction ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDonations.map((donation) => {
                                    const status = donation?.payment?.status || donation?.status;
                                    return (
                                        <tr key={donation._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm">
                                                {formatDate(donation.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {donation.purpose || "General Donation"}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                                                {formatAmount(donation.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-sm capitalize">
                                                {donation.mode}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono">
                                                {donation?.payment?.razorpayPaymentId ||
                                                    donation?.payment?.razorpayOrderId ||
                                                    donation.offlineReference ||
                                                    "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(status)}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedDonation(donation)}
                                                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Make New Donation CTA */}
            <div className="mt-8 bg-gradient-to-r from-(--primary) to-blue-500 rounded-2xl shadow-lg p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Continue Making a Difference</h3>
                        <p className="text-blue-100">Your contributions help us serve the community better</p>
                    </div>
                    <Link to={'/donate'} className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all whitespace-nowrap">
                        Donate Now
                    </Link>
                </div>
            </div>
        </div>
    );
}