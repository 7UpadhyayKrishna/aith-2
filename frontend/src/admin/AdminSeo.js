import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { seoOverview } from '@/services/adminApi';
import { panel, sectionTitle } from './adminUi';
import { RecordHeader } from './AdminRecordPage';

export default function AdminSeo() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPageTitle('SEO Health');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    useEffect(() => {
        seoOverview()
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="font-mono text-[11px] uppercase tracking-widest text-mute">Loading…</p>;
    if (error) return <p className="text-copper text-sm">{error}</p>;

    const health = data.contentHealth || {};
    const editorial = data.editorial || {};

    return (
        <div className="space-y-6" data-testid="admin-seo">
            <RecordHeader
                eyebrow="SEO"
                title="SEO health"
                subtitle="Content readiness without vanity scores. Pillar pages are services and industries; blogs build topical depth."
            />

            <section>
                <h3 className={`${sectionTitle} mb-2`}>Content health</h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                    {[
                        ['Published', health.published ?? data.publishedBlogCount, '/admin/blogs?status=published'],
                        ['Draft', health.draft, '/admin/blogs?status=draft'],
                        ['Scheduled', health.scheduled, '/admin/blogs?status=scheduled'],
                        ['Refresh due', health.refreshDue ?? data.refreshDue, '/admin/blogs?needsRefresh=true'],
                        ['Review queue', health.review ?? editorial.reviewQueue, '/admin/blogs?status=review'],
                    ].map(([label, value, href]) => (
                        <Link key={label} to={href} className={`${panel} px-3 py-3 hover:border-copper/40`}>
                            <p className={sectionTitle}>{label}</p>
                            <p className="mt-1 text-xl font-extrabold tabular-nums">{value ?? '-'}</p>
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <h3 className={`${sectionTitle} mb-2`}>SEO issues</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                        ['Missing metadata', data.missingMetadata, '/admin/blogs?seoIssue=missing-metadata'],
                        ['Missing image alt', data.missingImageAlt, '/admin/blogs?seoIssue=missing-alt'],
                        ['Canonical overrides', data.canonicalOverrides, '/admin/blogs?seoIssue=canonical-override'],
                        ['Noindex published', data.noindexCount, '/admin/blogs?status=published'],
                    ].map(([label, value, href]) => (
                        <Link key={label} to={href} className={`${panel} px-3 py-3 hover:border-copper/40`}>
                            <p className={sectionTitle}>{label}</p>
                            <p className="mt-1 text-xl font-extrabold tabular-nums">{value ?? '-'}</p>
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <h3 className={`${sectionTitle} mb-2`}>Editorial</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        ['Publishing this month', editorial.publishingThisMonth],
                        ['Scheduled next', editorial.scheduledNext],
                        ['Review queue', editorial.reviewQueue],
                    ].map(([label, value]) => (
                        <div key={label} className={`${panel} px-3 py-3`}>
                            <p className={sectionTitle}>{label}</p>
                            <p className="mt-1 text-xl font-extrabold tabular-nums">{value ?? '-'}</p>
                        </div>
                    ))}
                </div>
            </section>

            {(data.orphanCandidates || []).length > 0 && (
                <section className={panel}>
                    <div className="px-3 py-2.5 border-b border-graphite/10">
                        <h3 className={sectionTitle}>Possible orphan posts</h3>
                        <p className="mt-1 text-xs text-mute">
                            Published without featured flag or related articles - ensure discovery via /blogs, related, or pillars.
                        </p>
                    </div>
                    <ul className="divide-y divide-graphite/10">
                        {data.orphanCandidates.map((o) => (
                            <li key={o.blogId} className="px-3 py-2.5 text-sm">
                                <Link to={`/admin/blogs/${o.blogId}`} className="hover:text-copper font-medium">
                                    {o.title || o.slug}
                                </Link>
                                <p className="text-xs text-mute mt-0.5">{o.message}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className={panel}>
                <div className="px-3 py-2.5 border-b border-graphite/10">
                    <h3 className={sectionTitle}>Issue list</h3>
                </div>
                {(data.issues || []).length === 0 ? (
                    <p className="px-3 py-5 text-sm text-mute">No issues flagged.</p>
                ) : (
                    <ul className="divide-y divide-graphite/10 max-h-[28rem] overflow-y-auto">
                        {data.issues.map((issue, i) => (
                            <li key={`${issue.blogId}-${issue.code}-${i}`} className="px-3 py-2.5 flex gap-3 text-sm">
                                <span
                                    className={`font-mono text-[9px] tracking-wider uppercase shrink-0 ${
                                        issue.level === 'ERROR' ? 'text-red-700' : 'text-copper'
                                    }`}
                                >
                                    {issue.level}
                                </span>
                                <div className="min-w-0">
                                    <Link to={`/admin/blogs/${issue.blogId}`} className="font-medium hover:text-copper">
                                        {issue.title || issue.slug}
                                    </Link>
                                    <p className="text-xs text-mute mt-0.5">
                                        {issue.code}: {issue.message}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {data.postPublishChecklist && (
                <section className={panel}>
                    <div className="px-3 py-2.5 border-b border-graphite/10">
                        <h3 className={sectionTitle}>Post-publish checklist</h3>
                    </div>
                    <ol className="px-3 py-3 list-decimal pl-7 space-y-2 text-sm text-mute">
                        {data.postPublishChecklist.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ol>
                </section>
            )}

            {data.links && (
                <section className={`${panel} p-4`}>
                    <h3 className={`${sectionTitle} mb-3`}>External checks</h3>
                    <ul className="space-y-2 text-sm">
                        {Object.entries(data.links).map(([k, href]) => (
                            <li key={k}>
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-copper hover:underline">
                                    {k}: {href}
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
