import { useRef, useState } from 'react';
import { motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import { Line, Fade, Tag } from '../Reveal';
import { PROCESS_STEPS, QUALITY_STEPS } from '../../data/content';

export default function Process() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.55'] });
    const scaleX = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
    const [prog, setProg] = useState(0);
    useMotionValueEvent(scrollYProgress, 'change', (v) => setProg(v));

    return (
        <>
            <section ref={ref} className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-40" data-testid="process-section">
                <Tag index="06" label="How Trade Moves" />
                <h2 className="text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>FROM REQUIREMENT</Line>
                    <Line delay={0.12}>TO DELIVERY<span className="text-copper">.</span></Line>
                </h2>

                <div className="relative mt-20 lg:mt-28">
                    <div className="absolute top-7 left-0 right-0 h-px bg-graphite/15" />
                    <motion.div className="absolute top-7 left-0 right-0 h-px bg-copper origin-left" style={{ scaleX }} />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-14">
                        {PROCESS_STEPS.map((s, i) => {
                            const on = prog * 6.4 > i;
                            return (
                                <div key={s.index} className="relative pt-0" data-testid={`process-step-${s.title.toLowerCase()}`}>
                                    <div className="flex items-center gap-3 h-14">
                                        <span className={`w-2.5 h-2.5 transition-colors duration-700 ${on ? 'bg-copper' : 'bg-graphite/20'}`} />
                                        <span className={`text-4xl lg:text-5xl font-extrabold tracking-tight transition-colors duration-700 ${on ? 'text-graphite' : 'text-graphite/15'}`}>
                                            {s.index}
                                        </span>
                                    </div>
                                    <h3 className={`font-extrabold tracking-tight uppercase mt-4 transition-all duration-700 ${on ? 'text-xl lg:text-2xl text-graphite' : 'text-lg text-graphite/40'}`}>
                                        {s.title}
                                    </h3>
                                    <p className={`text-xs lg:text-sm leading-relaxed mt-3 max-w-[220px] transition-opacity duration-700 ${on ? 'opacity-100 text-mute' : 'opacity-0'}`}>
                                        {s.blurb}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="quality" className="text-graphite px-6 lg:px-12 py-28 lg:py-40" style={{ backgroundColor: '#DFDACD' }} data-testid="quality-section">
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
