import { useState, useEffect } from 'react';
import { CreditCard, Calendar, IndianRupee, X, User, Hash, FileText, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, Download, Eye } from 'lucide-react';
import api from '../api/axiosInstance';
import { pdf, PDFViewer } from "@react-pdf/renderer";
import PaymentPDF from '../components/PaymentPDF';
export default function MyPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/payments/my-payments");
            if (data?.success) {
                setPayments(data.payments || []);
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
        // Amount is in paise, convert to rupees
        const amountInRupees = amount / 100;
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amountInRupees || 0);
    };

    const getStatusClasses = (status) => {
        switch (status?.toLowerCase()) {
            case "paid":
            case "active":
                return "bg-green-100 text-green-700 border-green-200";
            case "created":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "failed":
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            case "refunded":
                return "bg-orange-100 text-orange-700 border-orange-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "paid":
            case "active":
                return <CheckCircle className="w-4 h-4" />;
            case "failed":
            case "cancelled":
                return <XCircle className="w-4 h-4" />;
            case "refunded":
                return <RefreshCw className="w-4 h-4" />;
            case "created":
                return <Clock className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type) => {
        return type === "donate" ? "text-pink-600 bg-pink-50" : "text-purple-600 bg-purple-50";
    };

    // ─── Detail Modal ────────────────────────────────────────────────────────────
    const PaymentDetailModal = ({ payment, onClose }) => {
        if (!payment) return null;

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

                <div className="h-[500px] border rounded-lg overflow-hidden">

                </div>
                <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                    {/* Modal Header */}
                    <div className="bg-(--primary) px-6 py-5 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="text-white text-lg font-bold">Payment Details</h2>
                            <p className="text-purple-100 text-xs mt-0.5">Complete transaction information</p>
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
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Payment Amount</p>
                        <p className="text-4xl font-bold text-gray-900">{formatAmount(payment.amount)}</p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusClasses(payment.status)}`}>
                                {getStatusIcon(payment.status)}
                                {payment.status}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getTypeColor(payment.type)}`}>
                                {payment.type}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">

                        {/* Payment Info */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment Information</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            <DetailRow icon={Hash} label="Payment Type" value={payment.type} />
                            <DetailRow icon={IndianRupee} label="Currency" value={payment.currency} />
                            <DetailRow icon={CreditCard} label="Payment Method" value={payment.method || "Not specified"} />
                            <DetailRow icon={Calendar} label="Created At" value={formatDateTime(payment.createdAt)} />
                            <DetailRow icon={Calendar} label="Updated At" value={formatDateTime(payment.updatedAt)} />
                        </div>

                        {/* Razorpay Details */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Transaction IDs</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            {payment.razorpayPaymentId && (
                                <DetailRow icon={Hash} label="Payment ID" value={payment.razorpayPaymentId} mono />
                            )}
                            {payment.razorpayOrderId && (
                                <DetailRow icon={Hash} label="Order ID" value={payment.razorpayOrderId} mono />
                            )}
                            {payment.razorpaySubscriptionId && (
                                <DetailRow icon={Hash} label="Subscription ID" value={payment.razorpaySubscriptionId} mono />
                            )}
                            {payment.receipt && (
                                <DetailRow icon={FileText} label="Receipt Number" value={payment.receipt} mono />
                            )}
                        </div>

                        {/* Additional Details */}
                        {(payment.notes || payment.subscription) && (
                            <>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Additional Information</p>
                                <div className="bg-gray-50 rounded-xl px-4 mb-4">
                                    {payment.notes && (
                                        <DetailRow icon={FileText} label="Notes" value={payment.notes} />
                                    )}
                                    {payment.subscription && (
                                        <>
                                            <DetailRow
                                                icon={Hash}
                                                label="Subscription ID"
                                                value={payment.subscription._id}
                                                mono
                                            />
                                            {payment.subscription.plan && (
                                                <>
                                                    <DetailRow
                                                        icon={Hash}
                                                        label="Plan Name"
                                                        value={payment.subscription.plan.name}
                                                    />
                                                    <DetailRow
                                                        icon={Hash}
                                                        label="Plan Price"
                                                        value={`₹${payment.subscription.plan.price} / ${payment.subscription.plan.billingPeriod}`}
                                                    />
                                                </>
                                            )}
                                            <DetailRow
                                                icon={Hash}
                                                label="Subscription Status"
                                                value={payment.subscription.status.charAt(0).toUpperCase() + payment.subscription.status.slice(1)}
                                            />
                                            {payment.subscription.startDate && (
                                                <DetailRow
                                                    icon={Hash}
                                                    label="Start Date"
                                                    value={new Date(payment.subscription.startDate).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                />
                                            )}
                                            {payment.subscription.endDate && (
                                                <DetailRow
                                                    icon={Hash}
                                                    label="End Date"
                                                    value={new Date(payment.subscription.endDate).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        {/* User Info */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">User Information</p>
                        <div className="bg-gray-50 rounded-xl px-4 mb-4">
                            <DetailRow icon={User} label="User ID" value={payment.user} mono />
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0">

                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    const handleDownloadPDF = async (payment) => {
        const blob = await pdf(<PaymentPDF payment={payment} />).toBlob();

        const url = URL.createObjectURL(blob);
        const fileName = `invoice-${payment._id}.pdf`;

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    };

    // ─── Main Render ─────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto">

            {/* Detail Modal */}
            {selectedPayment && (
                <PaymentDetailModal
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                />
            )}

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-600 text-sm">View and manage all your transactions</p>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Loading your payment history...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-12 text-center">
                        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No payments found</h3>
                        <p className="text-gray-500">
                            No payment transactions yet
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {formatDate(payment.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getTypeColor(payment.type)}`}>
                                                    {payment.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-purple-600">
                                                {formatAmount(payment.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-600 max-w-[200px] truncate">
                                                {payment?.razorpayPaymentId ||
                                                    payment?.razorpayOrderId ||
                                                    payment?.razorpaySubscriptionId ||
                                                    "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                                                {payment.method || "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusClasses(payment.status)}`}>
                                                    {getStatusIcon(payment.status)}
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex gap-3">
                                                <button
                                                    onClick={() => handleDownloadPDF(payment)}
                                                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                    title="Download Invoice"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-gray-200">
                            {payments.map((payment) => (
                                <div key={payment._id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getTypeColor(payment.type)}`}>
                                                    {payment.type}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusClasses(payment.status)}`}>
                                                    {getStatusIcon(payment.status)}
                                                    {payment.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(payment.createdAt)}</p>
                                        </div>
                                        <p className="text-lg font-bold text-purple-600">{formatAmount(payment.amount)}</p>
                                    </div>

                                    <div className="space-y-1.5 mb-3">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Hash className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-gray-500">ID:</span>
                                            <span className="font-mono text-gray-700 truncate">
                                                {payment?.razorpayPaymentId ||
                                                    payment?.razorpayOrderId ||
                                                    payment?.razorpaySubscriptionId ||
                                                    "-"}
                                            </span>
                                        </div>
                                        {payment.method && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-gray-500">Method:</span>
                                                <span className="text-gray-700 capitalize">{payment.method}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className='grid grid-cols-2 gap-1'>
                                        <button
                                            onClick={() => handleDownloadPDF(payment)}
                                            className="w-full px-3 py-2 text-sm font-semibold text-(--primary) bg-blue-50 border border-(--primary)/20 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            Download Invoice
                                        </button>
                                        <button
                                            onClick={() => setSelectedPayment(payment)}
                                            className="w-full px-3 py-2 text-sm font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                                        >
                                            View Details
                                        </button>

                                    </div>



                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}