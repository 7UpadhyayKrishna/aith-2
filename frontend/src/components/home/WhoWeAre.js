import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Line, Fade, Tag, EASE } from '../Reveal';
import { IMG } from '../../data/content';

const APPROACH_POINTS = ['Requirement Mapping', 'Supplier Diligence', 'Quality & Documentation', 'Logistics Coordination'];

export default function WhoWeAre() {
    return (
        <>
            <section id="about" className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-44" data-testid="who-we-are-section">
                <Tag index="01" label="Who We Are" />
                <div className="grid lg:grid-cols-12 gap-10 mt-14 lg:mt-20">
                    <h2 className="lg:col-span-8 text-[clamp(2.9rem,7.6vw,7.6rem)] leading-[0.94] tracking-[-0.03em] font-extrabold">
                        <Line>WE CONNECT</Line>
                        <Line delay={0.1}>PRODUCTS,</Line>
                        <Line delay={0.2}>PEOPLE <span className="font-serif italic font-normal text-copper">and</span></Line>
                        <Line delay={0.3}>MARKETS.</Line>
                    </h2>
                    <div className="lg:col-span-3 lg:col-start-10 self-end">
                        <Fade delay={0.35}>
                            <p className="text-mute text-sm lg:text-base leading-relaxed">
                                Asian International Trade House works across international sourcing, procurement and trading to connect quality products with buyers and markets around the world.
                            </p>
                            <Link
                                to="/products"
                                className="group inline-flex items-center gap-2 mt-8 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                                data-testid="who-we-are-products-link"
                            >
                                Explore Products
                                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </Fade>
                    </div>
                </div>
            </section>

            <section className="bg-bone text-graphite" data-testid="approach-section">
                <div className="grid lg:grid-cols-2">
                    <div className="relative px-6 lg:px-0 py-20 lg:py-0 lg:min-h-[90vh] flex items-center">
                        <motion.div
                            initial={{ clipPath: 'inset(14% 10% 14% 10%)' }}
                            whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                            viewport={{ once: true, margin: '-15% 0px' }}
                            transition={{ duration: 1.3, ease: EASE }}
                            className="relative w-full lg:w-[110%] h-[55vh] lg:h-[72vh] overflow-hidden"
                        >
                            <img
                                src={IMG.approach}
                                alt="Agricultural commodity warehouse interior"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <span className="absolute top-4 left-4 bg-forest text-ivory font-mono text-[9px] tracking-[0.25em] px-3 py-2">
                                TRADE / 001 — SOURCE — VERIFY — DELIVER
                            </span>
                        </motion.div>
                        <Fade delay={0.4} className="absolute bottom-4 lg:bottom-10 right-4 lg:right-10 w-36 lg:w-56 z-10">
                            <img
                                src={IMG.approachOverlap}
                                alt="Close-up of rice grains"
                                className="w-full aspect-[4/5] object-cover border-[6px] border-bone shadow-[0_24px_60px_rgba(23,35,29,0.25)]"
                                loading="lazy"
                            />
                        </Fade>
                    </div>

                    <div className="px-6 lg:px-16 py-20 lg:py-32 flex flex-col justify-center">
                        <Tag index="02" label="Our Approach" />
                        <h2 className="text-[clamp(2.4rem,4.6vw,4.6rem)] leading-[0.98] tracking-[-0.025em] font-extrabold mt-12">
                            <Line>TRADE IS MORE</Line>
                            <Line delay={0.1}>THAN MOVING</Line>
                            <Line delay={0.2}>PRODUCTS<span className="text-copper">.</span></Line>
                        </h2>
                        <Fade delay={0.3}>
                            <p className="text-mute text-sm lg:text-base leading-relaxed mt-8 max-w-md">
                                It is about understanding requirements, identifying the right sourcing opportunities, managing quality and documentation, and creating dependable connections between suppliers and international buyers.
                            </p>
                        </Fade>
                        <Fade delay={0.42}>
                            <ul className="mt-10 space-y-3">
                                {APPROACH_POINTS.map((p, i) => (
                                    <li key={p} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 bg-copper shrink-0" />
                                        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-graphite/70">{p}</span>
                                        <span className="flex-1 h-px bg-graphite/10" />
                                        <span className="font-mono text-[10px] text-mute">0{i + 1}</span>
                                    </li>
                                ))}
                            </ul>
                        </Fade>
                    </div>
                </div>
            </section>
        </>
    );
}
