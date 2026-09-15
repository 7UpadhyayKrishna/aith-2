import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Line, Fade, Tag } from '../Reveal';
import Marquee from '../Marquee';
import { STORIES } from '../../data/content';

export default function Closing() {
    return (
        <>
            <section className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-40" data-testid="insights-teaser-section">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <Tag index="11" label="Insights" />
                        <h2 className="text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                            <Line>TRADE</Line>
                            <Line delay={0.12}>
                                <span className="font-serif italic font-normal">INSIGHTS.</span>
                            </Line>
                        </h2>
                    </div>
                    <Fade delay={0.2}>
                        <Link
                            to="/insights"
                            className="group inline-flex items-center gap-2 pb-3 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 hover:text-copper hover:border-copper transition-colors duration-300"
                            data-testid="insights-all-link"
                        >
                            All Insights
                            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </Fade>
                </div>

                <div className="grid md:grid-cols-3 gap-10 lg:gap-8 mt-16 lg:mt-20">
                    {STORIES.map((s, i) => (
                        <Fade key={s.id} delay={i * 0.1}>
                            <Link to={`/insights/${s.id}`} className="group block" data-testid={`insight-story-${s.id}`}>
                                <div className="overflow-hidden h-64 lg:h-96">
                                    <img
                                        src={s.image}
                                        alt={s.title}
                                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                                <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-copper mt-6">
                                    {s.tag} — {s.read}
                                </p>
                                <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight leading-snug mt-3 group-hover:text-copper transition-colors duration-300">
                                    {s.title}
                                </h3>
                                <span className="inline-block mt-4 h-px w-10 bg-graphite/40 group-hover:w-16 group-hover:bg-copper transition-all duration-500" />
                            </Link>
                        </Fade>
                    ))}
                </div>
            </section>

            <Marquee items={['Trade is Connection', 'Products', 'Suppliers', 'Buyers', 'Markets', 'Opportunities']} />

            <section className="relative bg-forest text-ivory px-6 lg:px-12 py-32 lg:py-48 overflow-hidden" data-testid="final-cta-section">
                <span className="absolute top-10 right-8 font-mono text-[10px] tracking-[0.3em] text-ivory/25 hidden lg:block">ASIA → THE WORLD</span>
                <span className="absolute bottom-10 left-8 font-mono text-[10px] tracking-[0.3em] text-ivory/25 hidden lg:block">28°36'N 77°13'E</span>
                <div className="absolute inset-x-0 top-1/2 h-px bg-ivory/5" />
                <div className="absolute inset-y-0 left-1/3 w-px bg-ivory/5" />

                <Fade y={10}>
                    <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-copper">12 / Start</p>
                </Fade>
                <h2 className="text-[clamp(3rem,9vw,9rem)] leading-[0.92] tracking-[-0.03em] font-extrabold mt-10">
                    <Line delay={0.05}>FROM ASIA.</Line>
                    <Line delay={0.15}>
                        <span className="text-ivory/35">TO THE WORLD.</span>
                    </Line>
                    <Line delay={0.25}>
                        <span className="font-serif italic font-normal text-sand">LET'S TRADE.</span>
                    </Line>
                </h2>
                <Fade delay={0.4}>
                    <div className="flex flex-wrap gap-4 mt-14">
                        <Link
                            to="/request-quote"
                            className="group inline-flex items-center gap-3 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                            data-testid="final-cta-quote-button"
                        >
                            Request a Quote
                            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                        </Link>
                        <Link
                            to="/partner"
                            className="inline-flex items-center gap-3 border border-ivory/30 text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:border-ivory transition-colors duration-300"
                            data-testid="final-cta-partner-button"
                        >
                            Become a Partner
                        </Link>
                    </div>
                </Fade>
            </section>
        </>
    );
}
