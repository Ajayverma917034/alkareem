

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import {
    BookOpen, Utensils, Heart, Shield, Leaf, AlertTriangle,
    ChevronLeft, ChevronRight, ArrowUpRight, Minus,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const services = [
    {
        id: 1,
        Icon: BookOpen,
        title: 'Education Support',
        tag: 'Education',
        num: '01',
        stat: '3,000+ children',
        short: 'Free education and learning resources for underprivileged children across Bhopal.',
        full: 'We believe every child deserves a quality education regardless of their financial background. Our Education Support program runs free tuition centres, distributes books and stationery, and connects students with qualified volunteer teachers. We also run digital literacy workshops. To date, we have supported over 3,000 children across 18 localities in and around Bhopal.',
        strip: 'bg-gradient-to-r from-blue-600 to-blue-800',
        iconBg: 'bg-blue-50',
        iconText: 'text-blue-600',
        pillBg: 'bg-blue-100',
        pillText: 'text-blue-700',
        border: 'border-blue-100',
        shadow: 'hover:shadow-blue-100/60',
        ghost: 'text-blue-100',
        readMore: 'text-blue-600 hover:text-blue-800',
        bar: 'from-blue-600 to-blue-800',
    },
    {
        id: 2,
        Icon: Utensils,
        title: 'Food Donation',
        tag: 'Food Relief',
        num: '02',
        stat: '400+ families / month',
        short: 'Daily meals and grocery kits distributed to homeless families and daily-wage workers.',
        full: 'Hunger should not exist in a society that can choose to act. Our Food Donation initiative prepares and distributes hot meals seven days a week to homeless individuals and low-income families. We also run a monthly grocery drive delivering essential food kits to over 400 families. Emergency parcels are dispatched within 24 hours during crisis situations.',
        strip: 'bg-gradient-to-r from-orange-500 to-orange-700',
        iconBg: 'bg-orange-50',
        iconText: 'text-orange-500',
        pillBg: 'bg-orange-100',
        pillText: 'text-orange-700',
        border: 'border-orange-100',
        shadow: 'hover:shadow-orange-100/60',
        ghost: 'text-orange-100',
        readMore: 'text-orange-600 hover:text-orange-800',
        bar: 'from-orange-500 to-orange-700',
    },
    {
        id: 3,
        Icon: Heart,
        title: 'Healthcare Help',
        tag: 'Healthcare',
        num: '03',
        stat: '50 km mobile reach',
        short: 'Free medical camps, medicines, and specialist consultations for poor communities.',
        full: 'Access to healthcare should be a right, not a privilege. We run quarterly free medical camps in underserved localities staffed by doctors, nurses, and pharmacists. Services include general consultations, blood tests, eye check-ups, and dental care. Our mobile health unit reaches villages within a 50 km radius of Bhopal on a bi-monthly schedule.',
        strip: 'bg-gradient-to-r from-rose-500 to-rose-700',
        iconBg: 'bg-rose-50',
        iconText: 'text-rose-500',
        pillBg: 'bg-rose-100',
        pillText: 'text-rose-700',
        border: 'border-rose-100',
        shadow: 'hover:shadow-rose-100/60',
        ghost: 'text-rose-100',
        readMore: 'text-rose-600 hover:text-rose-800',
        bar: 'from-rose-500 to-rose-700',
    },
    {
        id: 4,
        Icon: Shield,
        title: 'Women Empowerment',
        tag: 'Empowerment',
        num: '04',
        stat: '800+ women trained',
        short: 'Skill training, financial literacy, and mentorship programs for women seeking independence.',
        full: 'Empowered women build empowered communities. Our program offers vocational training in tailoring, handicrafts, computer skills, and small business management. We partner with NGOs and government schemes to connect participants with micro-financing. Over 800 women have completed our programs since 2015, many running their own micro-enterprises.',
        strip: 'bg-gradient-to-r from-violet-600 to-violet-800',
        iconBg: 'bg-violet-50',
        iconText: 'text-violet-600',
        pillBg: 'bg-violet-100',
        pillText: 'text-violet-700',
        border: 'border-violet-100',
        shadow: 'hover:shadow-violet-100/60',
        ghost: 'text-violet-100',
        readMore: 'text-violet-600 hover:text-violet-800',
        bar: 'from-violet-600 to-violet-800',
    },
    {
        id: 5,
        Icon: Leaf,
        title: 'Environmental Care',
        tag: 'Environment',
        num: '05',
        stat: '12,000+ trees planted',
        short: 'Tree plantation, waste management drives, and eco-awareness campaigns citywide.',
        full: 'A clean environment is fundamental to a healthy society. Our program has planted over 12,000 trees across Bhopal in five years. We run monthly cleanliness drives in public spaces, parks, and water bodies, and engage schools through eco-awareness workshops. We are piloting a neighbourhood composting initiative to reduce organic waste from reaching landfills.',
        strip: 'bg-gradient-to-r from-teal-500 to-teal-700',
        iconBg: 'bg-teal-50',
        iconText: 'text-teal-600',
        pillBg: 'bg-teal-100',
        pillText: 'text-teal-700',
        border: 'border-teal-100',
        shadow: 'hover:shadow-teal-100/60',
        ghost: 'text-teal-100',
        readMore: 'text-teal-600 hover:text-teal-800',
        bar: 'from-teal-500 to-teal-700',
    },
    {
        id: 6,
        Icon: AlertTriangle,
        title: 'Disaster Relief',
        tag: 'Relief',
        num: '06',
        stat: '2,000+ families in 48 hrs',
        short: 'Rapid emergency response with food, shelter, and medical aid during crises.',
        full: 'When disaster strikes, speed and coordination save lives. Our Disaster Relief team is on call year-round, ready to mobilise within hours of a flood, earthquake, fire, or other emergency. We maintain a stockpile of tarpaulins, blankets, dry rations, and first-aid kits. During the 2022 Bhopal floods, we reached over 2,000 displaced families within 48 hours.',
        strip: 'bg-gradient-to-r from-amber-500 to-amber-700',
        iconBg: 'bg-amber-50',
        iconText: 'text-amber-600',
        pillBg: 'bg-amber-100',
        pillText: 'text-amber-700',
        border: 'border-amber-100',
        shadow: 'hover:shadow-amber-100/60',
        ghost: 'text-amber-100',
        readMore: 'text-amber-600 hover:text-amber-800',
        bar: 'from-amber-500 to-amber-700',
    },
];

// ─── Card ─────────────────────────────────────────────────────────────────────
function ServiceCard({ s }) {
    const [open, setOpen] = useState(false);
    const { Icon } = s;

    return (
        <div
            className={`
                group relative flex flex-col h-full bg-white
                rounded-2xl border-2 border-gray-200 overflow-hidden
                transition-all duration-300 ease-out
                hover:-translate-y-2 hover:shadow-2xl ${s.shadow}
            `}
        >
            {/* Ghost number watermark */}
            <span
                aria-hidden="true"
                className={`
                    pointer-events-none select-none
                    absolute -top-3 right-3
                    text-[90px] font-black leading-none tracking-tighter
                    text-gray-200 opacity-50
                `}
            >
                {s.num}
            </span>

            {/* Top accent strip */}
            {/* <div className={`h-1.5 w-full flex-shrink-0 bg-gray-300`} /> */}

            {/* Body */}
            <div className="relative z-10 flex flex-col flex-1 gap-4 p-6">

                {/* Icon + pill */}
                <div className="flex items-start justify-between">
                    <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg} ${s.iconText}`}>
                        <Icon size={20} strokeWidth={1.8} />
                    </span>

                </div>



                {/* Title */}
                <h3 className="text-[18px] lg:text-2xl font-bold text-slate-700 leading-snug">
                    {s.title}
                </h3>

                {/* Description */}
                <p className={`text-sm lg:text-base leading-relaxed text-slate-500 flex-1 ${open ? '' : 'line-clamp-3'}`}>
                    {open ? s.full : s.short}
                </p>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-2 mt-auto">
                    <button
                        onClick={() => setOpen(o => !o)}
                        className={`
                            inline-flex items-center gap-1.5
                            text-sm font-bold transition-opacity duration-150 hover:opacity-70
                            ${s.readMore}
                        `}
                    >
                        {open
                            ? <><Minus size={14} strokeWidth={2.5} /> Show Less</>
                            : <><ArrowUpRight size={14} strokeWidth={2.5} /> Read More</>
                        }
                    </button>


                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OurServices() {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    return (
        <section className="bg-slate-50 py-16 lg:py-28">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">

                {/* ── Section Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-6 mb-3">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.1] sm:mb-4">
                        Our Programs
                    </h2>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-4">

                        {/* Nav buttons */}
                        <div className="flex items-center gap-2">
                            {[prevRef, nextRef].map((ref, i) => (
                                <button
                                    key={i}
                                    ref={ref}
                                    aria-label={i === 0 ? 'Previous' : 'Next'}
                                    className="
                                        w-10 h-10 rounded-full border-2 border-slate-200 bg-white
                                        flex items-center justify-center text-slate-600
                                        hover:bg-blue-600 hover:border-blue-600 hover:text-white
                                        transition-all duration-200
                                        shadow-sm hover:shadow-md hover:shadow-blue-200
                                        disabled:opacity-30 disabled:cursor-not-allowed
                                    "
                                >
                                    {i === 0
                                        ? <ChevronLeft size={18} strokeWidth={2.5} />
                                        : <ChevronRight size={18} strokeWidth={2.5} />
                                    }
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Swiper carousel ── */}
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                    pagination={{
                        clickable: true,
                        el: '.os-pagination',
                        bulletClass: 'os-dot',
                        bulletActiveClass: 'os-dot-active',
                    }}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    onSwiper={(swiper) => {
                        swiper.params.navigation.prevEl = prevRef.current;
                        swiper.params.navigation.nextEl = nextRef.current;
                        swiper.navigation.destroy();
                        swiper.navigation.init();
                        swiper.navigation.update();
                    }}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        1024: { slidesPerView: 3, spaceBetween: 24 },
                    }}
                    loop={true}
                    className="!overflow-visible !pb-14"
                >
                    {services.map(s => (
                        <SwiperSlide key={s.id} className="!h-auto">
                            <ServiceCard s={s} />
                        </SwiperSlide>
                    ))}
                </Swiper>

            </div>
        </section>
    );
}