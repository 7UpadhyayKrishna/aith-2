import { Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo, { breadcrumbJsonLd, serviceJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import FaqAccordion from '../components/FaqAccordion';
import { Line, Fade, Tag } from '../components/Reveal';
import { IMG } from '../data/content';
import { getServicePage } from '../data/servicePages';
import { getFaqsByIds } from '../data/faqs';
import { getSeoPage } from '../data/seoPages';
import NotFound from './NotFound';

export default function ServiceSeoPage({ slug }) {
    const page = getServicePage(slug);
    if (!page) return <NotFound />;

    const seo = getSeoPage(page.path);
    const img = IMG[page.heroImageKey] || IMG.cranes;
    const crumbLabel = page.kicker.split('/').pop()?.trim() || 'Service';

    return (
        <main id="main-content">
            <Seo
                title={seo?.title || page.titleLines.join(' ')}
                description={seo?.description || page.lead}
                path={page.path}
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        serviceJsonLd({
                            name: page.titleLines.join(' ').replace(/\.$/, ''),
                            description: page.lead,
                            path: page.path,
                        }),
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Services', path: '/services' },
                            { name: crumbLabel, path: page.path },
                        ]),
                    ],
                }}
            />
            <PageHero
                kicker={page.kicker}
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Services', to: '/services' },
                    { label: crumbLabel },
                ]}
                titleLines={page.titleLines}
                italicLast={page.italicLast}
                lead={page.lead}
                primaryCta={{ to: '/request-quote', label: page.ctaLabel || 'Request a Quote', testId: `seo-service-cta-${page.slug}` }}
                secondaryCta={{ to: '/services', label: 'All services', testId: `seo-service-all-${page.slug}` }}
                testId={`service-seo-hero-${page.slug}`}
            >
                <img
                    src={img}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                    loading="eager"
                    decoding="async"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-forest/50" />
            </PageHero>

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-24 lg:py-32" data-testid={`service-overview-${page.slug}`}>
                <Tag index="01" label="Overview" />
                <div className="mt-10 max-w-3xl space-y-6">
                    {page.overview.map((p, i) => (
                        <Fade key={i} delay={i * 0.05}>
                            <p className="text-base lg:text-lg text-mute leading-relaxed">{p}</p>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="bg-bone text-graphite px-6 lg:px-12 py-24 lg:py-36" data-testid={`service-sections-${page.slug}`}>
                <Tag index="02" label="How It Works" />
                <h2 className="text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10 max-w-3xl">
                    <Line>Process over pitch.</Line>
                </h2>
                <div className="mt-16 divide-y divide-graphite/15 border-y border-graphite/15">
                    {page.sections.map((s, i) => (
                        <Fade key={s.index} delay={i * 0.03} y={16}>
                            <article className="grid lg:grid-cols-12 gap-4 lg:gap-8 py-10 lg:py-12">
                                <span className="lg:col-span-1 font-mono text-xs tracking-[0.25em] text-copper">{s.index}</span>
                                <h3 className="lg:col-span-4 text-xl lg:text-2xl font-extrabold tracking-tight uppercase">{s.title}</h3>
                                <div className="lg:col-span-7 space-y-4">
                                    {s.body.map((p, j) => (
                                        <p key={j} className="text-sm lg:text-base text-mute leading-relaxed">{p}</p>
                                    ))}
                                </div>
                            </article>
                        </Fade>
                    ))}
                </div>
            </section>

            {page.related?.length > 0 && (
                <section className="bg-ivory text-graphite px-6 lg:px-12 py-20 lg:py-28" data-testid={`service-related-${page.slug}`}>
                    <Tag index="03" label="Related" />
                    <h2 className="text-[clamp(1.8rem,4vw,3rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">
                        Continue reading
                    </h2>
                    <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                        {page.related.map((r) => (
                            <li key={r.to}>
                                <Link
                                    to={r.to}
                                    className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-graphite border-b border-graphite/30 pb-1 hover:text-copper hover:border-copper transition-colors"
                                >
                                    {r.label}
                                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <FaqAccordion
                items={getFaqsByIds(page.faqIds || [])}
                index="04"
                label="FAQ"
                title="Common questions"
                testId={`service-faq-${page.slug}`}
            />

            <section className="bg-forest text-ivory px-6 lg:px-12 py-24 lg:py-32">
                <div className="flex flex-wrap items-end justify-between gap-8">
                    <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold max-w-2xl">
                        <Line>Ready to brief</Line>
                        <Line delay={0.1}>
                            <span className="font-serif italic font-normal">a requirement?</span>
                        </Line>
                    </h2>
                    <Fade delay={0.15}>
                        <Link
                            to="/request-quote"
                            className="inline-flex items-center gap-2 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors"
                        >
                            {page.ctaLabel || 'Request a Quote'} <ArrowRight size={14} />
                        </Link>
                    </Fade>
                </div>
            </section>
        </main>
    );
}
