import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Seo, { breadcrumbJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import SafeImage from '../components/SafeImage';
import { Line, Fade, Tag } from '../components/Reveal';
import { RARE_EARTH_ELEMENTS, MINERALS_HERO_IMAGE, MINERALS_INTRO } from '../data/minerals';
import { getSeoPage } from '../data/seoPages';

/** Rare-earth catalogue: hero -> intro -> 17-element grid -> trade note -> CTA */
export default function Minerals() {
    const seo = getSeoPage('/minerals');

    return (
        <main id="main-content" className="overflow-x-clip">
            <Seo
                title={seo?.title || 'Rare Earth Minerals & Elements | AITH'}
                description={
                    seo?.description ||
                    'Seventeen rare earth elements with core industrial uses - scandium to lutetium - for specialty mineral sourcing programmes.'
                }
                path="/minerals"
                jsonLd={breadcrumbJsonLd([
                    { name: 'Home', path: '/' },
                    { name: 'Products', path: '/products' },
                    { name: 'Minerals', path: '/minerals' },
                ])}
            />

            <PageHero
                kicker={MINERALS_INTRO.kicker}
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Products', to: '/products' },
                    { label: 'Minerals' },
                ]}
                titleLines={seo?.h1Lines || MINERALS_INTRO.titleLines}
                italicLast={seo?.italicLast !== false}
                lead={MINERALS_INTRO.lead}
                primaryCta={{
                    to: '/request-quote?category=minerals',
                    label: 'Request rare earth quote',
                    testId: 'minerals-hero-cta',
                }}
                secondaryCta={{
                    to: '/industries/minerals-metals',
                    label: 'Minerals & metals industry',
                    testId: 'minerals-hero-industry',
                }}
                testId="minerals-hero"
            >
                <SafeImage
                    src={MINERALS_HERO_IMAGE}
                    alt="Rare earth metal sample"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-forest/60" />
            </PageHero>

            {/* Both lines use Manrope bold - keep them visually aligned */}
            <section
                className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-16 sm:py-20 border-b border-graphite/10"
                data-testid="minerals-overview"
            >
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
                    <div className="lg:col-span-7">
                        <Tag index="01" label="Catalogue" />
                        <h2 className="text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8 max-w-3xl">
                            <Line>Seventeen elements.</Line>
                            <Line delay={0.1}>Assay-led trade.</Line>
                        </h2>
                    </div>
                    <Fade delay={0.15} className="lg:col-span-5">
                        <p className="text-sm lg:text-base text-mute leading-relaxed max-w-md">
                            Rare earths are traded on specification - purity, oxide form, particle size and
                            packaging - not on name alone. Each panel below lists the element&apos;s core
                            industrial uses for buyers scoping specialty programmes.
                        </p>
                        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute mt-6">
                            Dusted stone · 17 REEs · Sc → Lu
                        </p>
                    </Fade>
                </div>
            </section>

            <section
                className="bg-bone text-graphite px-5 sm:px-6 lg:px-12 py-20 sm:py-24 lg:py-28"
                data-testid="minerals-grid"
                aria-label="Rare earth element catalogue"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
                    {RARE_EARTH_ELEMENTS.map((el, i) => (
                        <Fade key={el.id} delay={Math.min(i * 0.03, 0.35)} y={18}>
                            <article
                                id={el.id}
                                className="group h-full flex flex-col bg-ivory border border-graphite/12 scroll-mt-28"
                                data-testid={`mineral-card-${el.id}`}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-stone">
                                    <SafeImage
                                        src={el.image}
                                        alt={`${el.name} (${el.symbol}) metal sample`}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                        aspectClass="aspect-[4/3]"
                                    />
                                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
                                        <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-ivory bg-forest/75 px-2 py-0.5">
                                            {el.index}
                                        </span>
                                        <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ivory/90 bg-forest/75 px-2 py-0.5">
                                            Z={el.atomicNumber}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
                                        <p className="font-serif italic text-3xl lg:text-4xl text-ivory leading-none drop-shadow-[0_2px_8px_rgba(23,35,29,0.85)]">
                                            {el.symbol}
                                        </p>
                                        <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ivory bg-forest/75 px-2 py-0.5">
                                            {el.category}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col flex-1 p-4 lg:p-4">
                                    <div className="flex items-baseline justify-between gap-2 border-b border-graphite/10 pb-3">
                                        <h3 className="text-base lg:text-lg font-extrabold tracking-tight uppercase leading-tight">
                                            {el.name}
                                        </h3>
                                        {el.radioactive && (
                                            <span className="shrink-0 font-mono text-[8px] tracking-[0.16em] uppercase text-copper border border-copper/40 px-1.5 py-0.5">
                                                Radioactive
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs lg:text-[13px] text-mute leading-relaxed mt-3">{el.blurb}</p>

                                    <div className="mt-4 flex-1">
                                        <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-copper mb-2.5">
                                            Core uses
                                        </p>
                                        <ul className="space-y-2">
                                            {el.coreUses.map((use) => (
                                                <li
                                                    key={use}
                                                    className="flex gap-2 text-xs lg:text-[13px] text-graphite/85 leading-snug"
                                                >
                                                    <span
                                                        className="mt-1.5 w-1 h-1 shrink-0 bg-stone"
                                                        aria-hidden="true"
                                                    />
                                                    <span>{use}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link
                                        to={`/request-quote?category=minerals&product=${encodeURIComponent(el.name)}`}
                                        className="group/link mt-4 inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] uppercase text-graphite border-b border-graphite/25 pb-1 w-fit hover:text-copper hover:border-copper transition-colors duration-300"
                                        data-testid={`mineral-quote-${el.id}`}
                                    >
                                        Enquire about {el.symbol}
                                        <ArrowRight
                                            size={11}
                                            className="transition-transform duration-300 group-hover/link:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </div>
                            </article>
                        </Fade>
                    ))}
                </div>
            </section>

            <section
                className="bg-stone text-forest px-5 sm:px-6 lg:px-12 py-20 sm:py-24 lg:py-28"
                data-testid="minerals-note"
            >
                <Tag index="02" label="Trade note" />
                <div className="grid lg:grid-cols-12 gap-10 mt-10">
                    <div className="lg:col-span-7">
                        <h2 className="text-[clamp(1.85rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] font-extrabold max-w-2xl">
                            <Line>Specification before</Line>
                            <Line delay={0.1}>freight.</Line>
                        </h2>
                        <Fade delay={0.12}>
                            <p className="text-sm lg:text-base text-forest/75 leading-relaxed mt-6 max-w-xl">
                                Rare earth programmes typically move as oxides, metals or alloys against assay
                                and impurity limits. AITH coordinates commercial sourcing and documentation -
                                we do not claim mine ownership or extraction control.
                            </p>
                        </Fade>
                    </div>
                    <Fade delay={0.18} className="lg:col-span-5 flex flex-col justify-end gap-4">
                        <Link
                            to="/industries/minerals-metals"
                            className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-forest border-b border-forest/30 pb-1 hover:text-copper hover:border-copper transition-colors w-fit"
                            data-testid="minerals-link-industry"
                        >
                            Minerals & metals industry page
                            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            to="/products#minerals"
                            className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-forest border-b border-forest/30 pb-1 hover:text-copper hover:border-copper transition-colors w-fit"
                            data-testid="minerals-link-products"
                        >
                            All product categories
                            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            to="/quality-compliance"
                            className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-forest border-b border-forest/30 pb-1 hover:text-copper hover:border-copper transition-colors w-fit"
                            data-testid="minerals-link-quality"
                        >
                            Quality & compliance
                            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Fade>
                </div>
            </section>

            <section
                className="bg-forest text-ivory px-5 sm:px-6 lg:px-12 py-24 lg:py-32"
                data-testid="minerals-cta"
            >
                <div className="flex flex-wrap items-end justify-between gap-8">
                    <h2 className="text-[clamp(2.2rem,5vw,4.75rem)] leading-[0.95] tracking-[-0.03em] font-extrabold max-w-3xl">
                        <Line>NEED A RARE EARTH</Line>
                        <Line delay={0.12}>
                            <span className="font-serif italic font-normal">SPECIFICATION?</span>
                        </Line>
                    </h2>
                    <Fade delay={0.25}>
                        <Link
                            to="/request-quote?category=minerals&type=sourcing"
                            className="group inline-flex items-center gap-3 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                            data-testid="minerals-cta-button"
                        >
                            Start a sourcing request
                            <ArrowUpRight
                                size={14}
                                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </Link>
                    </Fade>
                </div>
            </section>
        </main>
    );
}
