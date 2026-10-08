// ContentResearchTeam.jsx  →  src/components/home/ContentResearchTeam.jsx

import React, { useState } from 'react';
import { ArrowRight, Mail, BookOpen, Newspaper, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal, StaggerGroup, StaggerItem } from '../components/motion/Reveal';

// ─── SVG Social Icons ──────────────────────────────────────────────────────────
const FacebookIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const InstagramIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const LinkedInIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const TwitterIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const YoutubeIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
);

// ─── Data ──────────────────────────────────────────────────────────────────────
const TEAM = [
    {
        id: 1,
        name: 'Mohammad Arif',
        role: 'Senior Content Writer',
        img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=85&fit=crop&crop=faces',
        bio: 'Creates impactful articles focused on education, social awareness, and community upliftment under Al-Kareem Trust initiatives.',
        short: 'Education & social-awareness writing',
        social: {
            facebook: '#',
            instagram: '#',
            linkedin: '#',
            twitter: '#',
        },
    },
    {
        id: 2,
        name: 'Sana Parveen',
        role: 'Social Research Analyst',
        img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=85&fit=crop&crop=faces',
        bio: 'Conducts field research and prepares reports on poverty, education, and healthcare to support NGO programs.',
        short: 'Field research on poverty & healthcare',
        social: {
            facebook: '#',
            instagram: '#',
            linkedin: '#',
            youtube: '#',
        },
    },
    {
        id: 3,
        name: 'Imran Sheikh',
        role: 'Content Editor',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=85&fit=crop&crop=faces',
        bio: "Ensures all NGO publications are accurate, meaningful, and aligned with the trust's mission and vision.",
        short: 'Editorial accuracy & publication review',
        social: {
            facebook: '#',
            instagram: '#',
            linkedin: '#',
            twitter: '#',
        },
    },
    {
        id: 4,
        name: 'Fatima Qureshi',
        role: 'Digital Media Lead',
        img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=85&fit=crop&crop=faces',
        bio: `Drives Al-Kareem's digital presence, crafting campaigns that amplify community stories and donor engagement.`,
        short: 'Digital campaigns & donor engagement',
        social: {
            facebook: '#',
            instagram: '#',
            linkedin: '#',
            youtube: '#',
        },
    },
];

// Editorial highlights — adds descriptive, keyword-rich body content and a
// second visual rhythm above the team grid.
const HIGHLIGHTS = [
    {
        icon: BookOpen,
        title: 'Research-Backed Reporting',
        desc: 'Every article and report is grounded in on-ground field research across the communities we serve in and around Bhopal.',
    },
    {
        icon: Newspaper,
        title: 'Awareness Publications',
        desc: 'Regular publications on education access, healthcare gaps, and social welfare help donors and volunteers understand real community needs.',
    },
    {
        icon: Megaphone,
        title: 'Community Storytelling',
        desc: 'We document the voices of the families and volunteers behind every program, turning outcomes into stories that build trust.',
    },
];

// Map social key → icon component + colour
const SOCIAL_META = {
    facebook: { Icon: FacebookIcon, color: '#1877F2', label: 'Facebook' },
    instagram: { Icon: InstagramIcon, color: '#E1306C', label: 'Instagram' },
    linkedin: { Icon: LinkedInIcon, color: '#0A66C2', label: 'LinkedIn' },
    twitter: { Icon: TwitterIcon, color: '#000000', label: 'X / Twitter' },
    youtube: { Icon: YoutubeIcon, color: '#FF0000', label: 'YouTube' },
};

