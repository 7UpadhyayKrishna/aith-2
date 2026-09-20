import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { Line, Fade, Tag, EASE } from '../Reveal';
import { CATEGORIES, SHOWCASE_PRODUCTS } from '../../data/content';

const ALL_PRODUCTS = CATEGORIES.flatMap((c) => c.products.map((p) => ({ name: p, category: c.name })));

export default function Discovery({ withShowcase = true }) {
    const [cat, setCat] = useState(CATEGORIES[1]);
    const [query, setQuery] = useState('');
    const [hoverImg, setHoverImg] = useState(null);

    const results = query.trim()
        ? ALL_PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
        : null;

    return (
        <>
            <section id="discover" className="bg-bone text-graphite px-6 lg:px-12 py-28 lg:py-40" data-testid="product-discovery-section">
                <Tag index="04" label="Product Discovery" />
                <h2 className="text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>WHAT ARE YOU</Line>
                    <Line delay={0.12}>LOOKING FOR<span className="text-copper">?</span></Line>
                </h2>

                <Fade delay={0.25} className="mt-14 lg:mt-20 max-w-3xl">
                    <div className="flex items-center gap-4 border-b-2 border-graphite/30 focus-within:border-copper transition-colors duration-500">
                        <Search size={22} className="text-graphite/40 shrink-0" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products, materials, commodities..."
                            className="w-full bg-transparent py-5 text-xl lg:text-3xl font-medium placeholder:text-graphite/30 outline-none"
                            aria-label="Search products"
                            data-testid="product-search-input"
                        />
                    </div>
                </Fade>

                {results ? (
                    <div className="mt-12" data-testid="product-search-results">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute mb-4">
                            {results.length} result{results.length === 1 ? '' : 's'} — "{query}"
                        </p>
                        {results.length === 0 ? (
                            <div className="border-t border-graphite/15 py-8">
                                <p className="text-mute text-base max-w-lg">
                                    Not in the catalogue — that doesn't mean we can't source it. Send us the specification.
                                </p>
                                <Link
                                    to="/request-quote?type=sourcing"
                                    className="group inline-flex items-center gap-2 mt-5 font-mono text-[11px] tracking-[0.22em] uppercase text-copper border-b border-copper/50 pb-1"
                                    data-testid="search-sourcing-link"
                                >
                                    Start a sourcing request
                                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </div>
                        ) : (
                            results.map((r) => (
                                <Link
                                    key={r.name}
                                    to={
                                        r.name === 'Rare Earth Elements'
                                            ? '/minerals'
                                            : `/request-quote?product=${encodeURIComponent(r.name)}`
                                    }
                                    className="group flex items-center justify-between border-t border-graphite/15 last:border-b py-5"
                                    data-testid={`search-result-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                >
                                    <span className="text-xl lg:text-2xl font-bold tracking-tight group-hover:text-copper group-hover:translate-x-2 transition-all duration-300">
                                        {r.name}
                                    </span>
                                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-mute">{r.category}</span>
                                </Link>
                            ))
                        )}
                    </div>
                ) : (
                    <>
                        <Fade delay={0.3} className="mt-12 lg:mt-16">
                            <div className="flex flex-wrap gap-x-10 gap-y-4" role="tablist" aria-label="Product categories">
                                {CATEGORIES.map((c) => (
                                    <button
                                        key={c.id}
                                        role="tab"
                                        aria-selected={cat.id === c.id}
                                        onMouseEnter={() => setCat(c)}
                                        onClick={() => setCat(c)}
                                        className={`relative pb-2 text-left transition-colors duration-300 ${cat.id === c.id ? 'text-graphite' : 'text-graphite/35 hover:text-graphite/70'}`}
                                        data-testid={`category-tab-${c.id}`}
                                    >
                                        <span className="font-mono text-[10px] tracking-[0.25em] text-copper block mb-1">{c.index}</span>
                                        <span className="text-lg lg:text-2xl font-extrabold tracking-tight uppercase">{c.name}</span>
                                        <span className={`absolute bottom-0 left-0 h-[2px] bg-copper transition-all duration-500 ${cat.id === c.id ? 'w-full' : 'w-0'}`} />
                                    </button>
                                ))}
                            </div>
                        </Fade>

                        <div className="grid lg:grid-cols-12 gap-8 mt-12 lg:mt-16">
                            <div className="lg:col-span-7 h-[46vh] lg:h-[58vh] overflow-hidden relative">
                                <AnimatePresence mode="popLayout">
                                    <motion.img
                                        key={cat.id}
                                        src={cat.image}
                                        alt={`${cat.name} category`}
                                        initial={{ clipPath: 'inset(0 0 100% 0)', scale: 1.06 }}
                                        animate={{ clipPath: 'inset(0 0 0% 0)', scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.75, ease: EASE }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </AnimatePresence>
                                <span className="absolute bottom-4 left-4 bg-forest text-ivory font-mono text-[9px] tracking-[0.25em] px-3 py-2 z-10 uppercase">
                                    {cat.name} / {cat.index}
                                </span>
                            </div>
                            <div className="lg:col-span-5 flex flex-col justify-between gap-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.45, ease: EASE }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 border border-graphite/20" style={{ backgroundColor: cat.tone }} />
                                            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-mute">{cat.toneName}</span>
                                        </div>
                                        <p className="text-base lg:text-lg leading-relaxed mt-6 max-w-md">{cat.blurb}</p>
                                        <ul className="mt-8 space-y-2">
                                            {cat.products.slice(0, 4).map((p) => (
                                                <li key={p} className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase text-graphite/60">
                                                    <span className="w-1 h-1 bg-copper" /> {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                </AnimatePresence>
                                <Link
                                    to={`/products#${cat.id}`}
                                    className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300 self-start"
                                    data-testid={`explore-category-${cat.id}`}
                                >
                                    Explore Category
                                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {withShowcase && (
                <section className="relative h-[92vh] overflow-hidden bg-forest text-ivory" data-testid="featured-category-section">
                    <AnimatePresence mode="popLayout">
                        <motion.img
                            key={hoverImg || 'default'}
                            src={hoverImg || CATEGORIES[1].image}
                            alt="Agricultural commodity"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: EASE }}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-forest/60" />

                    <div className="relative z-10 h-full flex flex-col justify-between p-6 lg:p-12">
                        <Fade y={10}>
                            <div className="flex justify-between font-mono text-[10px] tracking-[0.3em] uppercase text-ivory/60">
                                <span>Featured Category — 04</span>
                                <span className="hidden md:block">Sector / Agriculture</span>
                            </div>
                        </Fade>
                        <div>
                            <Line>
                                <span className="block font-serif italic text-[clamp(3rem,8.5vw,8.5rem)] leading-[0.95] tracking-[-0.02em]">Agriculture</span>
                            </Line>
                            <Fade delay={0.15}>
                                <p className="font-mono text-[11px] lg:text-xs tracking-[0.35em] uppercase text-terra mt-3">Food & Commodities</p>
                            </Fade>
                            <Fade delay={0.25}>
                                <div className="flex flex-wrap gap-x-8 gap-y-3 mt-10">
                                    {SHOWCASE_PRODUCTS.map((p) => (
                                        <Link
                                            key={p.name}
                                            to={`/request-quote?product=${encodeURIComponent(p.name)}`}
                                            onMouseEnter={() => setHoverImg(p.image)}
                                            onMouseLeave={() => setHoverImg(null)}
                                            className="text-2xl lg:text-4xl font-extrabold tracking-tight uppercase text-ivory/85 hover:text-copper transition-colors duration-300"
                                            data-testid={`showcase-product-${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        >
                                            {p.name}
                                        </Link>
                                    ))}
                                </div>
                            </Fade>
                            <Fade delay={0.35}>
                                <Link
                                    to="/products#agriculture"
                                    className="group inline-flex items-center gap-2 mt-10 font-mono text-[11px] tracking-[0.22em] uppercase text-ivory border-b border-ivory/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                                    data-testid="showcase-explore-category"
                                >
                                    Explore Category
                                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </Fade>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
