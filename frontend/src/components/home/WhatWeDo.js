import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Line, Fade, Tag, EASE } from '../Reveal';
import { CAPABILITIES } from '../../data/content';

export default function WhatWeDo() {
    const [active, setActive] = useState(0);

    return (
        <section id="what-we-do" className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-40" data-testid="what-we-do-section">
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <Tag index="03" label="Capabilities" />
                    <h2 className="text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                        <Line>WHAT WE DO</Line>
                    </h2>
                </div>
                <Fade delay={0.2}>
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute pb-3">
                        Contents - Select a chapter
                    </p>
                </Fade>
            </div>

            <div className="grid lg:grid-cols-12 gap-10 mt-16 lg:mt-20">
                <div className="lg:col-span-7">
                    {CAPABILITIES.map((c, i) => (
                        <Fade key={c.index} delay={i * 0.06} y={16}>
                            <button
                                onMouseEnter={() => setActive(i)}
                                onClick={() => setActive(i)}
                                className="group relative w-full text-left border-t border-graphite/15 last:border-b py-7 lg:py-9 focus-visible:outline-copper"
                                data-testid={`capability-row-${c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                aria-expanded={active === i}
                            >
                                <span
                                    className={`absolute left-0 top-0 h-[2px] bg-copper transition-all duration-700 ease-out ${active === i ? 'w-full' : 'w-0'}`}
                                />
                                <span className="flex items-baseline gap-5 lg:gap-8">
                                    <span className={`font-mono text-xs tracking-[0.2em] transition-colors duration-300 ${active === i ? 'text-copper' : 'text-mute'}`}>
                                        {c.index}
                                    </span>
                                    <span
                                        className={`text-[clamp(1.6rem,3.4vw,3.2rem)] leading-none font-extrabold tracking-[-0.02em] uppercase transition-all duration-500 ${active === i ? 'text-graphite translate-x-2' : 'text-graphite/40'}`}
                                    >
                                        {c.title}
                                    </span>
                                    <ArrowUpRight
                                        size={26}
                                        className={`ml-auto shrink-0 self-center transition-all duration-500 ${active === i ? 'opacity-100 translate-x-0 text-copper' : 'opacity-0 -translate-x-3 text-mute'}`}
                                    />
                                </span>
                                <AnimatePresence initial={false}>
                                    {active === i && (
                                        <motion.span
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.5, ease: EASE }}
                                            className="block overflow-hidden"
                                        >
                                            <span className="block pt-4 pl-9 lg:pl-14 max-w-xl text-sm lg:text-base text-mute leading-relaxed">
                                                {c.blurb}
                                            </span>
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </Fade>
                    ))}
                </div>

                <div className="hidden lg:block lg:col-span-5">
                    <div className="sticky top-32 h-[68vh] overflow-hidden">
                        <AnimatePresence mode="popLayout">
                            <motion.img
                                key={active}
                                src={CAPABILITIES[active].image}
                                alt={CAPABILITIES[active].title}
                                initial={{ clipPath: 'inset(0 0 100% 0)', scale: 1.08 }}
                                animate={{ clipPath: 'inset(0 0 0% 0)', scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: EASE }}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                            />
                        </AnimatePresence>
                        <span className="absolute bottom-4 left-4 bg-forest text-ivory font-mono text-[9px] tracking-[0.25em] px-3 py-2 z-10">
                            CAPABILITY / {CAPABILITIES[active].index}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
