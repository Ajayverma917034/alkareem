import { useState, useRef, useCallback } from "react";
import { Heart, CreditCard, Building2, Upload, X, FileText, Image, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "../api/axiosInstance";
import { Input, Select, Textarea } from "../components/FormFields";

function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

const INITIAL_FORM = {
    fullName: "",
    email: "",
    phone: "",
    amount: "",
    purpose: "",
    message: "",
    mode: "online",
};

function SuccessScreen({ donorName, onReset }) {
    return (
        <div className="min-h-screen bg-slate-100 px-4 py-14 flex items-center justify-center">
            <div className="max-w-lg w-full text-center">
                {/* Animated checkmark */}
                <div className="relative w-28 h-28 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
                    <div className="relative w-28 h-28 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center">
                        <CheckCircle2 className="w-14 h-14 text-green-500" strokeWidth={1.5} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Thank You{donorName ? `, ${donorName.split(" ")[0]}` : ""}! 🎉
                </h2>

                <p className="text-gray-500 text-lg mb-2">
                    Your donation has been received successfully.
                </p>

                <p className="text-gray-400 text-sm mb-10">
                    100% of your support goes toward creating meaningful impact.
                    We'll send a confirmation to your email shortly.
                </p>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-base">
                        <Heart className="w-5 h-5 fill-green-100 text-green-500" />
                        Thank you for your generous donation
                    </div>
                </div>

                <button
                    onClick={onReset}
                    className="px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity"
                >
                    Make Another Donation
                </button>
            </div>
        </div>
    );
}

function FileDropZone({ files, onFilesChange }) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const addFiles = useCallback((incoming) => {
        const arr = Array.from(incoming);
        const valid = arr.filter((f) => {
            const ok =
                f.type.startsWith("image/") ||
                f.type === "application/pdf" ||
                f.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            if (!ok) toast.error(`${f.name}: unsupported file type`);
            return ok;
        });
        onFilesChange((prev) => [...prev, ...valid]);
    }, [onFilesChange]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const removeFile = (idx) =>
        onFilesChange((prev) => prev.filter((_, i) => i !== idx));

    const getIcon = (file) => {
        if (file.type.startsWith("image/"))
            return <Image size={16} className="text-blue-400" />;
        return <FileText size={16} className="text-slate-400" />;
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Screenshot / Document{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-8 px-6 text-center
                    ${isDragging
                        ? "border-blue-400 bg-blue-50 scale-[1.01]"
                        : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.docx"
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                />

                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragging ? "bg-blue-100" : "bg-white border border-gray-200"
                        }`}
                >
                    <Upload
                        size={22}
                        className={isDragging ? "text-blue-500" : "text-gray-400"}
                    />
                </div>

                <p className="text-sm font-medium text-gray-600">
                    {isDragging ? (
                        <span className="text-blue-600">Drop files here</span>
                    ) : (
                        <>
                            Drag & drop files, or{" "}
                            <span className="text-blue-600 underline underline-offset-2">
                                browse
                            </span>
                        </>
                    )}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, PDF, DOCX — max 10 MB each
                </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                    {files.map((file, idx) => (
                        <li
                            key={idx}
                            className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm"
                        >
                            {/* Preview thumbnail for images */}
                            {file.type.startsWith("image/") ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-8 h-8 rounded-md object-cover border border-gray-200 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    {getIcon(file)}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formatSize(file.size)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(idx);
                                }}
                                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors group"
                            >
                                <X
                                    size={13}
                                    className="text-gray-400 group-hover:text-red-500"
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Donate() {
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [donorName, setDonorName] = useState("");
    const [attachments, setAttachments] = useState([]);

    const [form, setForm] = useState(INITIAL_FORM);

    const quickAmounts = [100, 500, 1000, 2500];

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleDonate = async () => {
        try {
            if (!form.fullName || !form.email || !form.amount) {
                toast.error("Please fill required fields");
                return;
            }

            setLoading(true);

            /* Build multipart payload */
            const payload = new FormData();
            Object.entries(form).forEach(([k, v]) => payload.append(k, v));
            attachments.forEach((file) => payload.append("documents", file));

            const { data } = await api.post("/donation/create", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            /* OFFLINE */
            if (form.mode === "offline") {
                setDonorName(form.fullName);
                setShowSuccess(true);
                return;
            }

            /* ONLINE */
            const loaded = await loadRazorpay();
            if (!loaded) {
                toast.error("Payment gateway failed to load");
                return;
            }

            const rzp = new window.Razorpay({
                key: data.key,
                amount: data.amount,
                currency: "INR",
                order_id: data.orderId,
                name: "Support Our Cause",
                description: "Donation",
                prefill: {
                    name: form.fullName,
                    email: form.email,
                    contact: form.phone,
                },
                theme: { color: "#2563eb" },
                handler: async function (response) {
                    const verify = await api.post("/donation/verify", {
                        donationId: data.donationId,
                        paymentId: data.paymentId,
                        ...response,
                    });

                    if (verify.data.success) {
                        setDonorName(form.fullName);
                        setShowSuccess(true);
                    } else {
                        toast.error("Verification failed");
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
            });

            rzp.on("payment.failed", () => {
                toast.error("Payment failed");
                setLoading(false);
            });

            rzp.open();
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(INITIAL_FORM);
        setAttachments([]);
        setDonorName("");
        setShowSuccess(false);
    };

    /* ── Success Screen ── */
    if (showSuccess) {
        return <SuccessScreen donorName={donorName} onReset={handleReset} />;
    }

    /* ── Donation Form ── */
    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10 sm:py-14">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="size-10 sm:size-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                        <Heart className="text-red-500 w-8 h-8" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Support Our Cause
                    </h1>
                    <p className="text-gray-500 mt-1 sm:mt-3">
                        Every contribution helps us create real impact.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 py-8 md:p-10">

                    {/* Mode toggle */}
                    <div className="flex justify-center mb-6 sm:mb-8">
                        <div className="bg-gray-100 rounded-xl p-1 flex">
                            <button
                                onClick={() => updateField("mode", "online")}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${form.mode === "online"
                                    ? "bg-white text-blue-600 shadow"
                                    : "text-gray-500"
                                    }`}
                            >
                                <CreditCard size={16} />
                                Online
                            </button>
                            <button
                                onClick={() => updateField("mode", "offline")}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${form.mode === "offline"
                                    ? "bg-white text-blue-600 shadow"
                                    : "text-gray-500"
                                    }`}
                            >
                                <Building2 size={16} />
                                Offline
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <Input
                            label="Full Name"
                            required
                            value={form.fullName}
                            onChange={(e) => updateField("fullName", e.target.value)}
                            placeholder="Enter full name"
                        />
                        <Input
                            label="Email"
                            required
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="Enter email"
                        />
                    </div>

                    <div className="mt-5">
                        <Input
                            label="Donation Amount"
                            required
                            type="number"
                            value={form.amount}
                            onChange={(e) => updateField("amount", e.target.value)}
                            placeholder="Enter amount ₹"
                        />
                    </div>

                    {/* Quick amounts */}
                    <div className="flex gap-3 flex-wrap mt-4">
                        {quickAmounts.map((item) => (
                            <button
                                key={item}
                                onClick={() => updateField("amount", item)}
                                className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 text-sm font-medium"
                            >
                                ₹{item}
                            </button>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 mt-5">
                        <Select
                            label="Purpose"
                            value={form.purpose}
                            onChange={(e) => updateField("purpose", e.target.value)}
                        >
                            <option value="">Select purpose</option>
                            <option value="Education">Education</option>
                            <option value="Food">Food Support</option>
                            <option value="Medical">Medical Help</option>
                            <option value="General">General Fund</option>
                        </Select>

                        <Input
                            label="Phone"
                            value={form.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            placeholder="Optional"
                        />
                    </div>

                    <div className="mt-5">
                        <Textarea
                            label="Message"
                            rows={4}
                            value={form.message}
                            onChange={(e) => updateField("message", e.target.value)}
                            placeholder="Write a message..."
                        />
                    </div>

                    {/* File upload — offline only */}
                    {form.mode === "offline" && (
                        <FileDropZone
                            files={attachments}
                            onFilesChange={setAttachments}
                        />
                    )}

                    {/* Security badge */}
                    <div className="mt-6 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl py-3 text-center">
                        {form.mode === "online"
                            ? "🔒 Secure payment gateway with Razorpay"
                            : "🏦 Our team will contact you for offline donation"}
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleDonate}
                        disabled={loading}
                        className="mt-6 w-full py-3 sm:py-4 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-60"
                    >
                        {loading
                            ? "Processing..."
                            : form.mode === "online"
                                ? "Proceed to Pay"
                                : "Submit Donation"}
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    100% of your support goes toward meaningful impact.
                </p>
            </div>
        </div>
    );
}