// ─── Card ──────────────────────────────────────────────────────────────────────
function TeamCard({ m }) {
    const [hovered, setHovered] = useState(false);

    const socialEntries = Object.entries(m.social).filter(([, href]) => href);

    return (
        <article
            className="group flex flex-col items-center text-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            itemScope
            itemType="https://schema.org/Person"
        >
            {/* Photo container */}
            <div className="relative w-full aspect-[3/3.6] rounded-2xl overflow-hidden mb-5 bg-slate-100 shadow-sm">
                <img
                    src={m.img}
                    alt={`${m.name} — ${m.role} at Al-Kareem Tarbiyat Educational and Welfare Trust`}
                    itemProp="image"
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />

                {/* Hover overlay */}
                <div
                    className={`
                        absolute inset-0
                        bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent
                        flex flex-col justify-end px-5 pb-6 pt-10
                        transition-all duration-500
                        ${hovered ? 'opacity-100' : 'opacity-0'}
                    `}
                >
                    <p
                        className={`
                            text-white/90 text-[13px] lg:text-sm italic leading-relaxed
                            transition-all duration-500
                            ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                    >
                        "{m.bio}"
                    </p>

                    {/* Mail button */}
                    <button
                        aria-label={`Email ${m.name}`}
                        className={`
                            mt-4 self-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm
                            border border-white/30 flex items-center justify-center text-white
                            hover:bg-white hover:text-slate-800
                            transition-all duration-200
                            ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                        style={{ transitionDelay: hovered ? '80ms' : '0ms' }}
                    >
                        <Mail size={15} strokeWidth={1.8} />
                    </button>
                </div>
            </div>

            {/* Name */}
            <h3 itemProp="name" className="text-base lg:text-xl font-bold text-slate-900 leading-snug mb-1.5">
                {m.name}
            </h3>

            {/* Role badge */}
            <span itemProp="jobTitle" className="inline-block bg-slate-100 text-slate-500 text-xs font-medium px-3 py-1 rounded-full mb-3">
                {m.role}
            </span>

            {/* Always-visible one-line summary — keeps key content readable
                without relying on the hover state, which helps both users
                scanning on touch devices and search engines indexing the page. */}
            <p itemProp="description" className="text-slate-400 text-xs lg:text-sm leading-relaxed mb-4 px-2">
                {m.short}
            </p>

            {/* Social icons */}
            <div className="flex items-center justify-center gap-3">
                {socialEntries.map(([key, href]) => {
                    const meta = SOCIAL_META[key];
                    if (!meta) return null;
                    const { Icon, color, label } = meta;
                    return (
                        <a
                            key={key}
                            href={href}
                            aria-label={`${m.name} on ${label}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:scale-110 transition-all duration-200"
                            style={{ color }}
                        >
                            <Icon size={15} />
                        </a>
                    );
                })}
            </div>
        </article>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function ContentResearchTeam() {
    return (
        <section
            id="content-research-team"
            aria-labelledby="crt-heading"
            className="bg-white py-16 lg:py-24"
        >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <Reveal direction="up" as="header" className="text-center max-w-5xl mx-auto mb-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-(--primary) mb-3">
                        People Behind The Reports
                    </p>
                    <h2 id="crt-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-[1.1] mb-4">
                        Our Content &amp; Research Team
                    </h2>
                    <p className="text-slate-500 text-base lg:text-lg leading-relaxed">
                        Behind every awareness campaign, field report, and community story published by Al-Kareem
                        Tarbiyat Educational and Welfare Trust is a small team of writers, researchers, and editors.
                        This content and research team studies education gaps, healthcare access, and social welfare
                        needs across Bhopal's underserved communities, then turns those findings into the articles,
                        reports, and campaigns that inform our donors, volunteers, and the wider public about the
                        real impact of our work.
                    </p>
                </Reveal>

                {/* Editorial highlights — adds scannable, keyword-relevant
                    supporting content above the team grid */}
                <StaggerGroup as="div" amount={0.3} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
                    {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
                        <StaggerItem
                            as="div"
                            direction="up"
                            key={title}
                            className="bg-slate-50 rounded-2xl p-5 lg:p-6 border border-slate-100 text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3">
                                <Icon size={18} className="text-(--primary)" strokeWidth={1.75} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm lg:text-base mb-1">{title}</h3>
                            <p className="text-slate-500 text-xs lg:text-sm leading-relaxed">{desc}</p>
                        </StaggerItem>
                    ))}
                </StaggerGroup>

                {/* Grid */}
                <StaggerGroup as="div" amount={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {TEAM.map((m, i) => (
                        <StaggerItem as="div" direction={i % 2 === 0 ? 'left' : 'right'} key={m.id}>
                            <TeamCard m={m} />
                        </StaggerItem>
                    ))}
                </StaggerGroup>

                {/* Bottom CTA */}
                <Reveal direction="up" className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-5 pt-8 border-t border-slate-100">
                    <p className="text-base font-semibold text-slate-700 text-center sm:text-left">
                        Passionate about content &amp; research?{' '}
                        <span className="text-slate-400 font-normal">We'd love to have you on the team.</span>
                    </p>
                    <Link
                        to="/membership/volunteer-form"
                        className="
                            flex-shrink-0 inline-flex items-center gap-2
                            px-7 py-3 bg-[#1c3990]
                            text-white text-sm font-bold rounded-full
                            hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200
                            transition-all duration-200
                        "
                    >
                        Join Our Team
                        <ArrowRight size={14} strokeWidth={2.5} />
                    </Link>
                </Reveal>

            </div>
        </section>
    );
}