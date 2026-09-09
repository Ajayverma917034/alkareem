import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ ADDED

import {
    LayoutDashboard, FileText, Lock, Layout, Box, Zap, Star,
    BarChart2, FileInput, Table2, Map, Layers, ChevronDown,
    ChevronRight, ChevronLeft,
    Option,
    BadgeDollarSign,
    ShieldCheck,
    UserCheck,
    HandCoins,
    Users,
    CreditCard,
    Mail,
} from "lucide-react";

const NAV_GROUPS = [
    {
        group: "Main",
        items: [
            {
                icon: LayoutDashboard,
                label: "Dashboard",
                path: "/dashboard",
                active: true,
            },
            {
                icon: BadgeDollarSign,
                label: "Plan",
                path: "/plan",
                active: true,
            },
            {
                icon: ShieldCheck,
                label: "Volunteer",
                path: "/volunteer",
                active: true,
            },
            {
                icon: UserCheck,
                label: "Dignitaries", // ✅ fixed spelling
                path: "/digniataries",
                active: true,
            },
            {
                icon: HandCoins,
                label: "Donations",
                path: "/dontations",
                active: true,
            },
            {
                icon: CreditCard, // ✅ better icon
                label: "Subscriptions",
                path: "/subscriptions",
                active: true,
            },
            {
                icon: Users,
                label: "Users",
                path: "/users",
                active: true,
            },
            {
                icon: Mail, // ✅ FIXED ICON
                label: "Queries", // ✅ FIXED LABEL
                path: "/contacts",
                active: true,
            },
        ]
    }
];

export const Sidebar = ({ collapsed, onToggle, mobileOpen, onClose }) => {
    const [openDropdowns, setOpenDropdowns] = useState({});

    const navigate = useNavigate(); // ✅ ADDED
    const location = useLocation(); // ✅ ADDED

    const toggleDropdown = (label) => {
        if (collapsed) return;
        setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <>
            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={[
                    "fixed top-0 left-0 h-full z-50 flex flex-col  overflow-x-hidden no-scrollbar",
                    "bg-[#1a2535] transition-all duration-300 ease-in-out",
                    collapsed ? "w-16" : "w-56",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                ].join(" ")}
            >
                {/* Logo */}
                <div className={`flex items-center gap-3 border-b border-white/10 flex-shrink-0 py-[18px] ${collapsed ? "justify-center px-0" : "px-5"}`}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                        AL
                    </div>
                    {!collapsed && (
                        <span className="text-white font-bold text-base tracking-tight">AL Kareemtarbiyat</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-3 overflow-y-auto no-scrollbar">
                    {NAV_GROUPS.map((group) => (
                        <div key={group.group}>
                            {!collapsed && (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-5 pt-3 pb-1">
                                    {group.group}
                                </p>
                            )}

                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path; // ✅ ADDED

                                return (
                                    <div key={item.label}>
                                        <button
                                            onClick={() => {
                                                if (item.children) {
                                                    toggleDropdown(item.label);
                                                } else if (item.path) {
                                                    navigate(item.path); // ✅ ADDED
                                                }
                                            }}
                                            title={collapsed ? item.label : undefined}
                                            className={[
                                                "w-full flex items-center gap-2.5 border-l-[3px] transition-all duration-150 text-sm relative",
                                                collapsed ? "justify-center px-0 py-2.5" : "px-5 py-2.5",
                                                isActive // ✅ UPDATED (instead of item.active)
                                                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                                                    : "border-transparent text-slate-400 hover:bg-[#253447] hover:text-slate-200",
                                            ].join(" ")}
                                        >
                                            <item.icon size={16} className="flex-shrink-0" />

                                            {!collapsed && (
                                                <>
                                                    <span className={`flex-1 text-left text-[13.5px] ${isActive ? "font-semibold" : "font-normal"}`}>
                                                        {item.label}
                                                    </span>

                                                    {item.badge && (
                                                        <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 text-white ${item.badge === "New" ? "bg-amber-500" : "bg-emerald-400"}`}>
                                                            {item.badge}
                                                        </span>
                                                    )}

                                                    {item.children && (
                                                        openDropdowns[item.label]
                                                            ? <ChevronDown size={13} />
                                                            : <ChevronRight size={13} />
                                                    )}
                                                </>
                                            )}

                                            {collapsed && item.badge && (
                                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            )}
                                        </button>

                                        {/* CHILDREN */}
                                        {item.children && openDropdowns[item.label] && !collapsed && (
                                            <div className="bg-black/15">
                                                {item.children.map((child) => {
                                                    const label = typeof child === "string" ? child : child.label;
                                                    const path = typeof child === "string" ? null : child.path;

                                                    const isActive = location.pathname === path;

                                                    return (
                                                        <button
                                                            key={label}
                                                            onClick={() => path && navigate(path)} // ✅ ADDED
                                                            className={`w-full flex items-center gap-2.5 px-5 pl-[42px] py-1.5 text-[13px] transition-colors duration-150
                                                                ${isActive ? "text-white bg-[#253447]" : "text-slate-500 hover:text-slate-200"}
                                                            `}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};