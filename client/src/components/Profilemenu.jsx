import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    UserCircle,
    LogOut,
    User,
    Heart,
    Settings,
    ChevronDown
} from 'lucide-react';

export default function ProfileMenu({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setIsOpen(false);
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatPhone = (phone) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
        }
        return phone;
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 lg:px-1 lg:py-1 rounded-full lg:bg-white lg:border border-gray-200 hover:bg-gray-50 transition-all duration-150 "
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-(--primary) flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                    {user?.profile ? (
                        <img
                            src={user.profile}
                            alt={user?.name || "Profile"}
                            className="w-full h-full object-cover bg-white"
                        />
                    ) : (
                        getInitials(user?.name)
                    )}
                </div>

                {/* Name (hidden on mobile) */}
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user?.name || 'User'}
                </span>

                {/* Chevron */}
                <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 max-lg:hidden ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 mt-2 w-50 sm:w-72 z-[100] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-200 origin-top-right
                    ${isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}
            >
                {/* User Info Section */}
                <div className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                        <div className="size-10 rounded-full bg-(--primary) flex items-center justify-center text-white text-lg font-bold shadow-md">
                            {getInitials(user?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {user?.name || 'User'}
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {formatPhone(user?.phone)}
                            </p>
                            {user?.email && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {user.email}
                                </p>
                            )}
                            {user?.membershipType && (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    {user.membershipType}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                    <Link
                        to="/dashboard/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-2 sm:px-4 py-1.5 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-medium">My Profile</div>
                            <div className="text-xs text-gray-500 max-sm:hidden">View and edit details</div>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/donations"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-2 sm:px-4 py-1.5 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center">
                            <Heart className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                            <div className="font-medium">My Donations</div>
                            <div className="text-xs text-gray-500 max-sm:hidden">View donation history</div>
                        </div>
                    </Link>


                </div>

                {/* Logout Button */}
                <div className="border-t border-gray-100 p-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-2 sm:px-4 py-1.5 sm:py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                            <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="text-left">
                            <div className="font-medium">Sign Out</div>
                            <div className="text-xs text-red-500 max-sm:hidden">Logout from your account</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}