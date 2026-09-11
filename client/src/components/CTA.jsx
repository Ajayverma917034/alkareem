import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const CTA = () => {
    return (
        <section section className="relative py-20 lg:py-28 overflow-hidden" >
            {/* Background image */}
            < img
                src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600&q=85&fit=crop"
                alt="Community support"
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay for readability, tinted with brand color */}
            < div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-950/80 to-(--primary)/80" />

            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl flex flex-col justify-center items-center mx-auto">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-3">
                        Join Us
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.1] mb-5 text-center">
                        Together, We Can Make a Difference
                    </h2>
                    <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-xl text-center">
                        Your support can help provide education, healthcare and essential
                        support to families who need it most.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/donate"
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-(--primary) text-white text-sm font-semibold rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                        >
                            Donate Now
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold rounded-full border border-white/30 hover:bg-white/10 transition-all duration-200"
                        >
                            Get Involved
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CTA