import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo, { orgJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import BrandLogo from '../components/BrandLogo';
import { Line, Fade, Tag } from '../components/Reveal';
import { IMG } from '../data/content';

export default function About() {
    return (
        <main id="main-content">
            <Seo
                title="About"
                description="Asian International Trade House connects products, people and markets - sourcing from Asia into global demand with verified, compliant trade processes."
                path="/about"
                jsonLd={orgJsonLd}
            />
            <PageHero
                kicker="AITH / About"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'About' },
                ]}
                titleLines={['WE CONNECT', 'PRODUCTS, PEOPLE', 'AND MARKETS.']}
                italicLast
                lead="Trade is more than moving products. It is the disciplined connection of origin supply, verified quality and destination demand - coordinated from our New Delhi hub."
                primaryCta={{ to: '/request-quote', label: 'Request a Quote', testId: 'about-quote-cta' }}
                secondaryCta={{ to: '/contact', label: 'Contact us', testId: 'about-contact-cta' }}
                testId="about-hero"
            >
                <img
                    src={IMG.approach}
                    alt="Agricultural warehouse representing AITH origin networks"
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                    loading="eager"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-forest/50" />
            </PageHero>

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="about-story">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    <div className="lg:col-span-5">
                        <Tag index="01" label="Who We Are" />
                        <h2 className="text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                            <Line>TRADE IS</Line>
                            <Line delay={0.1}>
                                <span className="font-serif italic font-normal text-copper">CONNECTION.</span>
                            </Line>
                        </h2>
                        <Fade delay={0.2}>
                            <div className="mt-10">
                                <BrandLogo variant="full" className="h-14 sm:h-16 lg:h-20 w-auto max-w-full" priority />
                            </div>
                        </Fade>
                    </div>
                    <div className="lg:col-span-6 lg:col-start-7 space-y-6">
                        <Fade>
                            <p className="text-mute text-base lg:text-lg leading-relaxed dropcap">
                                Asian International Trade House (AITH) is a multi-category trading house built to source, verify and move goods from Asian origin networks into Middle East, Africa, Europe and North America.
                            </p>
                        </Fade>
                        <Fade delay={0.08}>
                            <p className="text-mute text-sm lg:text-base leading-relaxed">
                                We operate as the commercial bridge between buyers who need reliable specification and suppliers who need disciplined international demand - with documentation, inspection and logistics treated as part of the product, not an afterthought.
                            </p>
                        </Fade>
                        <Fade delay={0.16}>
                            <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-copper mt-8">
                                28°36&apos;N 77°13&apos;E - New Delhi, India
                            </p>
                        </Fade>
                    </div>
                </div>
            </section>

            <section className="bg-bone text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="about-approach">
                <Tag index="02" label="Our Approach" />
                <h2 className="text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10 max-w-4xl">
                    <Line>SOURCE - VERIFY -</Line>
                    <Line delay={0.1}>DELIVER.</Line>
                </h2>
                <div className="grid md:grid-cols-3 gap-10 mt-16 lg:mt-20">
                    {[
                        { t: 'Source', d: 'Map origin capacity across Asia against your specification, volume and compliance needs.' },
                        { t: 'Verify', d: 'Supplier checks, inspection points and documentation before goods leave the warehouse.' },
                        { t: 'Deliver', d: 'Freight, customs coordination and destination handover under clear commercial terms.' },
                    ].map((s, i) => (
                        <Fade key={s.t} delay={i * 0.08}>
                            <p className="font-mono text-[11px] tracking-[0.3em] text-copper">0{i + 1}</p>
                            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight uppercase mt-4">{s.t}</h3>
                            <p className="text-mute text-sm leading-relaxed mt-4">{s.d}</p>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="relative bg-forest text-ivory px-6 lg:px-12 py-28 lg:py-40 overflow-hidden" data-testid="about-cta">
                <img src={IMG.vessel} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" loading="lazy" decoding="async" aria-hidden="true" />
                <div className="absolute inset-0 bg-forest/60" />
                <div className="relative z-10 flex flex-wrap items-end justify-between gap-10">
                    <h2 className="text-[clamp(2.4rem,5vw,5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold max-w-2xl">
                        <Line>READY TO BUILD</Line>
                        <Line delay={0.1}>
                            <span className="font-serif italic font-normal">A TRADE LANE?</span>
                        </Line>
                    </h2>
                    <Fade delay={0.2}>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/services"
                                className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-ivory border-b border-ivory/35 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                                data-testid="about-services-link"
                            >
                                Explore services
                                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                            <Link
                                to="/request-quote"
                                className="inline-flex items-center gap-2 bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                                data-testid="about-cta-quote"
                            >
                                Request a Quote
                            </Link>
                        </div>
                    </Fade>
                </div>
            </section>
        </main>
    );
}
