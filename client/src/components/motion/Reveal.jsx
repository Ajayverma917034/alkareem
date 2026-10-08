import { motion } from 'framer-motion'

// Central place for every entrance animation in the app.
// direction: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
export const EASE = [0.22, 1, 0.36, 1]

const directionVariants = {
    up: { hidden: { opacity: 0, y: 44 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -44 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -56 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 56 }, visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } },
    fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
}

/**
 * <MountFade> — animates in once on mount (not scroll-linked). Use for headers/cards
 * on functional or dashboard pages so content is visible immediately, not hidden until scrolled.
 */
export function MountFade({ children, direction = 'up', delay = 0, duration = 0.6, className = '', as = 'div', ...props }) {
    const MotionTag = motion[as] || motion.div
    const variant = directionVariants[direction] || directionVariants.up
    return (
        <MotionTag
            className={className}
            initial={variant.hidden}
            animate={{ ...variant.visible, transition: { duration, delay, ease: EASE } }}
            {...props}
        >
            {children}
        </MotionTag>
    )
}

export const revealVariants = directionVariants

/**
 * <Reveal> — animates its children in once they scroll into view.
 * Usage: <Reveal direction="left" delay={0.1}><h2>...</h2></Reveal>
 */
export function Reveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.7,
    className = '',
    amount = 0.25,
    as = 'div',
    once = true,
    ...props
}) {
    const MotionTag = motion[as] || motion.div
    const variant = directionVariants[direction] || directionVariants.up
    return (
        <MotionTag
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount }}
            variants={{
                hidden: variant.hidden,
                visible: { ...variant.visible, transition: { duration, delay, ease: EASE } },
            }}
            {...props}
        >
            {children}
        </MotionTag>
    )
}

/**
 * <StaggerGroup> — wraps a list/grid so its Reveal children (or motion children
 * using revealVariants) animate in one after another as the group scrolls into view.
 */
export function StaggerGroup({
    children,
    className = '',
    stagger = 0.12,
    delayChildren = 0,
    amount = 0.2,
    once = true,
    as = 'div',
    ...props
}) {
    const MotionTag = motion[as] || motion.div
    return (
        <MotionTag
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren } } }}
            {...props}
        >
            {children}
        </MotionTag>
    )
}

/** Child item to use inside a <StaggerGroup> — inherits timing from the group. */
export function StaggerItem({ children, direction = 'up', className = '', as = 'div', ...props }) {
    const MotionTag = motion[as] || motion.div
    const variant = directionVariants[direction] || directionVariants.up
    return (
        <MotionTag
            className={className}
            variants={{
                hidden: variant.hidden,
                visible: { ...variant.visible, transition: { duration: 0.6, ease: EASE } },
            }}
            {...props}
        >
            {children}
        </MotionTag>
    )
}
