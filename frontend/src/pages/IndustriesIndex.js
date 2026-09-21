import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo, { breadcrumbJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import { Line, Fade, Tag } from '../components/Reveal';
import { CATEGORIES } from '../data/content';
import { INDUSTRY_LIST } from '../data/industries';
import { getSeoPage } from '../data/seoPages';

export default function IndustriesIndex() {
    const seo = getSeoPage('/industries');

    return (
        <main id="main-content">
            <Seo
                title={seo?.title || 'Industries We Source For'}
                description={seo?.description || 'Healthcare, agriculture, minerals, chemicals and textiles - industry sourcing coordinated from India and Asia.'}
                path="/industries"
                jsonLd={breadcrumbJsonLd([
                    { name: 'Home', path: '/' },
                    { name: 'Industries', path: '/industries' },
                ])}
            />
            <PageHero
                kicker="AITH / Industries"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Industries' },
                ]}
                titleLines={seo?.h1Lines || ['ESSENTIAL', 'INDUSTRIES.']}
                italicLast={seo?.italicLast !== false}
                lead="Five industry chapters where specification, documentation and origin coordination matter as much as price."
                primaryCta={{ to: '/request-quote', label: 'Discuss a requirement', testId: 'industries-index-cta' }}
                secondaryCta={{ to: '/products', label: 'Browse products', testId: 'industries-index-products' }}
                testId="industries-index-hero"
            />

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-24 lg:py-36">
                <Tag index="01" label="Index" />
                <h2 className="text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>Choose an industry.</Line>
                </h2>
                <div className="mt-16 divide-y divide-graphite/15 border-y border-graphite/15">
                    {INDUSTRY_LIST.map((ind, i) => {
                        const cat = CATEGORIES.find((c) => c.id === ind.categoryId);
                        return (
                            <Fade key={ind.slug} delay={i * 0.04} y={16}>
                                <Link
                                    to={`/industries/${ind.slug}`}
                                    className="group grid lg:grid-cols-12 gap-6 lg:gap-10 py-10 lg:py-14 items-center"
                                    data-testid={`industry-index-${ind.slug}`}
                                >
                                    <span className="lg:col-span-1 font-mono text-xs tracking-[0.25em] text-copper">0{i + 1}</span>
                                    <div className="lg:col-span-4">
                                        <h3 className="text-2xl lg:text-4xl font-extrabold tracking-tight uppercase group-hover:translate-x-1 transition-transform duration-500">
                                            {ind.name}
                                        </h3>
                                    </div>
                                    <p className="lg:col-span-5 text-sm lg:text-base text-mute leading-relaxed">
                                        {ind.lead}
                                    </p>
                                    <div className="lg:col-span-2 flex lg:justify-end items-center gap-3">
                                        {cat && (
                                            <span className="hidden lg:block w-20 h-14 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                                                <img src={cat.image} alt="" className="w-full h-full object-cover" loading="lazy" aria-hidden="true" />
                                            </span>
                                        )}
                                        <ArrowRight
                                            size={22}
                                            className="text-mute group-hover:text-copper group-hover:translate-x-1 group-hover:-rotate-45 transition-all duration-300"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </Link>
                            </Fade>
                        );
                    })}
                </div>
                <Fade delay={0.2}>
                    <div className="mt-14 flex flex-wrap gap-6">
                        <Link
                            to="/global-sourcing-services"
                            className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/30 pb-1 hover:text-copper hover:border-copper"
                        >
                            Explore global sourcing
                            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            to="/supplier-sourcing"
                            className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/30 pb-1 hover:text-copper hover:border-copper"
                        >
                            Supplier sourcing in India
                            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </Fade>
            </section>
        </main>
    );
}
