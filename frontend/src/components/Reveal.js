import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/** Shared editorial ease — matches CSS cubic-bezier(0.16, 1, 0.3, 1) / ease-editorial */
export const EASE = [0.16, 1, 0.3, 1];

/**
 * Motion vocabulary (seconds for Framer; CSS uses ms utilities in Tailwind):
 * MICRO ~0.18–0.26 | STANDARD ~0.28–0.42 | EDITORIAL REVEAL ~0.6–1.2
 */
export const MOTION = {
    micro: 0.22,
    standard: 0.36,
    editorial: 0.9,
    line: 1.05,
};

export const Line = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-6% 0px -6% 0px' });
    const reduce = useReducedMotion();
    const show = reduce || inView;
    return (
        <span ref={ref} className={`block overflow-hidden ${className}`}>
            <motion.span
                className="block"
                initial={false}
                animate={{ y: show ? '0%' : '112%' }}
                transition={{ duration: reduce ? 0 : 1.05, ease: EASE, delay: reduce ? 0 : delay }}
            >
                {children}
            </motion.span>
        </span>
    );
};

export const Fade = ({ children, delay = 0, y = 28, className = '' }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-8% 0px -8% 0px' });
    const reduce = useReducedMotion();
    const show = reduce || inView;
    return (
        <motion.div
            ref={ref}
            className={className}
            initial={false}
            animate={{ opacity: show ? 1 : 0, y: show ? 0 : y }}
            transition={{ duration: reduce ? 0 : 0.9, ease: EASE, delay: reduce ? 0 : delay }}
        >
            {children}
        </motion.div>
    );
};

export const Tag = ({ index, label, dark = false }) => (
    <Fade y={10}>
        <div className="flex items-center gap-4" data-testid={`section-tag-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
            <span className="font-mono text-[11px] tracking-[0.3em] text-copper">{index}</span>
            <span className={`h-px w-12 ${dark ? 'bg-ivory/30' : 'bg-graphite/25'}`} />
            <span className={`font-mono text-[11px] tracking-[0.3em] uppercase ${dark ? 'text-ivory/60' : 'text-mute'}`}>{label}</span>
        </div>
    </Fade>
);
