// DashboardLayout.jsx
import { useState, useEffect } from "react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Navbar } from "../components/dashboard/Navbar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if screen is mobile
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
            // Auto-close mobile menu on resize to desktop
            if (window.innerWidth >= 1024) {
                setMobileOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Single handler: mobile → toggle drawer, desktop → toggle collapse
    const handleMenuClick = () => {
        if (window.innerWidth >= 1024) {
            setCollapsed((c) => !c);
        } else {
            setMobileOpen((o) => !o);
        }
    };

    // Calculate sidebar width based on state
    const sidebarW = () => {
        if (isMobile) return 0;
        return collapsed ? 64 : 224;
    };

    return (
        <div className="flex min-h-screen bg-slate-100">
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((c) => !c)}
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
                isMobile={isMobile}
            />

            <div
                className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out"
                style={{
                    marginLeft: `${sidebarW()}px`,
                    width: `calc(100% - ${sidebarW()}px)`
                }}
            >
                <Navbar onMenuClick={handleMenuClick} isMobile={isMobile} />
                <main className="flex-1 overflow-x-auto px-4 py-3">
                    <div className="container mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;