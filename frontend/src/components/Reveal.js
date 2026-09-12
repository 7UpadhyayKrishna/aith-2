import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const EASE = [0.16, 1, 0.3, 1];

export const Line = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-6% 0px -6% 0px' });
    return (
        <span ref={ref} className={`block overflow-hidden ${className}`}>
            <motion.span
                className="block will-change-transform"
                initial={false}
                animate={{ y: inView ? '0%' : '112%' }}
                transition={{ duration: 1.05, ease: EASE, delay }}
                style={{ transform: inView ? undefined : 'translateY(112%)' }}
            >
                {children}
            </motion.span>
        </span>
    );
};

export const Fade = ({ children, delay = 0, y = 28, className = '' }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-8% 0px -8% 0px' });
    return (
        <motion.div
            ref={ref}
            className={className}
            initial={false}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : y }}
            transition={{ duration: 0.9, ease: EASE, delay }}
            style={{ opacity: inView ? undefined : 0, transform: inView ? undefined : `translateY(${y}px)` }}
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
