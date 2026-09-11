import { useRef, useState, useEffect } from "react";
import { Menu, ChevronDown, LogOut, User, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ChangePasswordModal from "../../common/ChangePasswordModal";

export const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const dropRef = useRef(null);


    const name = user?.name?.name || "User";
    const email = user?.email || "";
    const initial = name.charAt(0).toUpperCase();

    // close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
    };

    return (
        <header className="sticky top-0 z-30 h-[60px] bg-white border-b border-slate-200 flex items-center px-5 gap-3">
            <button
                onClick={onMenuClick}
                className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors duration-150"
                aria-label="Toggle menu"
            >
                <Menu size={20} />
            </button>

            <div className="flex-1" />

            {/* Avatar dropdown */}
            <div className="relative" ref={dropRef}>
                <button
                    onClick={() => setOpen(v => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-150"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initial}
                    </div>
                    <span className="hidden sm:inline text-[13px] font-medium text-slate-700">{name}</span>
                    <ChevronDown
                        size={12}
                        className={`text-slate-400 hidden sm:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Dropdown */}
                {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-100/80 overflow-hidden z-50"
                        style={{ animation: 'dropIn 0.15s cubic-bezier(0.22,1,0.36,1)' }}>
                        <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:none; } }`}</style>

                        {/* User info */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {initial}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-slate-800 truncate">{name}</p>
                                {email && <p className="text-[11px] text-slate-400 truncate">{email}</p>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-1.5">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    setShowPasswordModal(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 transition-colors text-left"
                            >
                                <KeyRound size={14} className="text-slate-400" />
                                Change Password
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-500 hover:bg-red-50 transition-colors text-left"
                            >
                                <LogOut size={14} />
                                Log out
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <ChangePasswordModal
                open={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </header>
    );
};