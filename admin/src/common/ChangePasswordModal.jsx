import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import EyeIcon from "./EyeButton";

const ChangePasswordModal = ({ open, onClose }) => {
    const { changePassword } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);

    // reset fields whenever the modal is (re)opened
    useEffect(() => {
        if (open) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowCurrent(false);
            setShowNew(false);
        }
    }, [open]);

    // lock background scroll while modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            return () => { document.body.style.overflow = ""; };
        }
    }, [open]);

    // close on Escape
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Fill in all fields");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword === currentPassword) {
            toast.error("New password must be different from current password");
            return;
        }

        setLoading(true);
        const r = await changePassword({ currentPassword, newPassword });

        if (r.success) {
            toast.success(r.message || "Password updated successfully");
            onClose();
        } else {
            toast.error(r.message || "Failed to update password");
        }
        setLoading(false);
    };

    const modal = (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ animation: "fadeIn 0.15s ease-out" }}
        >
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* panel */}
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6"
                style={{ animation: "popIn 0.18s cubic-bezier(0.22,1,0.36,1)" }}
            >
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes popIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: none; } }
                `}</style>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <h2 className="text-[16px] font-semibold text-slate-800 mb-1">Update password</h2>
                <p className="text-[13px] text-slate-400 mb-5">
                    Enter your current password and choose a new one
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-[12px] font-medium text-slate-600 mb-1">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-200 text-[13px] text-slate-800 outline-none focus:border-blue-400 transition-colors"
                            />
                            <span
                                onClick={() => setShowCurrent((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                            >
                                <EyeIcon open={showCurrent} />
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-medium text-slate-600 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-200 text-[13px] text-slate-800 outline-none focus:border-blue-400 transition-colors"
                            />
                            <span
                                onClick={() => setShowNew((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                            >
                                <EyeIcon open={showNew} />
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-medium text-slate-600 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type={showNew ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 outline-none focus:border-blue-400 transition-colors"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Updating…" : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};

export default ChangePasswordModal;