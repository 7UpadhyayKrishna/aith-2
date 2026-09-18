import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '@/components/Seo';
import { Line, Fade, Tag } from '@/components/Reveal';
import { listBlogs } from '@/services/blogApi';
import { BLOG_CATEGORIES } from '@/data/blogCategories';

function fmt(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '';
    }
}

const EMPTY_LIST = { items: [], total: 0, pages: 1, page: 1, limit: 12 };

function parsePage(raw) {
    const n = Number(raw || 1);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function isListItem(b) {
    return b && typeof b === 'object' && b.id && b.slug;
}

export default function Blogs() {
    const [params, setParams] = useSearchParams();
    const category = params.get('category') || '';
    const search = params.get('q') || '';
    const page = parsePage(params.get('page'));

    const [data, setData] = useState(EMPTY_LIST);
    const [featured, setFeatured] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const wantFeatured = page === 1 && !category && !search;
                const listPromise = listBlogs({
                    page,
                    limit: 12,
                    category: category || undefined,
                    search: search || undefined,
                });
                // Featured is best-effort — never fail the archive if it errors.
                const featPromise = wantFeatured
                    ? listBlogs({ featured: true, limit: 1 }).catch(() => EMPTY_LIST)
                    : Promise.resolve(null);

                const [list, feat] = await Promise.all([listPromise, featPromise]);
                if (cancelled) return;

                const items = (Array.isArray(list?.items) ? list.items : []).filter(isListItem);
                setData({
                    items,
                    total: Number(list?.total) || 0,
                    pages: Number(list?.pages) > 0 ? Number(list.pages) : 1,
                    page: Number(list?.page) > 0 ? Number(list.page) : page,
                    limit: Number(list?.limit) > 0 ? Number(list.limit) : 12,
                });

                const featItems = (Array.isArray(feat?.items) ? feat.items : []).filter(isListItem);
                if (featItems[0]) setFeatured(featItems[0]);
                else if (wantFeatured && items[0]) setFeatured(items[0]);
                else if (!wantFeatured) setFeatured(null);
            } catch (err) {
                if (!cancelled) {
                    setData(EMPTY_LIST);
                    setFeatured(null);
                    setError(err.message || 'Unable to load journal');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [page, category, search, retryKey]);

    const items = Array.isArray(data.items) ? data.items.filter(isListItem) : [];
    const gridItems =
        featured && page === 1 && !category && !search
            ? items.filter((b) => b.id !== featured.id)
            : items;

    function setFilter(key, value) {
        const next = new URLSearchParams(params);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        setParams(next);
    }

    const filtered = Boolean(category || search);
    return (
        <main id="main-content" className="overflow-x-clip" data-testid="blogs-page">
            <Seo
                title={filtered ? 'Trade Journal — Filtered' : 'Trade Journal'}
                description="Sourcing, procurement, documentation and trade operations notes from Asian International Trade House."
                path="/blogs"
                noIndex={filtered}
            />

            <section className="bg-forest text-ivory px-5 sm:px-6 lg:px-12 pt-40 sm:pt-44 pb-20 sm:pb-24 lg:pt-56 lg:pb-32">
                <Fade y={10}>
                    <nav aria-label="Breadcrumb" className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45 mb-4">
                        <Link to="/" className="hover:text-copper transition-colors">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                        <span>Blogs</span>
                    </nav>
                    <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-ivory/60">AITH / Journal</p>
                </Fade>
                <h1 className="text-[clamp(2.4rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] font-extrabold mt-8">
                    <Line delay={0.15}>TRADE</Line>
                    <Line delay={0.3}>
                        <span className="font-serif italic font-normal">JOURNAL.</span>
                    </Line>
                </h1>
                <Fade delay={0.45}>
                    <p className="text-ivory/65 text-sm lg:text-base leading-relaxed mt-10 max-w-xl">
                        Practical notes on sourcing, documentation and moving goods — written for buyers and operators.
                    </p>
                </Fade>
            </section>

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-10 border-b border-graphite/10">
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        type="button"
                        onClick={() => setFilter('category', '')}
                        className={`font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-2 border ${
                            !category ? 'border-forest bg-forest text-ivory' : 'border-graphite/20 hover:border-copper'
                        }`}
                    >
                        All
                    </button>
                    {BLOG_CATEGORIES.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setFilter('category', c)}
                            className={`font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-2 border ${
                                category === c
                                    ? 'border-forest bg-forest text-ivory'
                                    : 'border-graphite/20 hover:border-copper'
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <div className="mt-4 max-w-md">
                    <label htmlFor="blog-q" className="sr-only">
                        Search journal
                    </label>
                    <input
                        id="blog-q"
                        defaultValue={search}
                        placeholder="Search titles and excerpts…"
                        className="w-full border border-graphite/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-copper"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') setFilter('q', e.target.value.trim());
                        }}
                    />
                </div>
            </section>

            {error && (
                <section
                    className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-20 lg:py-28"
                    role="alert"
                    data-testid="blogs-unavailable"
                >
                    <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-copper">Journal</p>
                    <h2 className="mt-4 text-2xl lg:text-4xl font-extrabold tracking-tight">
                        Articles are temporarily unavailable.
                    </h2>
                    <p className="mt-4 text-mute text-sm max-w-md leading-relaxed">
                        We could not load the trade journal right now. Please try again, or return home.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <button
                            type="button"
                            onClick={() => setRetryKey((k) => k + 1)}
                            className="inline-flex items-center bg-forest text-ivory px-5 py-3 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-copper transition-colors"
                        >
                            Retry
                        </button>
                        <Link
                            to="/"
                            className="inline-flex items-center font-mono text-[11px] tracking-[0.22em] uppercase border-b border-graphite/35 pb-1 hover:text-copper hover:border-copper"
                        >
                            Return Home
                        </Link>
                    </div>
                </section>
            )}

            {loading && (
                <p className="px-5 lg:px-12 py-24 font-mono text-[11px] tracking-[0.3em] uppercase text-mute">
                    Loading…
                </p>
            )}

            {!loading && !error && featured && page === 1 && !category && !search && (
                <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-16 lg:py-24" data-testid="blogs-featured">
                    <Tag index="01" label="Featured" />
                    <Fade y={20} className="mt-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        <div className="lg:col-span-7 overflow-hidden h-[36vh] lg:h-[52vh] bg-bone">
                            {(featured.cover?.image?.url || featured.featuredImage?.url) ? (
                                <img
                                    src={featured.cover?.image?.url || featured.featuredImage.url}
                                    alt={featured.cover?.image?.alt || featured.featuredImage?.alt || featured.title}
                                    className="w-full h-full object-cover"
                                    width={1600}
                                    height={900}
                                    loading="eager"
                                    decoding="async"
                                />
                            ) : (
                                <div className="w-full h-full bg-forest/10" />
                            )}
                        </div>
                        <div className="lg:col-span-5 min-w-0">
                            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-copper">
                                {featured.category}
                                {featured.publishedAt ? ` — ${fmt(featured.publishedAt)}` : ''}
                            </p>
                            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.02] mt-5">
                                {featured.title}
                            </h2>
                            <p className="text-mute text-sm lg:text-base leading-relaxed mt-6 max-w-md">
                                {featured.excerpt}
                            </p>
                            <Link
                                to={`/blogs/${featured.slug}`}
                                className="group inline-flex items-center gap-2 mt-8 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 hover:text-copper hover:border-copper transition-colors"
                            >
                                Read story
                                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </Fade>
                </section>
            )}

            {!loading && !error && (
                <section className="bg-bone text-graphite px-5 sm:px-6 lg:px-12 py-16 lg:py-24">
                    <Tag index={featured && page === 1 ? '02' : '01'} label="Latest" />
                    {gridItems.length === 0 ? (
                        <p className="mt-10 text-mute text-sm">No posts match these filters yet.</p>
                    ) : (
                        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                            {gridItems.map((b) => (
                                <Fade key={b.id} y={16}>
                                    <article>
                                        <Link to={`/blogs/${b.slug}`} className="block group">
                                            <div className="aspect-[16/10] overflow-hidden bg-forest/5 mb-5">
                                                {(b.cover?.image?.url || b.featuredImage?.url) ? (
                                                    <img
                                                        src={b.cover?.image?.url || b.featuredImage.url}
                                                        alt={b.cover?.image?.alt || b.featuredImage?.alt || b.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                        width={960}
                                                        height={600}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : null}
                                            </div>
                                            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">
                                                {b.category}
                                                {b.publishedAt ? ` — ${fmt(b.publishedAt)}` : ''}
                                            </p>
                                            <h3 className="mt-3 text-xl font-extrabold tracking-tight leading-snug group-hover:text-copper transition-colors">
                                                {b.title}
                                            </h3>
                                            <p className="mt-3 text-sm text-mute leading-relaxed line-clamp-3">
                                                {b.excerpt}
                                            </p>
                                        </Link>
                                    </article>
                                </Fade>
                            ))}
                        </div>
                    )}

                    {data.pages > 1 && (
                        <div className="mt-14 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-mute">
                            <span>
                                Page {page} / {data.pages}
                            </span>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    className="border border-graphite/25 px-3 py-2 disabled:opacity-40 hover:border-copper"
                                    onClick={() => setFilter('page', String(page - 1))}
                                >
                                    Prev
                                </button>
                                <button
                                    type="button"
                                    disabled={page >= data.pages}
                                    className="border border-graphite/25 px-3 py-2 disabled:opacity-40 hover:border-copper"
                                    onClick={() => setFilter('page', String(page + 1))}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}

            <section className="bg-forest text-ivory px-5 sm:px-6 lg:px-12 py-20 lg:py-28">
                <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-extrabold tracking-tight leading-[1.05]">
                    Need sourcing support?
                </h2>
                <p className="mt-5 text-ivory/65 max-w-lg text-sm leading-relaxed">
                    Share a requirement and we will respond with a structured procurement conversation.
                </p>
                <Link
                    to="/request-quote"
                    className="inline-flex items-center gap-2 mt-8 bg-copper text-ivory px-5 py-3 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors"
                >
                    Request quote <ArrowRight size={14} />
                </Link>
            </section>
        </main>
    );
}
