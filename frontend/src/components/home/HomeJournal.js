import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Line, Fade, Tag } from '../Reveal';
import { listBlogs } from '@/services/blogApi';

function fmt(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return '';
    }
}

/** Restrained homepage teaser — latest published journal posts. Hidden if API unavailable. */
export default function HomeJournal() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        let cancelled = false;
        listBlogs({ limit: 3 })
            .then((data) => {
                if (!cancelled) {
                    const next = Array.isArray(data?.items) ? data.items : [];
                    setItems(next.filter((b) => b && b.id && b.slug));
                }
            })
            .catch(() => {
                if (!cancelled) setItems([]);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!items.length) return null;

    return (
        <section className="bg-bone text-graphite px-6 lg:px-12 py-24 lg:py-32" data-testid="home-journal-section">
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <Tag index="10b" label="Journal" />
                    <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">
                        <Line>FROM THE</Line>
                        <Line delay={0.1}>
                            <span className="font-serif italic font-normal">JOURNAL.</span>
                        </Line>
                    </h2>
                </div>
                <Fade delay={0.15}>
                    <Link
                        to="/blogs"
                        className="group inline-flex items-center gap-2 pb-3 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 hover:text-copper hover:border-copper transition-colors duration-300"
                    >
                        All posts
                        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                </Fade>
            </div>
            <div className="grid md:grid-cols-3 gap-10 mt-14">
                {items.map((b, i) => (
                    <Fade key={b.id} delay={i * 0.08}>
                        <Link to={`/blogs/${b.slug}`} className="group block">
                            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-copper">
                                {b.category}
                                {b.publishedAt ? ` — ${fmt(b.publishedAt)}` : ''}
                            </p>
                            <h3 className="text-lg lg:text-xl font-extrabold tracking-tight leading-snug mt-3 group-hover:text-copper transition-colors">
                                {b.title}
                            </h3>
                            <p className="text-sm text-mute mt-3 leading-relaxed line-clamp-3">{b.excerpt}</p>
                        </Link>
                    </Fade>
                ))}
            </div>
        </section>
    );
}
