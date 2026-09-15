import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Line, Fade, Tag } from '../Reveal';
import { PROCESS_STEPS, QUALITY_STEPS } from '../../data/content';

function ProcessStep({ step, index, progress }) {
    // progress 0–1 across 6 steps; activate when progress passes this index
    const on = useTransform(progress, (v) => (v * 6.4 > index ? 1 : 0));
    const dotBg = useTransform(on, [0, 1], ['rgba(32,37,34,0.2)', '#B65A32']);
    const numColor = useTransform(on, [0, 1], ['rgba(32,37,34,0.15)', '#202522']);
    const titleColor = useTransform(on, [0, 1], ['rgba(32,37,34,0.4)', '#202522']);
    const blurbOpacity = useTransform(on, [0, 1], [0, 1]);
    const titleSize = useTransform(on, [0, 1], [1, 1.08]);

    return (
        <div className="relative pt-0" data-testid={`process-step-${step.title.toLowerCase()}`}>
            <div className="flex items-center gap-3 h-14">
                <motion.span className="w-2.5 h-2.5" style={{ backgroundColor: dotBg }} />
                <motion.span className="text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: numColor }}>
                    {step.index}
                </motion.span>
            </div>
            <motion.h3
                className="font-extrabold tracking-tight uppercase mt-4 text-lg lg:text-xl origin-left"
                style={{ color: titleColor, scale: titleSize }}
            >
                {step.title}
            </motion.h3>
            <motion.p className="text-xs lg:text-sm leading-relaxed mt-3 max-w-[220px] text-mute" style={{ opacity: blurbOpacity }}>
                {step.blurb}
            </motion.p>
        </div>
    );
}

export default function Process() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.55'] });
    const smooth = useSpring(scrollYProgress, { stiffness: 48, damping: 28, mass: 0.45 });
    const scaleX = smooth;

    return (
        <>
            <section ref={ref} className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-40 content-visibility-auto" data-testid="process-section">
                <Tag index="06" label="How Trade Moves" />
                <h2 className="text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>FROM REQUIREMENT</Line>
                    <Line delay={0.12}>TO DELIVERY<span className="text-copper">.</span></Line>
                </h2>

                <div className="relative mt-20 lg:mt-28">
                    <div className="absolute top-7 left-0 right-0 h-px bg-graphite/15" />
                    <motion.div className="absolute top-7 left-0 right-0 h-px bg-copper origin-left will-change-transform" style={{ scaleX }} />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-14">
                        {PROCESS_STEPS.map((s, i) => (
                            <ProcessStep key={s.index} step={s} index={i} progress={smooth} />
                        ))}
                    </div>
                </div>
            </section>

            <section id="quality" className="text-graphite px-6 lg:px-12 py-28 lg:py-40 content-visibility-auto" style={{ backgroundColor: '#DFDACD' }} data-testid="quality-section">
                <div className="grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7">
                        <Tag index="07" label="Quality & Compliance" />
                        <h2 className="text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                            <Line>QUALITY</Line>
                            <Line delay={0.12}>IS A PROCESS<span className="text-copper">.</span></Line>
                        </h2>
                    </div>
                    <div className="lg:col-span-4 lg:col-start-9 self-end">
                        <Fade delay={0.25}>
                            <p className="font-serif italic text-2xl lg:text-3xl text-graphite/80">Not a marketing claim.</p>
                            <p className="text-mute text-sm leading-relaxed mt-5 max-w-xs">
                                Every shipment moves through the same sequence — regardless of size, product or destination.
                            </p>
                            <Link
                                to="/quality-compliance"
                                className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-[0.22em] uppercase text-copper border-b border-copper/40 pb-1 hover:border-copper"
                            >
                                Quality & compliance
                            </Link>
                        </Fade>
                    </div>
                </div>

                <div className="mt-16 lg:mt-24 divide-y divide-graphite/15 border-y border-graphite/15">
                    {QUALITY_STEPS.map((q, i) => (
                        <Fade key={q.index} delay={i * 0.05} y={18}>
                            <div className="grid lg:grid-cols-12 gap-3 lg:gap-6 py-7 lg:py-9 items-baseline" data-testid={`quality-row-${q.title.toLowerCase().replace(/\s+/g, '-')}`}>
                                <span className="lg:col-span-2 font-mono text-xs tracking-[0.25em] text-copper">{q.index}</span>
                                <h3 className="lg:col-span-6 text-2xl lg:text-4xl font-extrabold tracking-tight uppercase">{q.title}</h3>
                                <p className="lg:col-span-4 text-sm text-mute leading-relaxed">{q.blurb}</p>
                            </div>
                        </Fade>
                    ))}
                </div>
            </section>
        </>
    );
}
