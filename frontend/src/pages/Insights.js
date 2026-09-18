import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../components/Seo';
import { Line, Fade, Tag } from '../components/Reveal';
import { STORIES, RESOURCES } from '../data/content';

export default function Insights() {
    return (
        <main id="main-content" className="overflow-x-clip">
            <Seo
                title="Insights"
                description="Trade insights on commodity markets, documentation and bulk procurement from Asian International Trade House."
                path="/insights"
            />
            <section className="bg-forest text-ivory px-5 sm:px-6 lg:px-12 pt-40 sm:pt-44 pb-20 sm:pb-24 lg:pt-56 lg:pb-32" data-testid="insights-hero">
                <Fade y={10}>
                    <nav aria-label="Breadcrumb" className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45 mb-4">
                        <Link to="/" className="hover:text-copper transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span>Insights</span>
                    </nav>
                    <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-ivory/60">AITH / Insights</p>
                </Fade>
                <h1 className="text-[clamp(2.4rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] font-extrabold mt-8">
                    <Line delay={0.15}>TRADE</Line>
                    <Line delay={0.3}>
                        <span className="font-serif italic font-normal">INSIGHTS.</span>
                    </Line>
                </h1>
                <Fade delay={0.45}>
                    <p className="text-ivory/65 text-sm lg:text-base leading-relaxed mt-10 max-w-xl">
                        Notes on markets, documentation and sourcing — written for buyers and suppliers who move real goods.
                    </p>
                </Fade>
            </section>

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-36" data-testid="insights-stories-section">
                <Tag index="01" label="Stories" />
                <div className="mt-14 lg:mt-20 space-y-20 lg:space-y-28">
                    {STORIES.map((s, i) => (
                        <Fade key={s.id} y={24}>
                            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center" data-testid={`insight-article-${s.id}`}>
                                <div className={`lg:col-span-7 overflow-hidden h-[40vh] lg:h-[62vh] ${i % 2 ? 'lg:order-2' : ''}`}>
                                    <img src={s.image} alt={s.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-editorial-slow ease-editorial" loading="lazy" decoding="async" />
                                </div>
                                <div className="lg:col-span-5 min-w-0">
                                    <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-copper">
                                        {s.tag} — {s.read}
                                    </p>
                                    <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.02] mt-5">{s.title}</h2>
                                    <p className="text-mute text-sm lg:text-base leading-relaxed mt-6 max-w-md">{s.excerpt}</p>
                                    <Link
                                        to={`/insights/${s.id}`}
                                        className="group inline-flex items-center gap-2 mt-8 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                                        data-testid={`read-story-${s.id}`}
                                    >
                                        Read Story
                                        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </Fade>
                    ))}
                </div>
            </section>

            <section id="resources" className="bg-bone text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-36 scroll-mt-24" data-testid="resources-section">
                <Tag index="02" label="Resource Center" />
                <h2 className="text-[clamp(2.2rem,6vw,6rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>KNOWLEDGE FOR</Line>
                    <Line delay={0.12}>
                        <span className="font-serif italic font-normal">BETTER TRADE.</span>
                    </Line>
                </h2>
                <p className="text-mute text-sm max-w-xl mt-6 leading-relaxed">
                    Guides and checklists are shared as part of an active trade conversation — start a request or open the FAQ for immediate answers.
                </p>

                <div className="mt-14 lg:mt-20 divide-y divide-graphite/15 border-y border-graphite/15">
                    {RESOURCES.map((r, i) => (
                        <Fade key={r.id} delay={i * 0.04} y={14}>
                            <div className="grid grid-cols-12 gap-3 items-center py-6 lg:py-8" data-testid={`resource-row-${r.id}`}>
                                <span className="col-span-1 font-mono text-xs tracking-[0.2em] text-copper hidden sm:block">0{i + 1}</span>
                                <h3 className="col-span-8 sm:col-span-6 text-xl lg:text-3xl font-extrabold tracking-tight">{r.name}</h3>
                                <span className="col-span-4 sm:col-span-2 font-mono text-[10px] tracking-[0.25em] uppercase text-mute text-right sm:text-left">{r.meta}</span>
                                {r.id === 'faq' ? (
                                    <Link
                                        to="/faq"
                                        className="col-span-12 sm:col-span-3 justify-self-start sm:justify-self-end font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                                        data-testid={`resource-download-${r.id}`}
                                    >
                                        Open FAQ →
                                    </Link>
                                ) : (
                                    <Link
                                        to="/request-quote"
                                        className="col-span-12 sm:col-span-3 justify-self-start sm:justify-self-end font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                                        data-testid={`resource-download-${r.id}`}
                                    >
                                        Request access →
                                    </Link>
                                )}
                            </div>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="bg-forest text-ivory px-5 sm:px-6 lg:px-12 py-24 lg:py-32" data-testid="insights-cta">
                <div className="flex flex-wrap items-end justify-between gap-8">
                    <h2 className="text-[clamp(2.2rem,5vw,5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold">
                        <Line>READY WHEN</Line>
                        <Line delay={0.12}>
                            <span className="font-serif italic font-normal">YOU ARE.</span>
                        </Line>
                    </h2>
                    <Fade delay={0.25}>
                        <Link
                            to="/request-quote"
                            className="group inline-flex items-center gap-3 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                            data-testid="insights-quote-button"
                        >
                            Request a Quote
                            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                        </Link>
                    </Fade>
                </div>
            </section>
        </main>
    );
}
