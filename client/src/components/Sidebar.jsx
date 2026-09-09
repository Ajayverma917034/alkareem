import React, { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Gift, Users, Award, User, LogOut, Loader2, ChevronsRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Sidebar = () => {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            setCheckingAuth(false);
        }, 700); // loader delay

        return () => clearTimeout(timer);
    }, []);




    // Loading State
    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    // If not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    const menuItems = [
        { path: '/dashboard/donations', label: 'My Donations', icon: Gift },
        { path: '/dashboard/volunteers', label: 'Volunteers', icon: Users },
        { path: '/dashboard/dignitaries', label: 'Dignitaries', icon: Award },
        { path: '/dashboard/profile', label: 'Profile', icon: User },
        { path: '/dashboard/my-subscriptions', label: 'My Subscriptions', icon: User },
        { path: '/dashboard/my-payments', label: 'My Payments', icon: User },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-[calc(100vh-125px)] bg-gray-50">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-30 left-4 z-50 p-2 rounded-lg bg-white shadow hover:bg-gray-100 transition-colors"
            >
                {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-gray-700" />
                ) : (
                    <ChevronsRight className="w-6 h-6 text-gray-700" />
                )}
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Navigation Menu */}
                    <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg
                    transition-all duration-200
                    ${active
                                            ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto lg:ml-0">
                <div className="p-4 lg:p-8 pt-16 lg:pt-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Sidebar;