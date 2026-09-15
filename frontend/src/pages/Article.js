import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Seo, { articleJsonLd, breadcrumbJsonLd } from '../components/Seo';
import { Line, Fade } from '../components/Reveal';
import { ARTICLES, STORIES } from '../data/content';

export default function Article() {
    const { id } = useParams();
    const article = ARTICLES[id];
    const story = STORIES.find((s) => s.id === id);

    if (!article || !story) {
        return (
            <main id="main-content" className="bg-forest text-ivory min-h-screen px-6 lg:px-12 pt-44 pb-24" data-testid="article-not-found">
                <Seo title="Story not found" path={`/insights/${id || ''}`} noIndex />
                <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-ivory/60">AITH / Insights</p>
                <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-extrabold tracking-tight mt-8">STORY NOT FOUND.</h1>
                <Link to="/insights" className="group inline-flex items-center gap-2 mt-10 font-mono text-[11px] tracking-[0.22em] uppercase text-ivory border-b border-ivory/40 pb-1 hover:text-copper hover:border-copper transition-colors" data-testid="article-back-link">
                    <ArrowLeft size={13} /> All Insights
                </Link>
            </main>
        );
    }

    const idx = STORIES.findIndex((s) => s.id === id);
    const next = STORIES[(idx + 1) % STORIES.length];
    const related = STORIES.filter((s) => s.id !== id);

    const articlePath = `/insights/${id}`;

    return (
        <main id="main-content" data-testid="article-page">
            <Seo
                title={article.title}
                description={story.excerpt || article.title}
                path={articlePath}
                image={story.image}
                type="article"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        articleJsonLd({
                            title: article.title,
                            description: story.excerpt || article.title,
                            path: articlePath,
                            image: story.image,
                        }),
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Insights', path: '/insights' },
                            { name: article.title, path: articlePath },
                        ]),
                    ],
                }}
            />
            <section className="bg-forest text-ivory px-6 lg:px-12 pt-44 pb-16 lg:pt-56 lg:pb-20">
                <Fade y={10}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-ivory/60">AITH / Insights</p>
                        <Link to="/insights" className="font-mono text-[10px] tracking-[0.25em] uppercase text-ivory/50 hover:text-ivory transition-colors" data-testid="article-back-link">
                            ← All Insights
                        </Link>
                    </div>
                    <nav aria-label="Breadcrumb" className="mt-4 font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45">
                        <ol className="flex flex-wrap items-center gap-2">
                            <li className="flex items-center gap-2">
                                <Link to="/" className="hover:text-copper transition-colors duration-300">Home</Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <span aria-hidden="true">/</span>
                                <Link to="/insights" className="hover:text-copper transition-colors duration-300">Insights</Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <span aria-hidden="true">/</span>
                                <span aria-current="page">{article.title}</span>
                            </li>
                        </ol>
                    </nav>
                </Fade>
                <h1 className="text-[clamp(2.4rem,5.5vw,5.5rem)] leading-[1.0] tracking-[-0.025em] font-extrabold mt-10 max-w-5xl" data-testid="article-title">
                    <Line delay={0.15}>{article.title.toUpperCase()}</Line>
                </h1>
                <Fade delay={0.35}>
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mt-8">
                        {article.tag} — {article.date} — {article.read}
                    </p>
                </Fade>
            </section>

            <Fade className="bg-forest px-6 lg:px-12 pb-16 lg:pb-20">
                <div className="overflow-hidden h-[38vh] lg:h-[58vh]">
                    <img src={story.image} alt={article.title} className="w-full h-full object-cover" loading="eager" />
                </div>
            </Fade>

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-20 lg:py-28">
                <div className="grid lg:grid-cols-12 gap-10">
                    <Fade className="lg:col-span-2 hidden lg:block">
                        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-mute lg:sticky lg:top-32">
                            TRADE / {article.date}
                            <span className="block h-px w-10 bg-copper mt-4" />
                        </p>
                    </Fade>
                    <div className="lg:col-span-7 lg:col-start-3 max-w-3xl" data-testid="article-body">
                        {article.blocks.map((b, i) => {
                            if (b.t === 'h') {
                                return (
                                    <Fade key={i} y={14}>
                                        <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight mt-14 mb-6">{b.text}</h2>
                                    </Fade>
                                );
                            }
                            if (b.t === 'quote') {
                                return (
                                    <Fade key={i} y={14}>
                                        <blockquote className="border-l-2 border-copper pl-6 lg:pl-8 my-12 font-serif italic text-2xl lg:text-3xl leading-snug text-graphite/85">
                                            {b.text}
                                        </blockquote>
                                    </Fade>
                                );
                            }
                            return (
                                <Fade key={i} y={14}>
                                    <p className={`text-base lg:text-lg leading-relaxed text-graphite/80 mb-7 ${i === 0 ? 'dropcap' : ''}`}>{b.text}</p>
                                </Fade>
                            );
                        })}
                    </div>
                </div>
            </section>

            {related.length > 0 && (
                <section className="bg-bone text-graphite px-6 lg:px-12 py-20 lg:py-28 border-t border-graphite/10" data-testid="article-related-section">
                    <Fade y={10}>
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute">Related Stories</p>
                    </Fade>
                    <div className="grid md:grid-cols-2 gap-10 mt-10">
                        {related.map((s) => (
                            <Link key={s.id} to={`/insights/${s.id}`} className="group block" data-testid={`article-related-${s.id}`}>
                                <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-copper">{s.tag} — {s.read}</p>
                                <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight leading-snug mt-3 group-hover:text-copper transition-colors duration-300">
                                    {s.title}
                                </h3>
                                <span className="inline-flex items-center gap-2 mt-4 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 group-hover:text-copper group-hover:border-copper transition-colors duration-300">
                                    Read story
                                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="bg-bone text-graphite px-6 lg:px-12 py-20 lg:py-28 border-t border-graphite/10" data-testid="article-next-section">
                <Fade y={10}>
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-mute">Next Story</p>
                </Fade>
                <Link to={`/insights/${next.id}`} className="group block mt-6" data-testid="article-next-link">
                    <span className="block text-[clamp(1.8rem,4.5vw,4.2rem)] leading-[1.02] tracking-[-0.02em] font-extrabold group-hover:text-copper transition-colors duration-300 max-w-4xl">
                        {next.title}
                    </span>
                    <span className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 group-hover:text-copper group-hover:border-copper transition-colors duration-300">
                        Continue Reading
                        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                </Link>
            </section>

            <section className="bg-forest text-ivory px-6 lg:px-12 py-20 lg:py-28" data-testid="article-cta">
                <div className="flex flex-wrap items-end justify-between gap-8">
                    <h2 className="text-[clamp(2.2rem,4.5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold">
                        <Line>TRADE WITH</Line>
                        <Line delay={0.12}>
                            <span className="font-serif italic font-normal">CONTEXT.</span>
                        </Line>
                    </h2>
                    <Fade delay={0.25}>
                        <Link
                            to="/request-quote"
                            className="group inline-flex items-center gap-3 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                            data-testid="article-quote-button"
                        >
                            Request a Quote
                            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                        </Link>
                    </Fade>
                </div>
            </section>
        </main>
    );
}
