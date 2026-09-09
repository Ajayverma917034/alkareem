// MeetOurTeam.jsx  →  src/components/home/MeetOurTeam.jsx

import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const team = [
    {
        id: 1,
        name: 'Riya Sharma',
        role: 'Founder',
        img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=85&fit=crop&crop=faces',
        bio: 'Visionary behind Al Kareem, Riya has dedicated 12+ years to building a compassionate community from the ground up.',
    },
    {
        id: 2,
        name: 'Amit Verma',
        role: 'Project Manager',
        img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=85&fit=crop&crop=faces',
        bio: 'Amit keeps every initiative on track with meticulous planning and a deeply collaborative spirit.',
    },
    {
        id: 3,
        name: 'Sneha Patel',
        role: 'Volunteer Head',
        img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=85&fit=crop&crop=faces',
        bio: 'Sneha manages 500+ volunteers, ensuring every person feels valued and makes a meaningful impact.',
    },
    {
        id: 4,
        name: 'Rahul Singh',
        role: 'Coordinator',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=85&fit=crop&crop=faces',
        bio: "Rahul bridges communities and partners, expanding Al Kareem's reach across Bhopal every day.",
    },
];

// ─── Card ─────────────────────────────────────────────────────────────────────
function TeamCard({ m }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="group flex flex-col items-center text-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Photo container */}
            <div className="relative w-full aspect-[3/3.6] rounded-2xl overflow-hidden mb-3 sm:mb-5 bg-slate-100">
                <img
                    src={m.img}
                    alt={m.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />

                {/* Overlay — slides up from bottom on hover */}
                <div
                    className={`
                        absolute inset-0
                        bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent
                        flex flex-col justify-end px-5 pb-6 pt-10
                        transition-all duration-500
                        ${hovered ? 'opacity-100' : 'opacity-0'}
                    `}
                >
                    {/* Bio text */}
                    <p
                        className={`
                            text-white/90 text-[13px] lg:text-base italic leading-relaxed
                            transition-all duration-500
                            ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                    >
                        "{m.bio}"
                    </p>

                    {/* Mail icon */}
                    <button
                        aria-label="Email"
                        className={`
                            mt-4 self-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm
                            border border-white/30
                            flex items-center justify-center text-white
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

            {/* Name & role */}
            <h3 className="text-base lg:text-xl font-bold text-slate-900 leading-snug mb-1">
                {m.name}
            </h3>
            <p className="text-sm text-slate-400 font-medium mb-3">
                {m.role}
            </p>

        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MeetOurTeam() {
    return (
        <section className="bg-white py-16 lg:py-28">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-3">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-4">
                        Meet Our Team
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-5 sm:gap-y-12">
                    {team.map(m => (
                        <TeamCard key={m.id} m={m} />
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-5 pt-6 border-t border-slate-100">
                    <p className="text-base font-semibold text-slate-700 text-center sm:text-left">
                        Passionate about change?{' '}
                        <span className="text-slate-400 font-normal">We'd love to have you.</span>
                    </p>
                    <Link
                        to="/membership/volunteer-form"
                        className="
                            flex-shrink-0 inline-flex items-center gap-2
                            px-7 py-3 bg-(--primary)
                            text-white text-sm font-bold rounded-full
                            hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200
                            transition-all duration-200
                        "
                    >
                        Become a Volunteer
                        <ArrowRight size={14} strokeWidth={2.5} />
                    </Link>
                </div>

            </div>
        </section>
    );
}