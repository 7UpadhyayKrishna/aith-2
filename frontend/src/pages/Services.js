import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import FaqAccordion from '../components/FaqAccordion';
import { Line, Fade, Tag } from '../components/Reveal';
import { CAPABILITIES, IMG } from '../data/content';
import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';
import { SERVICE_SEO_SLUGS } from '../data/seoPages';
import { getServicePage } from '../data/servicePages';

const SERVICE_LINKS = {
    'Global Sourcing': '/global-sourcing-services',
    'Import & Export': '/import-export-services',
    'International Procurement': '/international-procurement',
    'Bulk Trading': '/international-procurement',
    'Supply Chain': '/freight-coordination',
};

const EXTRA = [
    {
        title: 'Sea freight coordination',
        blurb: 'Container and bulk vessel planning with origin stuffing, documentation and destination handoff.',
        to: '/freight-coordination',
        linkLabel: 'Understand freight coordination',
    },
    {
        title: 'Air freight for urgency',
        blurb: 'Time-sensitive parcels and high-value lines when sea schedules cannot meet the window.',
        to: '/freight-coordination',
        linkLabel: 'Compare air and sea paths',
    },
    {
        title: 'Trade documentation',
        blurb: 'Commercial invoice, packing list, certificates of origin and transport documents aligned to the lane.',
        to: '/trade-documentation',
        linkLabel: 'Understand trade documentation',
    },
];

const DEEP_SERVICES = SERVICE_SEO_SLUGS.map((slug) => getServicePage(slug)).filter(Boolean);

export default function Services() {
    return (
        <main id="main-content">
            <Seo
                title="Import Export & Sourcing Services in India"
                description="Global sourcing, import & export, procurement, documentation and freight coordination — structured trade services from Asian International Trade House."
                path="/services"
            />
            <PageHero
                kicker="AITH / Services"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Services' },
                ]}
                titleLines={['SOLUTIONS FOR', 'REAL TRADE.']}
                italicLast
                lead="From supplier discovery to destination delivery — five core capabilities, plus the freight and documentation work that makes a shipment bankable."
                primaryCta={{ to: '/request-quote', label: 'Start a requirement', testId: 'services-quote-cta' }}
                secondaryCta={{ to: '/faq', label: 'Read FAQs', testId: 'services-faq-cta' }}
                testId="services-hero"
            >
                <img
                    src={IMG.cranes}
                    alt="Port cranes representing international logistics"
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                    loading="eager"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-forest/50" />
            </PageHero>

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="services-capabilities">
                <Tag index="01" label="What We Do" />
                <h2 className="text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>FIVE CAPABILITIES.</Line>
                    <Line delay={0.1}>
                        <span className="font-serif italic font-normal">ONE PROCESS.</span>
                    </Line>
                </h2>

                <div className="mt-16 lg:mt-20 divide-y divide-graphite/15 border-y border-graphite/15">
                    {CAPABILITIES.map((c, i) => (
                        <Fade key={c.title} delay={i * 0.04} y={18}>
                            <article
                                className="grid lg:grid-cols-12 gap-6 lg:gap-10 py-10 lg:py-14 items-center"
                                data-testid={`service-row-${c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                            >
                                <span className="lg:col-span-1 font-mono text-xs tracking-[0.25em] text-copper">{c.index}</span>
                                <div className="lg:col-span-4">
                                    <h3 className="text-2xl lg:text-4xl font-extrabold tracking-tight uppercase">{c.title}</h3>
                                    {SERVICE_LINKS[c.title] && (
                                        <Link
                                            to={SERVICE_LINKS[c.title]}
                                            className="group inline-flex items-center gap-2 mt-4 font-mono text-[11px] tracking-[0.2em] uppercase text-copper"
                                        >
                                            Explore in depth
                                            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                        </Link>
                                    )}
                                </div>
                                <p className="lg:col-span-4 text-sm lg:text-base text-mute leading-relaxed">{c.blurb}</p>
                                <div className="lg:col-span-3 overflow-hidden h-36 lg:h-40">
                                    <img
                                        src={c.image.replace(/w=\d+/, 'w=800')}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        aria-hidden="true"
                                    />
                                </div>
                            </article>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="bg-forest text-ivory px-6 lg:px-12 py-24 lg:py-32" data-testid="services-deep-index">
                <Tag index="02" label="Service Guides" dark />
                <h2 className="text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10 max-w-3xl">
                    <Line>Guides for buyers</Line>
                    <Line delay={0.1}>
                        <span className="font-serif italic font-normal">and procurement teams.</span>
                    </Line>
                </h2>
                <ul className="mt-14 grid md:grid-cols-2 gap-x-10 gap-y-8">
                    {DEEP_SERVICES.map((s) => (
                        <li key={s.slug}>
                            <Link
                                to={s.path}
                                className="group block border-t border-ivory/15 pt-6"
                            >
                                <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight uppercase group-hover:text-copper transition-colors">
                                    {s.titleLines[0].replace(/,$/, '')}
                                </h3>
                                <p className="text-sm text-ivory/60 leading-relaxed mt-3 max-w-md">{s.lead}</p>
                                <span className="inline-flex items-center gap-2 mt-4 font-mono text-[10px] tracking-[0.22em] uppercase text-copper">
                                    Read guide
                                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="bg-bone text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="services-freight">
                <Tag index="03" label="Freight & Documents" />
                <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10 max-w-3xl">
                    <Line>SEA. AIR.</Line>
                    <Line delay={0.1}>PAPER WHEN NEEDED.</Line>
                </h2>
                <div className="grid md:grid-cols-3 gap-10 mt-16">
                    {EXTRA.map((e, i) => (
                        <Fade key={e.title} delay={i * 0.08}>
                            <p className="font-mono text-[11px] tracking-[0.3em] text-copper">0{i + 1}</p>
                            <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight mt-4">{e.title}</h3>
                            <p className="text-mute text-sm leading-relaxed mt-4">{e.blurb}</p>
                            <Link
                                to={e.to}
                                className="group inline-flex items-center gap-2 mt-5 font-mono text-[10px] tracking-[0.22em] uppercase text-copper"
                            >
                                {e.linkLabel}
                                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Fade>
                    ))}
                </div>
                <Fade delay={0.2}>
                    <Link
                        to="/markets"
                        className="group inline-flex items-center gap-2 mt-14 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                        data-testid="services-markets-link"
                    >
                        See market regions
                        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </Fade>
            </section>

            <FaqAccordion
                items={getFaqsByIds(FAQ_BY_CONTEXT.services)}
                index="04"
                label="Services FAQ"
                title="Logistics & commercial questions"
                testId="services-faq"
            />

            <section className="bg-forest text-ivory px-6 lg:px-12 py-24 lg:py-32" data-testid="services-cta">
                <div className="flex flex-wrap items-end justify-between gap-8">
                    <h2 className="text-[clamp(2.4rem,5vw,5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold">
                        <Line>HAVE A</Line>
                        <Line delay={0.1}>
                            <span className="font-serif italic font-normal">REQUIREMENT?</span>
                        </Line>
                    </h2>
                    <Fade delay={0.2}>
                        <Link
                            to="/request-quote"
                            className="inline-flex items-center gap-2 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                            data-testid="services-bottom-quote"
                        >
                            Request a Quote <ArrowRight size={14} />
                        </Link>
                    </Fade>
                </div>
            </section>
        </main>
    );
}
