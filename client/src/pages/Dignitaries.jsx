import { useState, useEffect, useMemo } from 'react';
import {
    User, Calendar, Search, X, Mail, Phone,
    MapPin, Briefcase, FileText, Hash, Shield,
    ClipboardList, BadgeCheck, UserCheck, Star,
    Building2, Tag, Globe
} from 'lucide-react';
import api from '../api/axiosInstance';
import { Link } from 'react-router-dom';

export default function Dignitaries() {
    const [dignitaries, setDignitaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedDignitary, setSelectedDignitary] = useState(null);

    useEffect(() => {
        fetchDignitaries();
    }, []);

    const fetchDignitaries = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/dignitaries/my-dignitaries");
            if (data?.success) {
                setDignitaries(data.dignitaries || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusClasses = (status) => {
        if (status === "approved") return "bg-green-100 text-green-700";
        if (status === "pending") return "bg-yellow-100 text-yellow-700";
        if (status === "rejected") return "bg-red-100 text-red-700";
        return "bg-gray-100 text-gray-600";
    };

    const getStatusDot = (status) => {
        if (status === "approved") return "bg-green-500";
        if (status === "pending") return "bg-yellow-500";
        return "bg-red-500";
    };

    const filteredDignitaries = useMemo(() => {
        return dignitaries.filter((item) => {
            const dignitaryName = item?.dignitaryName || "";
            const dignitaryId = item?.dignitaryId || "";
            const role = item?.role || "";
            const placeType = item?.placeType || "";

            const matchSearch =
                dignitaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dignitaryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                placeType.toLowerCase().includes(searchTerm.toLowerCase());

            const matchFilter =
                filterStatus === "all"
                    ? true
                    : item.status?.toLowerCase() === filterStatus.toLowerCase();

            return matchSearch && matchFilter;
        });
    }, [dignitaries, searchTerm, filterStatus]);

    const approvedCount = dignitaries.filter((d) => d.status === "approved").length;
    const pendingCount = dignitaries.filter((d) => d.status === "pending").length;

    // ─── Detail Modal ────────────────────────────────────────────────────────────
    const DignitaryDetailModal = ({ dignitary, onClose }) => {
        if (!dignitary) return null;

        const handleBackdrop = (e) => {
            if (e.target === e.currentTarget) onClose();
        };

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
                    <div className="bg-gradient-to-r from-(--primary) to-blue-500 px-6 py-5 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="text-white text-lg font-bold">Dignitary Details</h2>
                            <p className="text-blue-100 text-xs mt-0.5">Full application breakdown</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Hero — Name + Status */}
                    <div className="px-6 py-5 text-center border-b border-gray-100 flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                            <Star className="w-7 h-7 text-blue-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{dignitary.dignitaryName}</p>
                        {dignitary.dignitaryId && (
                            <p className="text-xs font-mono text-gray-500 mt-0.5">{dignitary.dignitaryId}</p>
                        )}
                        <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(dignitary.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(dignitary.status)}`} />
                            {dignitary.status}
                        </span>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">

                        {/* Personal Info */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Personal Information</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            <DetailRow icon={User} label="Full Name" value={dignitary.fullName} />
                            <DetailRow icon={Mail} label="Email" value={dignitary.email} />
                            <DetailRow icon={Phone} label="Mobile" value={dignitary.mobile} />
                            <DetailRow icon={User} label="Gender" value={dignitary.gender} />
                        </div>

                        {/* Personal Address */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Personal Address</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            <DetailRow icon={MapPin} label="City" value={dignitary.city} />
                            <DetailRow icon={MapPin} label="State" value={dignitary.state} />
                            <DetailRow icon={Globe} label="Country" value={dignitary.country} />
                            <DetailRow icon={Hash} label="Pincode" value={dignitary.pincode} />
                        </div>

                        {/* Dignitary / Place Info */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Dignitary Information</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            <DetailRow icon={UserCheck} label="Dignitary Name" value={dignitary.dignitaryName} />
                            <DetailRow icon={Tag} label="Place Type" value={dignitary.placeType} />
                            <DetailRow icon={Shield} label="Role" value={dignitary.role} />
                        </div>

                        {/* Place Address */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Place Address</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            <DetailRow icon={Building2} label="Full Address" value={dignitary.fullAddress} />
                            <DetailRow icon={MapPin} label="City" value={dignitary.placeCity} />
                            <DetailRow icon={MapPin} label="State" value={dignitary.placeState} />
                            <DetailRow icon={Globe} label="Country" value={dignitary.placeCountry} />
                            <DetailRow icon={Hash} label="Pincode" value={dignitary.placePincode} />
                        </div>

                        {/* Approval Timeline */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Timeline</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            <DetailRow icon={Calendar} label="Applied On" value={formatDateTime(dignitary.createdAt)} />
                            {dignitary.approvedAt && (
                                <DetailRow icon={BadgeCheck} label="Approved On" value={formatDateTime(dignitary.approvedAt)} />
                            )}
                            {dignitary.rejectedAt && (
                                <DetailRow icon={X} label="Rejected On" value={formatDateTime(dignitary.rejectedAt)} />
                            )}
                            {dignitary.rejectedReason && (
                                <DetailRow icon={X} label="Rejection Reason" value={dignitary.rejectedReason} />
                            )}
                        </div>

                        {/* Documents */}
                        {dignitary.documents?.length > 0 && (
                            <>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                    Documents ({dignitary.documents.length})
                                </p>
                                <div className="bg-gray-50 rounded-xl px-4 mb-4">
                                    {dignitary.documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {doc.fileName || `Document ${idx + 1}`}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {doc.fileType || ""} {doc.fileSize ? `· ${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                                                </p>
                                            </div>
                                            {doc.url && (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>
                                    ))}
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

    // ─── Mobile Card ─────────────────────────────────────────────────────────────
    const MobileCard = ({ dignitary }) => (
        <div className="p-4 border-b border-gray-200 last:border-0">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{dignitary.dignitaryName || "—"}</p>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">
                        {dignitary.dignitaryId || <span className="text-gray-400 italic">Not assigned</span>}
                    </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap flex-shrink-0 ${getStatusClasses(dignitary.status)}`}>
                    {dignitary.status}
                </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Place:</span> {dignitary.placeType || "—"}</p>
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Role:</span> {dignitary.role || "—"}</p>
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Date:</span> {formatDate(dignitary.createdAt)}</p>
            </div>
            <button
                onClick={() => setSelectedDignitary(dignitary)}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
                View Details
            </button>
        </div>
    );

    // ─── Main Render ─────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto">

            {/* Detail Modal */}
            {selectedDignitary && (
                <DignitaryDetailModal
                    dignitary={selectedDignitary}
                    onClose={() => setSelectedDignitary(null)}
                />
            )}

            {/* Header */}
            <div className="mb-4">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">My Dignitary Applications</h1>
                <p className="text-gray-600 text-sm">Track your dignitary applications and their status</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-6 mb-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Applications</p>
                            <p className="text-2xl font-bold text-gray-900">{dignitaries.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:mb-2">
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                            <BadgeCheck className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Approved</p>
                            <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:mb-2">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pending Review</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dignitaries List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Loading your applications...</p>
                    </div>
                ) : filteredDignitaries.length === 0 ? (
                    <div className="p-12 text-center">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try adjusting your search criteria' : 'Apply as a dignitary and start making an impact!'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Dignitary ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Dignitary Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Place Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredDignitaries.map((dignitary) => (
                                        <tr key={dignitary._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                {formatDate(dignitary.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono whitespace-nowrap">
                                                {dignitary.dignitaryId || (
                                                    <span className="text-gray-400 italic text-xs">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {dignitary.dignitaryName || "—"}
                                            </td>
                                            <td className="px-6 py-4 text-sm max-w-[140px] truncate">
                                                {dignitary.placeType || "—"}
                                            </td>
                                            <td className="px-6 py-4 text-sm max-w-[140px] truncate">
                                                {dignitary.role || "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${getStatusClasses(dignitary.status)}`}>
                                                    {dignitary.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedDignitary(dignitary)}
                                                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {filteredDignitaries.map((dignitary) => (
                                <MobileCard key={dignitary._id} dignitary={dignitary} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* CTA */}
            <div className="mt-4 bg-gradient-to-r from-(--primary) to-blue-500 rounded-2xl shadow-sm sm:shadow-lg p-4 sm:p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold sm:mb-2">Want to Apply Again?</h3>
                        <p className="text-sm sm:text-blue-100">Your recognition helps us build a stronger community</p>
                    </div>
                    <Link
                        to="/membership/dignitary-form"
                        className="px-6 py-2 sm:py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all whitespace-nowrap"
                    >
                        Apply Now
                    </Link>
                </div>
            </div>
        </div>
    );
}