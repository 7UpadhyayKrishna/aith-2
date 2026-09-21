import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../components/Seo';
import { Line, Fade } from '../components/Reveal';
import Discovery from '../components/home/Discovery';
import FaqAccordion from '../components/FaqAccordion';
import { CATEGORIES, IMG } from '../data/content';
import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';
import { categoryToIndustrySlug } from '../data/industries';

export default function Products() {
    return (
        <main id="main-content">
            <Seo
                title="Products Sourced from India | Healthcare to Textiles"
                description="Healthcare, agriculture, minerals, chemicals and textiles - products, materials and commodities sourced through Asian International Trade House."
                path="/products"
            />
            <section className="relative bg-forest text-ivory overflow-hidden" data-testid="products-hero">
                <img src={IMG.warehouse} alt="Warehouse racking with palletised goods" className="absolute inset-0 w-full h-full object-cover opacity-25" loading="eager" decoding="async" />
                <div className="absolute inset-0 bg-forest/40" />
                <div className="relative z-10 px-6 lg:px-12 pt-44 pb-24 lg:pt-56 lg:pb-32">
                    <Fade y={10}>
                        <nav aria-label="Breadcrumb" className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45 mb-4">
                            <Link to="/" className="hover:text-copper transition-colors">Home</Link>
                            <span className="mx-2">/</span>
                            <span>Products</span>
                        </nav>
                        <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-ivory/60">AITH / Products</p>
                    </Fade>
                    <h1 className="text-[clamp(2.9rem,7.5vw,7.5rem)] leading-[0.94] tracking-[-0.03em] font-extrabold mt-8 max-w-5xl">
                        <Line delay={0.15}>PRODUCTS, MATERIALS</Line>
                        <Line delay={0.28}>
                            <span className="font-serif italic font-normal">& COMMODITIES.</span>
                        </Line>
                    </h1>
                    <Fade delay={0.4}>
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-ivory/45 mt-10">
                            5 Categories - Healthcare / Agriculture / Minerals / Chemicals / Textiles
                        </p>
                    </Fade>
                </div>
            </section>

            <Discovery withShowcase={false} />

            {CATEGORIES.map((c, i) => (
                <section
                    key={c.id}
                    id={c.id}
                    className={`px-6 lg:px-12 py-24 lg:py-32 border-t border-graphite/10 scroll-mt-24 ${i % 2 ? 'bg-bone' : 'bg-ivory'} text-graphite`}
                    data-testid={`category-chapter-${c.id}`}
                >
                    <div className="grid lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-5">
                            <Fade>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-[11px] tracking-[0.3em] text-copper">{c.index}</span>
                                    <span className="w-8 h-8 border border-graphite/20" style={{ backgroundColor: c.tone }} />
                                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-mute">{c.toneName}</span>
                                </div>
                                <h2 className="text-[clamp(2.6rem,5.5vw,5.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold uppercase mt-8">
                                    {c.name}
                                </h2>
                                <p className="text-mute text-sm lg:text-base leading-relaxed mt-6 max-w-md">{c.blurb}</p>
                                <div className="flex flex-wrap gap-4 mt-9">
                                    <Link
                                        to={`/industries/${categoryToIndustrySlug(c.id)}`}
                                        className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-copper border-b border-copper/40 pb-1 hover:border-copper transition-colors duration-300"
                                        data-testid={`chapter-industry-${c.id}`}
                                    >
                                        View {c.name.toLowerCase()} sourcing
                                        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                    {c.id === 'minerals' && (
                                        <Link
                                            to="/minerals"
                                            className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-copper border-b border-copper/40 pb-1 hover:border-copper transition-colors duration-300"
                                            data-testid="chapter-rare-earths"
                                        >
                                            Rare earth elements
                                            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                        </Link>
                                    )}
                                    <Link
                                        to={`/request-quote?category=${c.id}`}
                                        className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                                        data-testid={`chapter-quote-${c.id}`}
                                    >
                                        Request this category
                                        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </Fade>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="overflow-hidden h-56 lg:h-72 mb-10">
                                <img src={c.image} alt={`${c.name} materials`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                            </div>
                            <div className="divide-y divide-graphite/12 border-y border-graphite/12">
                                {c.products.map((p) => {
                                    const isRareEarth = p === 'Rare Earth Elements';
                                    return (
                                    <Link
                                        key={p}
                                        to={isRareEarth ? '/minerals' : `/request-quote?product=${encodeURIComponent(p)}`}
                                        className="group flex items-center justify-between py-5"
                                        data-testid={`product-row-${p.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                    >
                                        <span className="text-xl lg:text-3xl font-extrabold tracking-tight group-hover:text-copper group-hover:translate-x-2 transition-all duration-300">
                                            {p}
                                        </span>
                                        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-mute">
                                            {isRareEarth ? 'View catalogue' : 'Spec on request'}
                                        </span>
                                    </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            <FaqAccordion
                items={getFaqsByIds(FAQ_BY_CONTEXT.products)}
                index="06"
                label="Products FAQ"
                title="Sourcing & specification questions"
                className="bg-bone text-graphite"
                testId="products-faq"
            />

            <section className="bg-forest text-ivory px-6 lg:px-12 py-24 lg:py-32" data-testid="products-cta">
                <div className="flex flex-wrap items-end justify-between gap-8">
                    <h2 className="text-[clamp(2.4rem,5vw,5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold">
                        <Line>SOURCING BEYOND</Line>
                        <Line delay={0.12}>
                            <span className="font-serif italic font-normal">THE CATALOGUE.</span>
                        </Line>
                    </h2>
                    <Fade delay={0.25}>
                        <Link
                            to="/request-quote?type=sourcing"
                            className="group inline-flex items-center gap-3 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                            data-testid="products-sourcing-button"
                        >
                            Start a Sourcing Request
                            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                        </Link>
                    </Fade>
                </div>
            </section>
        </main>
    );
}
