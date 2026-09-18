import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo, { blogPostingJsonLd, breadcrumbJsonLd } from '@/components/Seo';
import BlogArticleView from '@/components/blog/BlogArticleView';
import { Fade } from '@/components/Reveal';
import { getBlogBySlug, listBlogs } from '@/services/blogApi';
import { BRAND } from '@/config/site';

export default function BlogPost() {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [related, setRelated] = useState([]);
    const [redirect, setRedirect] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            setRedirect(null);
            try {
                const data = await getBlogBySlug(slug);
                if (cancelled) return;
                if (data.redirect && data.toSlug) {
                    setRedirect(data.path || `/blogs/${data.toSlug}`);
                    return;
                }
                setBlog(data);
                const cat = data.category;
                try {
                    const more = await listBlogs({ category: cat, limit: 4 });
                    if (!cancelled) {
                        setRelated((more.items || []).filter((b) => b.slug !== data.slug).slice(0, 3));
                    }
                } catch {
                    if (!cancelled) setRelated([]);
                }
            } catch (err) {
                if (!cancelled) {
                    setBlog(null);
                    setError(err.status === 404 ? 'notfound' : err.message || 'Failed to load');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (redirect) return <Navigate to={redirect} replace />;

    if (loading) {
        return (
            <main id="main-content" className="bg-ivory min-h-[50vh] flex items-center justify-center">
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-mute">Loading…</p>
            </main>
        );
    }

    if (error === 'notfound' || !blog) {
        return (
            <main id="main-content" className="bg-forest text-ivory min-h-screen px-6 lg:px-12 pt-44 pb-24">
                <Seo title="Post not found" path={`/blogs/${slug || ''}`} noIndex />
                <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-ivory/60">AITH / Journal</p>
                <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-extrabold tracking-tight mt-8">POST NOT FOUND.</h1>
                <Link
                    to="/blogs"
                    className="inline-flex mt-10 font-mono text-[11px] tracking-[0.22em] uppercase text-ivory border-b border-ivory/40 pb-1 hover:text-copper hover:border-copper"
                >
                    ← All journal posts
                </Link>
            </main>
        );
    }

    const path = `/blogs/${blog.slug}`;
    const coverUrl = blog.cover?.image?.url || blog.featuredImage?.url;
    const ogOverride = typeof blog.seo?.ogImage === 'string' ? blog.seo.ogImage : blog.seo?.ogImage?.url;
    const image = ogOverride || coverUrl || BRAND.ogImage;
    const description = blog.seo?.metaDescription || blog.excerpt || blog.subtitle || blog.title;
    const title = blog.seo?.metaTitle || blog.title;
    const customCanonical = blog.seo?.canonicalUrl || null;

    return (
        <main id="main-content" data-testid="blog-post-page">
            <Seo
                title={title}
                description={description}
                path={path}
                image={image}
                type="article"
                noIndex={blog.seo?.index === false}
                canonical={customCanonical || undefined}
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        blogPostingJsonLd({
                            title: blog.title,
                            description,
                            path,
                            image,
                            datePublished: blog.publishedAt,
                            dateModified: blog.updatedAt || blog.publishedAt,
                            authorName: blog.author?.name,
                            authorType: blog.author?.type,
                        }),
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Blogs', path: '/blogs' },
                            { name: blog.title, path },
                        ]),
                    ],
                }}
            />

            <section className="bg-forest text-ivory px-5 sm:px-6 lg:px-12 pt-40 sm:pt-44 pb-12 lg:pt-52 lg:pb-16">
                <Fade y={8}>
                    <nav aria-label="Breadcrumb" className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45">
                        <ol className="flex flex-wrap items-center gap-2">
                            <li>
                                <Link to="/" className="hover:text-copper transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <span aria-hidden="true">/</span>
                                <Link to="/blogs" className="hover:text-copper transition-colors">
                                    Blogs
                                </Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <span aria-hidden="true">/</span>
                                <span aria-current="page" className="text-ivory/70 truncate max-w-[14rem] sm:max-w-md">
                                    {blog.title}
                                </span>
                            </li>
                        </ol>
                    </nav>
                </Fade>
            </section>

            <section className="bg-ivory px-5 sm:px-6 lg:px-12 py-14 lg:py-20">
                <BlogArticleView blog={blog} />
            </section>

            {related.length > 0 && (
                <section className="bg-bone px-5 sm:px-6 lg:px-12 py-16 lg:py-24">
                    <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper">Related</p>
                    <div className="mt-8 grid sm:grid-cols-3 gap-8">
                        {related.map((b) => (
                            <Link key={b.id} to={`/blogs/${b.slug}`} className="group block">
                                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">{b.category}</p>
                                <h2 className="mt-2 text-lg font-extrabold tracking-tight group-hover:text-copper transition-colors">
                                    {b.title}
                                </h2>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="bg-forest text-ivory px-5 sm:px-6 lg:px-12 py-16 lg:py-20">
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Ready to source?</h2>
                <p className="mt-3 text-ivory/65 text-sm max-w-md">
                    Tell us what you need to move — product, volume, and destination.
                </p>
                <Link
                    to="/request-quote"
                    className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-[0.22em] uppercase text-ivory border-b border-ivory/40 pb-1 hover:text-copper hover:border-copper"
                >
                    Request quote <ArrowRight size={13} />
                </Link>
            </section>
        </main>
    );
}
