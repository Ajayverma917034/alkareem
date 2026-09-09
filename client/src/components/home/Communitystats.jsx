// CommunityStats.jsx  →  src/components/home/CommunityStats.jsx

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Heart, Users, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 2400, started = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!started) return;
        let startTime = null;
        const step = (ts) => {
            if (!startTime) startTime = ts;
            const p = Math.min((ts - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 4);
            setCount(Math.floor(eased * target));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [started, target, duration]);
    return count;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
    {
        icon: Heart,
        value: 120859,
        suffix: '+',
        label: 'Donors',
        desc: 'Generous hearts fuelling our mission every single day.',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-500',
        delay: 200,
    },
    {
        icon: Users,
        value: 8500,
        suffix: '+',
        label: 'Volunteers',
        desc: 'Dedicated people giving their time to create real change.',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        delay: 350,
    },
    {
        icon: FolderOpen,
        value: 320,
        suffix: '+',
        label: 'Projects',
        desc: 'Impactful initiatives launched across Bhopal and beyond.',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-500',
        delay: 500,
    },
];

const images = [
    {
        src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&q=80&fit=crop',
        alt: 'Education support',
        span: 'col-span-2',
        h: 'h-52 sm:h-60',
    },
    {
        src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=700&q=80&fit=crop',
        alt: 'Smiling children',
        span: 'col-span-1',
        h: 'h-52 sm:h-60',
    },
    {
        src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=700&q=80&fit=crop',
        alt: 'Children learning',
        span: 'col-span-1',
        h: 'h-44 sm:h-52',
    },
    {
        src: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=700&q=80&fit=crop',
        alt: 'Making a change',
        span: 'col-span-2',
        h: 'h-44 sm:h-52',
    },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ stat, started }) {
    const count = useCountUp(stat.value, 2400, started);
    const Icon = stat.icon;

    return (
        <div
            className="group flex items-start gap-5 bg-white rounded-2xl p-4 border-gray-200 border hover:-translate-y-1 transition-all duration-300"
            style={{
                opacity: started ? 1 : 0,
                transform: started ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.65s ease ${stat.delay}ms, transform 0.65s ease ${stat.delay}ms`,
            }}
        >
            {/* Icon */}
            <span className={`mt-1 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={20} strokeWidth={1.8} />
            </span>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-3xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none">
                    {count.toLocaleString()}{stat.suffix}
                </p>
                <p className="text-sm font-semibold text-slate-700 mt-1 mb-2">{stat.label}</p>
                <p className="text-[13px] text-slate-400 leading-relaxed">{stat.desc}</p>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CommunityStats() {
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setStarted(true); observer.disconnect(); } },
            { threshold: 0.2 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={ref} className="bg-slate-50 py-16 lg:py-28 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* ── Header ── */}
                <div
                    className="mb-1 sm:mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5"
                    style={{
                        opacity: started ? 1 : 0,
                        transform: started ? 'none' : 'translateY(-18px)',
                        transition: 'opacity 0.6s ease, transform 0.6s ease',
                    }}
                >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-4">
                        Numbers that speak
                    </h2>

                </div>

                {/* ── Two-column layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

                    {/* Left — image mosaic */}
                    <div
                        className="grid grid-cols-3 gap-3"
                        style={{
                            opacity: started ? 1 : 0,
                            transform: started ? 'translateX(0)' : 'translateX(-48px)',
                            transition: 'opacity 0.7s ease 100ms, transform 0.7s ease 100ms',
                        }}
                    >
                        {images.map((img, i) => (
                            <div
                                key={i}
                                className={`${img.span} ${img.h} overflow-hidden rounded-2xl`}
                                style={{
                                    opacity: started ? 1 : 0,
                                    transition: `opacity 0.55s ease ${i * 120 + 150}ms`,
                                }}
                            >
                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Right — stats + CTA */}
                    <div className="flex flex-col gap-3">
                        {stats.map((s) => (
                            <StatCard key={s.label} stat={s} started={started} />
                        ))}

                        {/* CTA */}
                        <Link
                            to="/membership/volunteer-form"
                            className="mt-3 inline-flex items-center justify-center gap-2 px-8 py-4 bg-(--primary) text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto self-start"
                            style={{
                                opacity: started ? 1 : 0,
                                transform: started ? 'translateY(0)' : 'translateY(16px)',
                                transition: 'opacity 0.6s ease 700ms, transform 0.6s ease 700ms',
                            }}
                        >
                            Yes, I want to join community
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}