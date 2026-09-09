// npm install swiper
import { Heart, Users, BookOpen, Utensils, Globe } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Link } from 'react-router-dom';

const slides = [
    {
        id: 1,
        title: 'Support Healthcare Initiatives',
        subtitle: 'Help us provide medical support to those in need.',
        Icon: Heart,
        image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1400&q=80&fit=crop',
        accent: '#2563EB',
        accentLight: '#EFF6FF',
        accentText: '#2563EB',
        tag: 'Healthcare',
        btnBg: 'bg-blue-600 shadow-blue-600/40',
    },
    {
        id: 2,
        title: 'Be the Change',
        subtitle: 'Your contribution matters. Join hands with us.',
        Icon: Users,
        image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1400&q=80&fit=crop',
        accent: '#0D9488',
        accentLight: '#F0FDFA',
        accentText: '#0D9488',
        tag: 'Community',
        btnBg: 'bg-teal-600 shadow-teal-600/40',
    },
    {
        id: 3,
        title: 'Empowering Education for Every Child',
        subtitle: 'Join us in building a brighter future through education and support.',
        Icon: BookOpen,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1400&q=80&fit=crop',
        accent: '#7C3AED',
        accentLight: '#F5F3FF',
        accentText: '#7C3AED',
        tag: 'Education',
        btnBg: 'bg-violet-600 shadow-violet-600/40',
    },
    {
        id: 4,
        title: 'Help Us Feed the Needy',
        subtitle: "Your small donation can bring a big change in someone's life.",
        Icon: Utensils,
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&q=80&fit=crop',
        accent: '#EA580C',
        accentLight: '#FFF7ED',
        accentText: '#EA580C',
        tag: 'Food Relief',
        btnBg: 'bg-orange-600 shadow-orange-600/40',
    },
    {
        id: 5,
        title: 'Together for a Better Society',
        subtitle: 'We work for health, education and social equality.',
        Icon: Globe,
        image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1400&q=80&fit=crop',
        accent: '#059669',
        accentLight: '#ECFDF5',
        accentText: '#059669',
        tag: 'Social Impact',
        btnBg: 'bg-emerald-600 shadow-emerald-600/40',
    },
];

export default function HeroCarousel() {
    return (
        <>
            {/* Swiper overrides — minimal, only what Tailwind can't reach (vendor UI elements) */}
            <style>{`
                .hero-swiper { width:100%; height:clamp(380px,63vw,670px); }

                .hero-swiper .swiper-pagination { bottom:24px; display:flex; align-items:center; justify-content:center; gap:8px; }
                .hero-swiper .swiper-pagination-bullet { width:8px; height:8px; border-radius:999px; background:rgba(255,255,255,0.4); opacity:1; margin:0!important; transition:width .3s,background .3s; }
                .hero-swiper .swiper-pagination-bullet-active { width:28px; background:#fff; }

                .hero-swiper .swiper-button-prev,
                .hero-swiper .swiper-button-next { width:clamp(36px,5vw,48px); height:clamp(36px,5vw,48px); border-radius:50%; background:rgba(255,255,255,0.12); border:1.5px solid rgba(255,255,255,0.35); backdrop-filter:blur(8px); color:#fff; margin-top:0; top:50%; transform:translateY(-50%); transition:background .2s,transform .2s; }
                .hero-swiper .swiper-button-prev { left:clamp(12px,3vw,24px); }
                .hero-swiper .swiper-button-next { right:clamp(12px,3vw,24px); }
                .hero-swiper .swiper-button-prev:hover,
                .hero-swiper .swiper-button-next:hover { background:rgba(255,255,255,0.26); transform:translateY(-50%) scale(1.1); }
                .hero-swiper .swiper-button-prev::after,
                .hero-swiper .swiper-button-next::after { font-size:15px; font-weight:700; }

                /* Content animate-in via swiper-slide-active */
                .slide-tag,.slide-title,.slide-sub,.slide-btns { opacity:0; transform:translateY(22px); transition:opacity .55s ease,transform .55s ease; }
                .swiper-slide-active .slide-tag  { opacity:1; transform:translateY(0); transition-delay:.1s; }
                .swiper-slide-active .slide-title { opacity:1; transform:translateY(0); transition-delay:.2s; }
                .swiper-slide-active .slide-sub   { opacity:1; transform:translateY(0); transition-delay:.3s; }
                .swiper-slide-active .slide-btns  { opacity:1; transform:translateY(0); transition-delay:.4s; }
            `}</style>

            <Swiper
                className="hero-swiper"
                modules={[Autoplay, EffectFade]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                autoplay={{ delay: 3000, disableOnInteraction: true }}
                loop
                speed={800}
                allowTouchMove={false}
                simulateTouch={false}
            >
                {slides.map((slide) => {
                    const { Icon } = slide;
                    return (
                        <SwiperSlide key={slide.id}>
                            {/* Background Image */}
                            <img
                                src={slide.image}
                                alt={slide.title}
                                draggable={false}
                                className="absolute inset-0 w-full h-full object-cover select-none"
                            />

                            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/20 pointer-events-none" />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                            {/* Slide Content */}
                            <div className="absolute inset-0 flex flex-col justify-center items-center max-w-4xl mx-auto">

                                {/* Tag */}
                                <span
                                    className="slide-tag inline-flex items-center justify-center gap-2 self-center mb-5 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#EFF6FF] text-[#2563EB] text-center"
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {slide.tag}
                                </span>

                                {/* Title */}
                                <h1 className="slide-title text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white sm:leading-tight mb-4 max-w-2xl drop-shadow-lg text-center">
                                    {slide.title}
                                </h1>

                                {/* Subtitle */}
                                <p className="slide-sub text-sm sm:text-base lg:text-lg text-white/80 max-w-xl leading-relaxed mb-8 text-center">
                                    {slide.subtitle}
                                </p>

                                {/* Buttons */}
                                <div className="slide-btns flex flex-wrap gap-3 justify-center">
                                    <Link to={'/donate'}
                                        className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-bold text-white shadow-lg hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-150 bg-(--primary) shadow-blue-600/40"
                                    >
                                        <Heart className="w-4 h-4 fill-white stroke-none" />
                                        Donate Now
                                    </Link>

                                    <Link to={'/membership/volunteer-form'} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-bold text-white border-2 border-white/50 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white hover:scale-105 active:scale-95 transition-all duration-150">
                                        <Users className="w-4 h-4" />
                                        Join Us
                                    </Link>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </>
    );
}