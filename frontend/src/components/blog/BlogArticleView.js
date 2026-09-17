import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

function formatDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return iso;
    }
}

function resolveMarkdownImages(markdown, contentImages = []) {
    if (!markdown) return '';
    const byId = Object.fromEntries((contentImages || []).filter((i) => i?.id).map((i) => [i.id, i]));
    return markdown.replace(/!\[([^\]]*)\]\(media:([a-zA-Z0-9_-]+)\)/g, (_, alt, id) => {
        const img = byId[id];
        if (!img?.url) return `![${alt}]()`;
        const useAlt = alt || img.alt || '';
        return `![${useAlt}](${img.url})`;
    });
}

/**
 * Shared public + admin preview article body.
 * Markdown only — no heavy WYSIWYG deps.
 */
export default function BlogArticleView({ blog, showMeta = true }) {
    if (!blog) return null;

    const author = blog.author?.name || 'AITH Editorial Team';
    const cover = blog.cover || {};
    const image = cover.image?.url ? cover.image : blog.featuredImage;
    const published = blog.publishedAt;
    const updated = blog.updatedAt;
    const showUpdated =
        published &&
        updated &&
        new Date(updated).getTime() - new Date(published).getTime() > 24 * 60 * 60 * 1000;
    const subtitle = blog.subtitle || cover.deck || blog.excerpt;
    const md = resolveMarkdownImages(blog.contentMarkdown || '', blog.contentImages);

    return (
        <article className="text-graphite" data-testid="blog-article-view">
            {showMeta && (
                <header className="mb-10">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.22em] uppercase text-mute">
                        {blog.category && <span className="text-copper">{blog.category}</span>}
                        {published && (
                            <>
                                <span aria-hidden="true">·</span>
                                <time dateTime={published}>Published {formatDate(published)}</time>
                            </>
                        )}
                        {showUpdated && (
                            <>
                                <span aria-hidden="true">·</span>
                                <time dateTime={updated}>Updated {formatDate(updated)}</time>
                            </>
                        )}
                        {!published && (blog.scheduledAt || updated) && (
                            <>
                                <span aria-hidden="true">·</span>
                                <time dateTime={blog.scheduledAt || updated}>{formatDate(blog.scheduledAt || updated)}</time>
                            </>
                        )}
                        {author && (
                            <>
                                <span aria-hidden="true">·</span>
                                <span>{author}</span>
                            </>
                        )}
                    </div>
                    {(cover.eyebrow || 'TRADE JOURNAL') && (
                        <p className="mt-4 font-mono text-[10px] tracking-[0.28em] uppercase text-copper">
                            {cover.eyebrow || 'TRADE JOURNAL'}
                        </p>
                    )}
                    {blog.title && (
                        <h1 className="mt-3 text-[clamp(1.85rem,4.5vw,3.25rem)] font-extrabold tracking-tight leading-[1.05]">
                            {cover.headline || blog.title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="mt-5 text-base lg:text-lg text-mute leading-relaxed max-w-2xl">{subtitle}</p>
                    )}
                    <p className="mt-4 text-sm text-mute max-w-2xl">
                        Trade and sourcing guidance from the Asian International Trade House editorial team.
                    </p>
                </header>
            )}

            {image?.url && (
                <figure className="mb-12 -mx-1 aspect-[16/9] overflow-hidden bg-bone">
                    <img
                        src={image.url}
                        alt={image.alt || blog.title || ''}
                        className="w-full h-full object-cover"
                        loading="eager"
                        decoding="async"
                        width={1600}
                        height={900}
                    />
                    {(image.caption || image.credit) && (
                        <figcaption className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-mute">
                            {[image.caption, image.credit].filter(Boolean).join(' · ')}
                        </figcaption>
                    )}
                </figure>
            )}

            <div className="blog-prose max-w-[72ch] mx-auto">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                        h2: ({ children }) => (
                            <h2 className="font-serif text-[1.65rem] lg:text-[1.85rem] leading-snug tracking-tight mt-12 mb-4 text-forest">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="font-sans text-lg font-extrabold tracking-tight mt-10 mb-3 text-forest">
                                {children}
                            </h3>
                        ),
                        p: ({ children }) => (
                            <p className="font-sans text-[1.05rem] leading-[1.75] text-graphite/90 mb-5">{children}</p>
                        ),
                        a: ({ href, children }) => (
                            <a
                                href={href}
                                className="text-copper underline underline-offset-2 decoration-copper/40 hover:decoration-copper"
                                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                target={href?.startsWith('http') ? '_blank' : undefined}
                            >
                                {children}
                            </a>
                        ),
                        ul: ({ children }) => (
                            <ul className="list-disc pl-5 mb-5 space-y-2 text-[1.05rem] leading-relaxed">{children}</ul>
                        ),
                        ol: ({ children }) => (
                            <ol className="list-decimal pl-5 mb-5 space-y-2 text-[1.05rem] leading-relaxed">{children}</ol>
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-copper pl-5 my-8 text-mute italic font-serif text-lg">
                                {children}
                            </blockquote>
                        ),
                        code: ({ inline, children }) =>
                            inline ? (
                                <code className="font-mono text-[0.85em] bg-bone px-1.5 py-0.5 text-forest">{children}</code>
                            ) : (
                                <code className="block font-mono text-sm bg-forest text-ivory p-4 overflow-x-auto mb-5">
                                    {children}
                                </code>
                            ),
                        hr: () => <hr className="border-graphite/15 my-10" />,
                        img: ({ src, alt }) => {
                            const meta = (blog.contentImages || []).find((i) => i.url === src);
                            return (
                                <figure className="my-8">
                                    <div className="aspect-[16/10] overflow-hidden bg-bone">
                                        <img
                                            src={src}
                                            alt={alt || meta?.alt || ''}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                            width={1200}
                                            height={750}
                                        />
                                    </div>
                                    {(meta?.caption || meta?.credit) && (
                                        <figcaption className="mt-2 font-mono text-[10px] tracking-[0.16em] uppercase text-mute">
                                            {[meta.caption, meta.credit].filter(Boolean).join(' · ')}
                                        </figcaption>
                                    )}
                                </figure>
                            );
                        },
                        table: ({ children }) => (
                            <div className="overflow-x-auto mb-6">
                                <table className="w-full text-sm border-collapse">{children}</table>
                            </div>
                        ),
                        th: ({ children }) => (
                            <th className="border border-graphite/20 bg-bone px-3 py-2 text-left font-mono text-[10px] tracking-wider uppercase">
                                {children}
                            </th>
                        ),
                        td: ({ children }) => (
                            <td className="border border-graphite/15 px-3 py-2 align-top">{children}</td>
                        ),
                    }}
                >
                    {md}
                </ReactMarkdown>
            </div>

            {Array.isArray(blog.sources) && blog.sources.some((s) => (s.label || s.url || '').trim()) && (
                <aside className="mt-14 pt-8 border-t border-graphite/15 max-w-[72ch] mx-auto">
                    <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper mb-4">References</p>
                    <ul className="space-y-2">
                        {blog.sources
                            .filter((s) => (s.label || s.url || '').trim())
                            .map((s, i) => (
                                <li key={`${s.url || s.label}-${i}`} className="text-sm">
                                    {s.url ? (
                                        <a
                                            href={s.url}
                                            className="text-copper hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {s.label || s.url}
                                        </a>
                                    ) : (
                                        <span>{s.label}</span>
                                    )}
                                </li>
                            ))}
                    </ul>
                </aside>
            )}
        </article>
    );
}
