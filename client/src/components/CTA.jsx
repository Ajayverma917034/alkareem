import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Reusable scroll-triggered variants — each element enters from a different direction
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const fromLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const fromRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }
}

const CTA = () => {
    return (
        <section className="relative py-20 lg:py-28 overflow-hidden">
            {/* Background image — subtle zoom-in on scroll into view */}
            <motion.img
                src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600&q=85&fit=crop"
                alt="Community support"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.15, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Gradient overlay for readability, tinted with brand color */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-950/80 to-(--primary)/80" />

            <motion.div
                className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
            >
                <div className="max-w-2xl flex flex-col justify-center items-center mx-auto">
                    <motion.p
                        variants={fromLeft}
                        className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-3"
                    >
                        Join Us
                    </motion.p>
                    <motion.h2
                        variants={fadeUp}
                        className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.1] mb-5 text-center"
                    >
                        Together, We Can Make a Difference
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-xl text-center"
                    >
                        Your support can help provide education, healthcare and essential
                        support to families who need it most.
                    </motion.p>

                    <motion.div variants={scaleIn} className="flex flex-wrap gap-3">
                        <motion.div variants={fromLeft} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                to="/donate"
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-(--primary) text-white text-sm font-semibold rounded-full hover:shadow-lg transition-shadow duration-200"
                            >
                                Donate Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                        <motion.div variants={fromRight} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold rounded-full border border-white/30 hover:bg-white/10 transition-all duration-200"
                            >
                                Get Involved
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}

export default CTA