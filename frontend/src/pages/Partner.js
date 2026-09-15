import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Seo, { breadcrumbJsonLd, orgJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import FaqAccordion from '../components/FaqAccordion';
import { Fade, Line, Tag } from '../components/Reveal';
import { PARTNERSHIPS, CATEGORIES } from '../data/content';
import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';

const EXPECTATIONS = [
    {
        index: '01',
        title: 'Product capability',
        blurb: 'Clear specifications, consistent grade and capacity that can support commercial volumes — not sample-only production.',
    },
    {
        index: '02',
        title: 'Documentation discipline',
        blurb: 'Willingness to support invoices, packing lists, certificates of origin and product-specific certificates as destination markets require.',
    },
    {
        index: '03',
        title: 'Quality cooperation',
        blurb: 'Openness to inspection, sampling and corrective action when goods must match an agreed specification.',
    },
    {
        index: '04',
        title: 'Export readiness',
        blurb: 'Experience — or readiness to build it — with packaging, labelling and lead times suited to international lanes.',
    },
];

const WORKFLOW = [
    { index: '01', title: 'Introduce', blurb: 'Share product range, capacity, certifications and export markets of interest.' },
    { index: '02', title: 'Review', blurb: 'We assess fit against active and recurring buyer demand and compliance expectations.' },
    { index: '03', title: 'Qualify', blurb: 'Where relevant, we request samples, audits or documentation before commercial engagement.' },
    { index: '04', title: 'Engage', blurb: 'Matched opportunities move into quotation, contracting and shipment coordination.' },
];

export default function Partner() {
    return (
        <main id="main-content">
            <Seo
                title="Partner With AITH"
                description="Become a supplier, manufacturer or distribution partner with Asian International Trade House — market access, quality expectations and partnership workflow."
                path="/partner"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        orgJsonLd,
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Partner', path: '/partner' },
                        ]),
                    ],
                }}
            />
            <PageHero
                kicker="AITH / Partner"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Partner' },
                ]}
                titleLines={['BUILD TRADE', 'TOGETHER.']}
                italicLast
                lead="AITH partners with manufacturers, exporters and distributors who want structured access to international demand — with clear expectations on quality, documentation and delivery."
                primaryCta={{ to: '/request-quote?type=partner', label: 'Partnership Enquiry', testId: 'partner-enquiry-cta' }}
                secondaryCta={{ to: '/contact', label: 'Talk to us', testId: 'partner-contact-cta' }}
                testId="partner-hero"
            />

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="partner-who">
                <Tag index="01" label="Who We Partner With" />
                <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10 max-w-4xl">
                    <Line>Suppliers. Manufacturers.</Line>
                    <Line delay={0.1}>Exporters. Distributors.</Line>
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mt-16 lg:mt-20">
                    {PARTNERSHIPS.map((p, i) => (
                        <Fade key={p.id} delay={i * 0.08}>
                            <Link
                                to={`/request-quote?type=partner&role=${p.id}`}
                                className="group block border-t border-graphite/15 pt-8 hover:border-copper transition-colors duration-300"
                                data-testid={`partner-role-${p.id}`}
                            >
                                <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper mb-4">
                                    {String(i + 1).padStart(2, '0')}
                                </p>
                                <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight uppercase">{p.title}</h3>
                                <p className="text-sm text-mute leading-relaxed mt-4">{p.blurb}</p>
                                <span className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-graphite/60 group-hover:text-copper transition-colors">
                                    Start enquiry <ArrowRight size={13} aria-hidden="true" />
                                </span>
                            </Link>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="bg-bone text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="partner-categories">
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5">
                        <Tag index="02" label="Product Categories" />
                        <h2 className="text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">
                            Categories we actively trade
                        </h2>
                        <Fade delay={0.15}>
                            <p className="text-mute text-sm leading-relaxed mt-6 max-w-md">
                                Partnership interest is strongest where capacity aligns with Healthcare, Agriculture, Minerals, Chemicals and Textiles. Custom categories are evaluated when the brief is clear.
                            </p>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 mt-8 font-mono text-[11px] tracking-[0.22em] uppercase text-copper border-b border-copper/40 pb-1 hover:border-copper"
                            >
                                Explore products <ArrowUpRight size={13} aria-hidden="true" />
                            </Link>
                        </Fade>
                    </div>
                    <ul className="lg:col-span-6 lg:col-start-7 space-y-0 divide-y divide-graphite/15 border-y border-graphite/15">
                        {CATEGORIES.map((c) => (
                            <li key={c.id} className="py-5 flex items-baseline justify-between gap-4">
                                <span className="font-mono text-[11px] tracking-[0.25em] text-copper">{c.index}</span>
                                <span className="flex-1 text-lg lg:text-xl font-extrabold tracking-tight uppercase">{c.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="partner-expectations">
                <Tag index="03" label="Expectations" />
                <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>What we look for</Line>
                </h2>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-12 mt-16">
                    {EXPECTATIONS.map((e, i) => (
                        <Fade key={e.index} delay={i * 0.06}>
                            <p className="font-mono text-[11px] tracking-[0.28em] text-copper">{e.index}</p>
                            <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight mt-3">{e.title}</h3>
                            <p className="text-sm text-mute leading-relaxed mt-3 max-w-md">{e.blurb}</p>
                        </Fade>
                    ))}
                </div>
                <Fade delay={0.2}>
                    <p className="text-sm text-mute mt-14 max-w-2xl">
                        Requirements are assessed according to product, destination and buyer needs. We do not claim certifications on behalf of partners — documentation is verified case by case.
                    </p>
                </Fade>
            </section>

            <section className="bg-forest text-ivory px-6 lg:px-12 py-28 lg:py-36" data-testid="partner-workflow">
                <Tag index="04" label="Workflow" dark />
                <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>How partnership starts</Line>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mt-16 lg:mt-20">
                    {WORKFLOW.map((w, i) => (
                        <Fade key={w.index} delay={i * 0.07}>
                            <p className="font-mono text-[11px] tracking-[0.28em] text-copper">{w.index}</p>
                            <h3 className="text-xl font-extrabold tracking-tight uppercase mt-4">{w.title}</h3>
                            <p className="text-sm text-ivory/65 leading-relaxed mt-3">{w.blurb}</p>
                        </Fade>
                    ))}
                </div>
                <Fade delay={0.25}>
                    <Link
                        to="/request-quote?type=partner"
                        className="inline-flex items-center gap-2 mt-16 bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors"
                        data-testid="partner-workflow-cta"
                    >
                        Become a partner <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                </Fade>
            </section>

            <FaqAccordion
                items={getFaqsByIds(FAQ_BY_CONTEXT.partner || ['become-supplier', 'who-we-serve', 'categories', 'quality-process', 'long-term'])}
                index="05"
                label="Partner FAQ"
                title="Partnership questions"
                className="bg-ivory text-graphite"
                testId="partner-faq"
            />
        </main>
    );
}
