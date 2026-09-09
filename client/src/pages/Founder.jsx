// FounderPage.jsx  →  src/pages/FounderPage.jsx

import React from 'react';
import { ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Data ──────────────────────────────────────────────────────────────────────
const TIMELINE = [
    {
        year: '2010',
        title: 'The Beginning',
        desc: 'Started small community education programs from a single borrowed hall with 12 children.',
        side: 'left',
    },
    {
        year: '2015',
        title: 'NGO Trust Established',
        desc: 'Officially registered as a Public Charitable Trust, giving the mission a formal foundation.',
        side: 'right',
    },
    {
        year: '2018',
        title: 'Healthcare & Welfare',
        desc: `Expanded scope into mobile healthcare clinics and women's welfare initiatives across districts.`,
        side: 'left',
    },
    {
        year: '2023',
        title: 'Thousands Reached',
        desc: 'Reached thousands of beneficiaries across regions — 50,000+ lives impacted annually.',
        side: 'right',
    },
];

const VALUES = [
    { emoji: '📚', title: 'Education First', desc: 'Every child deserves quality learning regardless of background.' },
    { emoji: '❤️', title: 'Compassion', desc: 'We serve with empathy, dignity, and respect for all.' },
    { emoji: '🌱', title: 'Sustainability', desc: 'Building long-term change, not short-term fixes.' },
    { emoji: '🤝', title: 'Community', desc: 'Designed with communities, not just for them.' },
];

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Founder() {
    return (
        <div className="bg-white py-10 lg:py-10">

            <div className="text-center mb-0">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-[1.1] mb-3">
                    Our Founder
                </h2>
                <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
                    A journey of dedication, compassion, and commitment to uplift society
                </p>

            </div>
            {/* ── Founder Profile ── */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-20 items-center">

                    <div className="relative rounded-2xl overflow-hidden aspect-square max-w-xs md:max-w-sm mx-auto lg:max-w-md shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&q=85&fit=crop&crop=faces"
                            alt="Haji Abdul Kareem"
                            className="w-full h-full object-cover object-top"
                        />

                    </div>

                    {/* Bio */}
                    <div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0 leading-tight">
                            Haji Abdul Kareem
                        </h2>
                        <p className="text-[#1c3990] font-semibold mb-6 text-sm">
                            Founder &amp; Visionary Leader
                        </p>

                        <div className="space-y-3 text-slate-600 leading-relaxed">
                            <p>
                                Haji Abdul Kareem founded Al-Kareem Tarbiyat Educational and Welfare Trust with a mission
                                to bring positive change in society through education, healthcare, and social welfare initiatives.
                            </p>
                            <p>
                                His vision is to empower underprivileged communities, promote moral values, and create
                                opportunities for a better future. His leadership continues to inspire volunteers and members
                                to work selflessly for humanity.
                            </p>
                            <p className="text-[#1c3990] font-semibold">
                                "Every person has the right to live with dignity — that belief drives everything we do."
                            </p>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 bg-[#1c3990] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#122468] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 transition-all duration-200"
                            >
                                Get in Touch <ArrowRight size={14} />
                            </Link>
                            <Link
                                to="/about"
                                className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-6 py-3 rounded-full text-sm font-semibold hover:border-[#1c3990] hover:text-[#1c3990] transition-all duration-200"
                            >
                                Our Story
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Journey Timeline ── */}
            <div className="bg-slate-50 py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <p className="text-xs font-semibold tracking-widest uppercase text-[#1c3990] mb-2">
                            Milestones
                        </p>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                            Journey Timeline
                        </h2>
                    </div>

                    {/* Desktop zigzag timeline */}
                    <div className="hidden md:block relative">
                        {/* Center line */}
                        <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1c3990] via-teal-500 to-[#1c3990]" />

                        <div className="space-y-10">
                            {TIMELINE.map(({ year, title, desc, side }, i) => (
                                <div
                                    key={year}
                                    className={`relative flex items-center gap-0 ${side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Card */}
                                    <div className={`w-[45%] ${side === 'right' ? 'text-left pl-8' : 'text-right pr-8'}`}>
                                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                            <div className="text-[#1c3990] font-bold text-sm mb-1">{year}</div>
                                            <div className="font-bold text-slate-900 text-base mb-1">{title}</div>
                                            <div className="text-slate-500 text-sm leading-relaxed">{desc}</div>
                                        </div>
                                    </div>

                                    {/* Center dot */}
                                    <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow-md z-10" />

                                    {/* Spacer */}
                                    <div className="w-[45%]" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile stacked timeline */}
                    <div className="md:hidden relative pl-8">
                        <div className="absolute left-[17.5px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1c3990] to-teal-500" />
                        <div className="space-y-8">
                            {TIMELINE.map(({ year, title, desc }) => (
                                <div key={year} className="relative">
                                    <div className="absolute -left-[21px] top-4 w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow-md" />
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                                        <div className="text-[#1c3990] font-bold text-sm mb-1">{year}</div>
                                        <div className="font-bold text-slate-900 text-base mb-1">{title}</div>
                                        <div className="text-slate-500 text-sm leading-relaxed">{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Vision & Mission ── */}
            <div className="py-16 lg:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#1c3990] mb-2">
                        Purpose
                    </p>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                        Vision &amp; Mission
                    </h2>

                    {/* Quote card */}
                    <div className="relative bg-gradient-to-br from-[#1c3990] to-[#122468] rounded-2xl p-8 sm:p-12 mb-10 overflow-hidden">
                        <div className="absolute top-4 left-6 opacity-10">
                            <Quote size={80} className="text-white" />
                        </div>
                        <p className="relative text-white text-lg sm:text-xl lg:text-2xl font-medium italic leading-relaxed max-w-2xl mx-auto">
                            "To create an inclusive society where every individual has access to education,
                            healthcare, and opportunities to grow and succeed."
                        </p>
                        <div className="mt-6 text-blue-300 text-sm font-semibold">
                            — Haji Abdul Kareem, Founder
                        </div>
                    </div>

                    {/* Two pillars */}
                    <div className="grid sm:grid-cols-2 gap-6 text-left">
                        <div className="bg-slate-50 rounded-xl p-6 border-l-4 border-[#1c3990]">
                            <h3 className="font-bold text-slate-900 text-lg mb-2">Our Vision</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                A world where every child learns, every woman earns with dignity, and every community has
                                access to the healthcare and support it needs to thrive.
                            </p>
                        </div>
                        <div className="bg-[#1c3990] rounded-xl p-6 text-white">
                            <h3 className="font-bold text-lg mb-2">Our Mission</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Through education, skill development, healthcare, and environmental initiatives — designed
                                with communities, not just for them — we build lasting change from the ground up.
                            </p>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}