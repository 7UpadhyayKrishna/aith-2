import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo, { breadcrumbJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import FaqAccordion from '../components/FaqAccordion';
import { Line, Fade, Tag } from '../components/Reveal';
import { CATEGORIES } from '../data/content';
import { getIndustry } from '../data/industries';
import { getFaqsByIds } from '../data/faqs';
import { getSeoPage } from '../data/seoPages';
import NotFound from './NotFound';

function ListBlock({ items }) {
    return (
        <ul className="mt-6 space-y-3">
            {items.map((item) => (
                <li key={item} className="flex gap-3 text-sm lg:text-base text-mute leading-relaxed">
                    <span className="text-copper shrink-0 mt-1.5 w-1.5 h-1.5 bg-copper" aria-hidden="true" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export default function IndustryPage() {
    const { slug } = useParams();
    const page = getIndustry(slug);
    if (!page) return <NotFound />;

    const seo = getSeoPage(`/industries/${page.slug}`);
    const category = CATEGORIES.find((c) => c.id === page.categoryId);

    return (
        <main id="main-content">
            <Seo
                title={seo?.title || `${page.name} Sourcing India`}
                description={seo?.description || page.lead}
                path={`/industries/${page.slug}`}
                jsonLd={breadcrumbJsonLd([
                    { name: 'Home', path: '/' },
                    { name: 'Industries', path: '/industries' },
                    { name: page.name, path: `/industries/${page.slug}` },
                ])}
            />
            <PageHero
                kicker={page.kicker}
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Industries', to: '/industries' },
                    { label: page.name },
                ]}
                titleLines={page.titleLines}
                italicLast={page.italicLast}
                lead={page.lead}
                primaryCta={{ to: '/request-quote', label: 'Discuss a requirement', testId: `industry-cta-${page.slug}` }}
                secondaryCta={{ to: `/products#${page.categoryId}`, label: 'View products', testId: `industry-products-${page.slug}` }}
                testId={`industry-hero-${page.slug}`}
            >
                {category && (
                    <>
                        <img
                            src={category.image}
                            alt={`${page.name} industry`}
                            className="absolute inset-0 w-full h-full object-cover opacity-30"
                            loading="eager"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-forest/55" />
                    </>
                )}
            </PageHero>

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-24 lg:py-32">
                <Tag index="01" label="Industry Overview" />
                <div className="mt-10 max-w-3xl space-y-6">
                    {page.overview.map((p, i) => (
                        <Fade key={i} delay={i * 0.05}>
                            <p className="text-base lg:text-lg text-mute leading-relaxed">{p}</p>
                        </Fade>
                    ))}
                </div>
                {page.caution && (
                    <Fade delay={0.2}>
                        <p className="mt-10 max-w-2xl border-l-2 border-copper pl-5 text-sm text-graphite/80 leading-relaxed" role="note">
                            {page.caution}
                        </p>
                    </Fade>
                )}
            </section>

            <section className="bg-bone text-graphite px-6 lg:px-12 py-24 lg:py-32">
                <Tag index="02" label="Product Areas" />
                <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>Typical product areas.</Line>
                </h2>
                <div className="mt-14 grid md:grid-cols-2 gap-10 lg:gap-14">
                    {page.productAreas.map((pa, i) => (
                        <Fade key={pa.title} delay={i * 0.05}>
                            <p className="font-mono text-[10px] tracking-[0.3em] text-copper mb-3">0{i + 1}</p>
                            <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight">{pa.title}</h3>
                            <p className="text-sm text-mute leading-relaxed mt-3">{pa.body}</p>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-24 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-16">
                    <div>
                        <Tag index="03" label="Buyers" />
                        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-8">Buyer considerations</h2>
                        <ListBlock items={page.buyerConsiderations} />
                    </div>
                    <div>
                        <Tag index="04" label="Suppliers" />
                        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-8">Supplier considerations</h2>
                        <ListBlock items={page.supplierConsiderations} />
                    </div>
                </div>
            </section>

            <section className="bg-sage text-forest px-6 lg:px-12 py-24 lg:py-32">
                <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-forest/50 mb-4">Quality</p>
                        <ListBlock items={page.quality} />
                    </div>
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-forest/50 mb-4">Packaging</p>
                        <ListBlock items={page.packaging} />
                    </div>
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-forest/50 mb-4">Documentation</p>
                        <ListBlock items={page.documentation} />
                    </div>
                </div>
            </section>

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-24 lg:py-32">
                <Tag index="05" label="Shipment & Process" />
                <div className="grid lg:grid-cols-12 gap-10 mt-10">
                    <div className="lg:col-span-5">
                        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Shipment considerations</h2>
                        <ListBlock items={page.shipment} />
                    </div>
                    <div className="lg:col-span-6 lg:col-start-7">
                        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">AITH process</h2>
                        <p className="text-mute leading-relaxed mt-6">{page.processNote}</p>
                        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-copper mt-8 mb-3">Relevant markets</p>
                        <p className="text-sm text-mute">{page.markets.join(' · ')}</p>
                    </div>
                </div>
            </section>

            {page.relatedLinks?.length > 0 && (
                <section className="bg-bone text-graphite px-6 lg:px-12 py-20">
                    <ul className="flex flex-wrap gap-x-8 gap-y-4">
                        {page.relatedLinks.map((r) => (
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
                index="06"
                label={`${page.name} FAQ`}
                title="Questions buyers ask"
                testId={`industry-faq-${page.slug}`}
            />

            <section className="bg-forest text-ivory px-6 lg:px-12 py-24 lg:py-32">
                <div className="flex flex-wrap items-end justify-between gap-8">
                    <h2 className="text-[clamp(2rem,4.5vw,4rem)] leading-[0.95] tracking-[-0.03em] font-extrabold max-w-2xl">
                        <Line>Source {page.name.toLowerCase()}</Line>
                        <Line delay={0.1}>with a clear brief.</Line>
                    </h2>
                    <Link
                        to="/request-quote"
                        className="inline-flex items-center gap-2 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors"
                    >
                        Request a Quote <ArrowRight size={14} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
