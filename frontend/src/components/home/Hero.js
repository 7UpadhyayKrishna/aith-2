import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Line, Fade, EASE } from '../Reveal';
import { IMG } from '../../data/content';

const STRIP = ['Global Sourcing', 'Import', 'Export', 'Procurement', 'Bulk Trading', 'Supply Chain'];

const ANNOTATIONS = [
    { text: "28°36'N 77°13'E", cls: 'top-[22%] left-[6%]' },
    { text: 'SOURCE / VERIFY / MOVE', cls: 'top-[30%] right-[8%]' },
    { text: 'ASIA → MIDDLE EAST → EUROPE', cls: 'top-[52%] right-[12%]' },
    { text: 'INNSA1 — AEJEA — NLRTM', cls: 'top-[58%] left-[10%]' },
];

export default function Hero() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const stripX = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);

    return (
        <section ref={ref} className="relative min-h-screen bg-forest text-ivory overflow-hidden flex flex-col" data-testid="hero-section">
            <motion.div style={{ y }} className="absolute inset-0">
                <img
                    src={IMG.hero}
                    alt="Aerial view of shipping containers stacked at a port terminal"
                    className="w-full h-[118%] object-cover opacity-40"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-forest/45" />
            </motion.div>

            {ANNOTATIONS.map((a, i) => (
                <motion.span
                    key={a.text}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.25, duration: 1.2 }}
                    className={`absolute hidden lg:block font-mono text-[10px] tracking-[0.3em] text-ivory/35 ${a.cls}`}
                >
                    {a.text}
                </motion.span>
            ))}

            <div className="relative z-10 flex-1 flex flex-col justify-end px-6 lg:px-12 pt-40 pb-8">
                <Fade delay={0.35} y={10}>
                    <div className="flex items-center justify-between mb-8 lg:mb-12">
                        <div className="flex items-center gap-4">
                            <span className="w-2 h-2 bg-copper" />
                            <span className="font-mono text-[10px] lg:text-[11px] tracking-[0.35em] uppercase text-ivory/70">
                                Asian International Trade House
                            </span>
                        </div>
                        <span className="hidden md:block font-mono text-[10px] tracking-[0.3em] text-ivory/40">
                            EST. FOR GLOBAL TRADE
                        </span>
                    </div>
                </Fade>

                <h1 className="text-[clamp(3.4rem,11vw,10.5rem)] leading-[0.9] tracking-[-0.035em] font-extrabold" data-testid="hero-headline">
                    <Line delay={0.45}>FROM <span className="text-copper">ASIA.</span></Line>
                    <Line delay={0.62}>TO <span className="font-serif italic font-normal tracking-[-0.02em]">EVERYWHERE.</span></Line>
                </h1>

                <div className="grid lg:grid-cols-12 gap-8 mt-10 lg:mt-14 items-end">
                    <Fade delay={0.9} className="lg:col-span-5">
                        <p className="text-ivory/70 text-sm lg:text-base leading-relaxed max-w-md">
                            Global sourcing, international trading and supply solutions connecting products, suppliers and buyers across international markets.
                        </p>
                    </Fade>
                    <Fade delay={1.05} className="lg:col-span-7 flex flex-wrap gap-4 lg:justify-end">
                        <Link
                            to="/products"
                            className="group inline-flex items-center gap-3 bg-copper text-ivory px-7 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                            data-testid="hero-explore-products-button"
                        >
                            Explore Products
                            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                        </Link>
                        <Link
                            to="/request-quote"
                            className="group inline-flex items-center gap-3 border border-ivory/30 text-ivory px-7 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:border-ivory transition-colors duration-300"
                            data-testid="hero-trade-request-button"
                        >
                            Start a Trade Request
                            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Link>
                    </Fade>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 1, ease: EASE }}
                className="relative z-10 border-t border-ivory/15 overflow-hidden"
                data-testid="hero-info-strip"
            >
                <motion.div style={{ x: stripX }} className="flex whitespace-nowrap will-change-transform">
                    {[...STRIP, ...STRIP].map((item, i) => (
                        <span
                            key={i}
                            className="font-mono text-[10px] lg:text-[11px] tracking-[0.32em] uppercase text-ivory/55 py-5 px-8 lg:px-12 border-l border-ivory/15 first:border-l-0 shrink-0"
                        >
                            {item}
                        </span>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
}
