import React from 'react';
import { Users, Heart, ArrowRight, MessageCircle, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATS = [
    { icon: Users, value: '50,000+', label: 'Lives impacted annually' },
    { icon: Heart, value: '15', label: 'Years of service' },
    { icon: Leaf, value: '12', label: 'Active projects' },
];

const QUICK_FACTS = [
    'Registered Public Charitable Trust (1882)',
    '85% of funds go directly to programs',
    'Audited annually by independent firm',
    'All board members serve pro-bono',
];

const NEWS = [
    {
        date: 'March 8, 2025',
        category: 'Education',
        title: '15th learning center opens in Ahmednagar district',
        body: "Last week, we opened our newest center in a village that's never had consistent access to quality education. 68 children enrolled on day one. We partnered with local teachers and are using a curriculum adapted to the agricultural calendar so kids don't have to choose between school and helping their families during harvest season.",
    },
    {
        date: 'January 15, 2025',
        category: 'Recognition',
        title: "National award for women's empowerment work",
        body: "Our skill development program received national recognition this month. What makes us proud isn't the award itself, but what it represents: over 5,000 women who've learned tailoring, handicrafts, and digital skills, and are now earning independently.",
    },
    {
        date: 'December 20, 2024',
        category: 'Environment',
        title: '10,000 saplings planted with community participation',
        body: "Our environmental initiative wrapped up its first phase with 10,000 trees planted across 5 districts. What's different about our approach? We work with local farmers to plant native species that provide both environmental and economic benefits.",
    },
];

const FUTURE_PLANS = [
    {
        title: 'Expand digital literacy to 100 new villages by 2026',
        desc: 'Teaching basic computer skills and internet safety to bridge the digital divide',
    },
    {
        title: 'Launch mobile health clinic for remote areas',
        desc: 'Bringing basic healthcare and health education to villages without access',
    },
    {
        title: 'Open vocational center for youth with disabilities',
        desc: 'Creating opportunities and building inclusive workplaces',
    },
    {
        title: 'Achieve carbon neutrality across all facilities by 2027',
        desc: 'Practicing what we preach on environmental sustainability',
    },
];

const PARTNERS = [
    { src: 'https://img.icons8.com/color/96/microsoft.png', alt: 'Microsoft' },
    { src: 'https://img.icons8.com/color/96/google-logo.png', alt: 'Google' },
    { src: 'https://img.icons8.com/color/96/amazon.png', alt: 'Amazon' },
    { src: 'https://img.icons8.com/color/96/ibm.png', alt: 'IBM' },
    { src: 'https://img.icons8.com/color/96/unicef.png', alt: 'UNICEF' },
    { src: 'https://img.icons8.com/color/96/who.png', alt: 'WHO' },
];

export default function FoundationAbout() {
    return (
        <div className="bg-white">

            {/* ── Hero ── */}
            <div className="relative bg-(--primary) overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-20">
                    <div className="grid lg:grid-cols-12 gap-8 sm:gap-12 items-center">
                        <div className="lg:col-span-7">
                            <div className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-white text-sm mb-4">
                                Since 2010
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                We believe every child deserves a chance to learn
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 max-w-xl">
                                From a single classroom in 2010 to 50,000+ lives touched across rural India. This is our story.
                            </p>

                        </div>

                        {/* Stat cards */}
                        <div className="lg:col-span-5">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                                <div className="space-y-6">
                                    {STATS.map(({ icon: Icon, value, label }) => (
                                        <div key={label} className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">{value}</div>
                                                <div className="text-blue-200 text-sm">{label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Our Story ── */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-4">How it started</h2>
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-6 text-lg text-gray-700 leading-relaxed">
                        <p>
                            In 2010, five friends who met during their college volunteering days decided to do something about
                            the education gap they witnessed in Maharashtra's rural areas. What started as weekend classes for
                            12 children in a borrowed community hall has grown into something we never imagined.
                        </p>
                        <p>
                            Today, we run 15 learning centers across rural Maharashtra, a women's skill development program
                            that's helped over 5,000 women gain financial independence, and a mobile healthcare initiative
                            that reaches remote villages.
                        </p>
                        <p className="text-(--primary) font-semibold">
                            But the mission remains the same: ensure every child, regardless of where they're born, gets a
                            fair shot at building the life they want.
                        </p>
                    </div>

                    {/* Quick facts */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-bold text-gray-900 mb-4">Quick facts</h3>
                        <ul className="space-y-3 text-gray-700">
                            {QUICK_FACTS.map((fact) => (
                                <li key={fact} className="flex items-start gap-2">
                                    <span className="text-(--primary) mt-1">•</span>
                                    <span>{fact}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── Vision & Mission ── */}
            <div className="bg-gray-50 py-16 lg:py-24">
                <div className="max-w-6xl mx-auto px-6 lg:px-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 lg:p-10 rounded-lg border-l-4 border-(--primary)">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">What we're working towards</h3>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                A country where every child has access to quality education, every woman has the skills and
                                opportunity to earn with dignity, and communities have the healthcare they need.
                            </p>
                        </div>
                        <div className="bg-(--primary) p-8 lg:p-10 rounded-lg text-white">
                            <h3 className="text-2xl font-bold mb-3">How we do it</h3>
                            <p className="text-blue-100 text-lg leading-relaxed mb-4">
                                Through grassroots education programs, skill training for women, mobile health clinics, and
                                environmental initiatives—all designed with the communities we serve, not just for them.
                            </p>
                            <Link to="#" className="inline-flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all">
                                See our programs <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>



            {/* ── Future Plans ── */}
            <div className="bg-(--primary) py-16 lg:py-24">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-5">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">What's next for us</h2>
                            <p className="text-blue-100 text-lg mb-8">
                                These are our priorities for the next 18 months. Ambitious? Yes. Possible? We think so,
                                with the right support.
                            </p>
                            <Link
                                to="#"
                                className="inline-flex items-center gap-2 bg-white text-(--primary) px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition"
                            >
                                Support these initiatives
                            </Link>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="space-y-4">
                                {FUTURE_PLANS.map(({ title, desc }) => (
                                    <div
                                        key={title}
                                        className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20"
                                    >
                                        <h4 className="font-bold text-white mb-2">{title}</h4>
                                        <p className="text-blue-100 text-sm">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Partners ── */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <div className="mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-2">Partners & supporters</h2>
                    <p className="text-gray-600 text-lg">Organizations we're grateful to work with</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-7xl mx-auto">
                    {PARTNERS.map(({ src, alt }) => (
                        <div
                            key={alt}
                            className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                            <img
                                src={src}
                                alt={alt}
                                className="w-16 h-16 object-contain grayscale hover:grayscale-0 transition"
                            />
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}