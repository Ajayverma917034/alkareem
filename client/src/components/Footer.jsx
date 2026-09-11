import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Our Work', to: '/' },
    { label: 'Contact', to: '/contact' },
    { label: 'Donate', to: '/donate' },
];

const services = [
    'Education Support',
    'Food Donation',
    'Healthcare',
    'Women Empowerment',
    'Social work',
];

const contactInfo = [
    { icon: Mail, label: 'Email', text: 'support@edutrust.org', href: 'mailto:support@edutrust.org' },
    { icon: Phone, label: 'Phone', text: '+91 9876543210', href: 'tel:+919876543210' },
    { icon: MapPin, label: 'Location', text: 'India', href: null },
];

// ── Social SVG icons (brand-accurate colours) ─────────────────────────────────
const socials = [
    {
        label: 'Facebook',
        href: '#',
        bg: '#1877F2',
        svg: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
        ),
    },
    {
        label: 'Instagram',
        href: '#',
        gradient: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
        svg: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="white" stroke="none" />
            </svg>
        ),
    },
    {
        label: 'Twitter',
        href: '#',
        bg: '#1DA1F2',
        svg: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
        ),
    },
    {
        label: 'LinkedIn',
        href: '#',
        bg: '#0A66C2',
        svg: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
            </svg>
        ),
    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer() {
    return (
        <footer style={{ backgroundColor: '#111111' }} className="w-full text-gray-300">

            {/* ── Main 4-col grid ── */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                {/* ── Col 1 : Brand ── */}
                <div className="flex flex-col gap-4 max-sm:col-span-2">
                    {/* Logo + name */}
                    <div className="flex items-start gap-3">
                        <div className="w-auto h-[80px] bg-white flex-shrink-0 px-2 overflow-hidden flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt="Al Kareem Ebiyat"
                                className="w-full h-full object-cover"
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                        </div>

                    </div>

                    {/* Tagline */}
                    <p className="text-[13px] text-gray-300 leading-relaxed">
                        We are a non-profit organization working to improve
                        education, healthcare, and social equality across communities.
                    </p>

                    {/* Social icon row */}
                    <div className="flex items-center gap-3 mt-1">
                        {socials.map(({ label, href, bg, gradient, svg }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    background: gradient || bg,
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >
                                {svg}
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── Col 2 : Quick Links ── */}
                <div>
                    <h3 className="text-white font-bold text-[15px] sm:text-lg mb-3">Quick Links</h3>
                    <ul className="space-y-2">
                        {quickLinks.map(({ label, to }) => (
                            <li key={label}>
                                <Link
                                    to={to}
                                    className="text-[13px] sm:text-sm text-gray-300 font-medium hover:text-white transition-colors duration-150"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── Col 3 : Our Services ── */}
                <div>
                    <h3 className="text-white font-bold text-[15px] sm:text-lg mb-3">Our Services</h3>
                    <ul className="space-y-2.5">
                        {services.map(service => (
                            <li key={service} className="text-[13px] sm:text-sm text-gray-300 font-medium hover:text-white transition-colors duration-150">
                                {service}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── Col 4 : Contact Us ── */}
                <div className=' max-sm:col-span-2'>
                    <h3 className="text-white font-bold text-[15px] sm:text-lg mb-3">Contact Us</h3>
                    <ul className="space-y-3">
                        {contactInfo.map(({ icon: Icon, label, text, href }) => (
                            <li key={label} className="flex items-center gap-2 text-[13px] text-gray-300">
                                <Icon size={14} className="mt-0.5 flex-shrink-0 text-gray-300" />
                                <span>
                                    <span className="text-gray-300 font-medium">{label}: </span>
                                    {href ? (
                                        <a href={href} className="text-[13px] sm:text-[15px] text-gray-300 font-medium hover:text-white transition-colors duration-150 hover:text-white">
                                            {text}
                                        </a>
                                    ) : (
                                        <span>{text}</span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>

            {/* ── Bottom bar ── */}
            <div style={{ borderTop: '1px solid #222222' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center">
                    <p className="text-[13px] text-gray-500 text-center">
                        Powered by@{' '}
                        <a
                            href="https://www.yashvitech.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-500 hover:text-red-400 font-medium transition-colors duration-150"
                        >
                            Yashvitech IT solution
                        </a>
                    </p>
                </div>
            </div>

        </footer>
    );
}