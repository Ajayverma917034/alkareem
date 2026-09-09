import { Home, Info, Users, UserCircle, LogIn, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileMenu from './Profilemenu';

const navLinks = [
    {
        id: 1,
        name: 'Home',
        path: '/',
        icon: Home,
        hasDropdown: false
    },
    {
        id: 2,
        name: 'About',
        path: '/about',
        icon: Info,
        hasDropdown: false
    },
    {
        id: 3,
        name: 'People',
        path: '/people',
        icon: Users,
        hasDropdown: true,
        dropdownItems: [
            { id: 1, name: 'Authors', path: '/people/authors' },
            { id: 2, name: 'Founder', path: '/people/founder' },
        ]
    },
    {
        id: 4,
        name: 'Membership',
        path: '/membership',
        icon: UserCircle,
        hasDropdown: true,
        dropdownItems: [
            { id: 1, name: 'Volunteer Membership', path: '/membership/volunteers' },
            { id: 2, name: 'Paid Membership', path: '/membership/paid' },
            { id: 3, name: 'Masjid Dignitaries', path: '/membership/dignitary-form' }
        ]
    },
    {
        id: 5,
        name: 'Donation Report',
        path: '/donation-report',
        icon: null,
        hasDropdown: false
    }
];

const socialLinks = [
    { id: 1, name: 'Facebook', url: '#', bgColor: 'bg-blue-600 hover:bg-blue-700' },
    { id: 2, name: 'Instagram', url: '#', bgColor: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90' },
    { id: 3, name: 'Twitter', url: '#', bgColor: 'bg-sky-500 hover:bg-sky-600' },
    { id: 4, name: 'LinkedIn', url: '#', bgColor: 'bg-blue-700 hover:bg-blue-800' }
];

// Returns true if the current URL matches this nav item (including child routes)
function isLinkActive(link, pathname) {
    if (link.path === '/') return pathname === '/';
    return pathname === link.path || pathname.startsWith(link.path + '/');
}

function NavItem({ link, activePath }) {
    const [hovered, setHovered] = useState(false);
    const timeoutRef = useRef(null);
    const IconComponent = link.icon;
    const isActive = isLinkActive(link, activePath);

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setHovered(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setHovered(false), 120);
    };

    useEffect(() => () => clearTimeout(timeoutRef.current), []);

    if (!link.hasDropdown) {
        return (
            <Link
                to={link.path}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 whitespace-nowrap
                    ${isActive
                        ? 'bg-(--primary) text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
            >
                {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                {link.name}
            </Link>
        );
    }

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 whitespace-nowrap
                    ${isActive
                        ? 'bg-(--primary) text-white shadow-sm'
                        : hovered
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
            >
                {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                {link.name}
                <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${hovered ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown */}
            <div
                className={`absolute top-full left-1/2 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 transition-all duration-200
                    ${hovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'}`}
                style={{ transform: `translateX(-50%) translateY(${hovered ? '0' : '-4px'})` }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {link.dropdownItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center px-4 py-2.5 text-sm transition-colors mx-1 rounded-xl
                            ${activePath === item.path
                                ? 'bg-blue-50 text-(--primary) font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setMobileDropdown(null);
    };
    // ✅ Dynamic active path from React Router
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    return (
        <nav className="w-full sticky top-0 z-[110]">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex sm:flex-row items-center justify-between py-2 text-sm gap-2 w-full">
                        {/* Contact Info */}
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-gray-100">
                            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-white transition-colors">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-xs sm:text-sm max-md:hidden">+91 9876543210</span>
                            </a>
                            <a href="mailto:info@alkareemtrust.org" className="flex items-center gap-2 hover:text-white transition-colors">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="r
                                    ound" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs sm:text-sm max-md:hidden">info@alkareemtrust.org</span>
                            </a>
                        </div>

                        {/* Location & Social */}
                        <div className="flex items-center gap-4 sm:gap-6 ">
                            <div className="flex items-center gap-2 text-gray-100 max-md:hidden">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs sm:text-sm max-md:hidden">Bhopal, India</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.id}
                                        href={social.url}
                                        className={`w-7 h-7 flex items-center justify-center ${social.bgColor} text-white rounded-full transition-all`}
                                        aria-label={social.name}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            {social.name === 'Facebook' && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />}
                                            {social.name === 'Instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />}
                                            {social.name === 'Twitter' && <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />}
                                            {social.name === 'LinkedIn' && <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />}
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation — Pill Bar */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-1 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3">

                        {/* Logo */}
                        <Link to={'/'} className="flex-shrink-0 flex items-center h-10">
                            <img
                                src="/logo.png"
                                alt="Al Kareem Tarbiyat Logo"
                                className="h-13 w-auto object-contain"
                            />
                        </Link>

                        {/* Desktop — Pill Navbar */}
                        <div className="hidden lg:flex items-center">
                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-1.5 shadow-sm">
                                {navLinks.map((link) => (
                                    <NavItem key={link.id} link={link} activePath={pathname} />
                                ))}

                                <div className="w-px h-5 bg-gray-200 mx-1" />
                                {
                                    user ? <ProfileMenu user={user} logout={logout} /> :
                                        <Link
                                            to="/login"
                                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 whitespace-nowrap
                                        ${pathname === '/login'
                                                    ? 'bg-(--primary) text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                        >
                                            <LogIn className="w-3.5 h-3.5" />
                                            Login
                                        </Link>
                                }

                                <div className="w-px h-5 bg-gray-200 mx-1" />

                                <Link to={'/donate'} className="px-4 py-2 bg-(--primary) text-white text-sm font-semibold rounded-full transition-all duration-150 hover:shadow-blue-200 hover:shadow-md whitespace-nowrap">
                                    Donate
                                </Link>
                                <Link to={'/membership/volunteer-form'} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-full transition-all duration-150 shadow-sm hover:shadow-teal-200 hover:shadow-md whitespace-nowrap ml-1">
                                    Join Us
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Controls */}
                        <div className="lg:hidden flex items-center gap-2">
                            {user && <ProfileMenu user={user} logout={logout} />}
                            <Link to={'/donate'} className="px-4 py-2 bg-(--primary) text-white text-sm font-semibold rounded-full transition-all">
                                Donate
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`lg:hidden bg-white border-b border-gray-200 overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-4 py-3 space-y-1">
                    {navLinks.map((link) => {
                        const IconComponent = link.icon;
                        const isActive = isLinkActive(link, pathname);
                        const isOpen = mobileDropdown === link.id;

                        return (
                            <div key={link.id}>
                                {link.hasDropdown ? (
                                    <div>
                                        <button
                                            onClick={() => setMobileDropdown(isOpen ? null : link.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-2xl transition-all
                                                ${isActive ? 'bg-blue-50 text-(--primary)' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {IconComponent && <IconComponent className="w-4 h-4" />}
                                                <span>{link.name}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="mt-1 ml-8 space-y-0.5 pb-1">
                                                {link.dropdownItems.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        to={item.path}
                                                        onClick={() => closeMobileMenu()}
                                                        className={`block px-4 py-2.5 text-sm rounded-xl transition-colors
                                                            ${pathname === item.path
                                                                ? 'bg-blue-50 text-(--primary) font-medium'
                                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        to={link.path}
                                        onClick={() => closeMobileMenu()}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all
                                            ${isActive ? 'bg-blue-50 text-(--primary)' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {IconComponent && <IconComponent className="w-4 h-4" />}
                                        <span>{link.name}</span>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                    {
                        !user &&
                        <Link
                            to="/login"
                            onClick={() => closeMobileMenu()}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all
                            ${pathname === '/login' ? 'bg-blue-50 text-(--primary)' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login</span>
                        </Link>
                    }

                    <div className="pt-3 pb-2 flex gap-2">
                        <Link to={'/donate'} onClick={() => closeMobileMenu()} className="flex-1 px-5 py-3 bg-(--primary) text-white text-sm font-semibold rounded-full transition-all text-center">
                            Donate
                        </Link>
                        <Link to={'/membership/volunteer-form'} onClick={() => closeMobileMenu()} className="flex-1 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-full transition-all text-center">
                            Join Us
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}