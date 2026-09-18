import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { listBlogs } from '@/services/adminApi';
import { panel, sectionTitle, statusTone, fmtDate } from './adminUi';

/**
 * Lightweight editorial calendar — not a full PM suite.
 * Cadence guidance: ~3 new articles / month + 1 refresh.
 */
export default function AdminBlogCalendar() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPageTitle('Editorial calendar');
        setHeaderActions(
            <Link
                to="/admin/blogs/new"
                className="inline-flex px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase bg-copper text-ivory"
            >
                + New Blog
            </Link>
        );
        return () => setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await listBlogs({ limit: 50, sort: '-updatedAt' });
                if (!cancelled) setItems(res.items || []);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Failed to load');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const buckets = useMemo(() => {
        const draft = [];
        const review = [];
        const scheduled = [];
        const published = [];
        const refreshDue = [];
        items.forEach((b) => {
            if (b.refreshDue) refreshDue.push(b);
            if (b.status === 'draft') draft.push(b);
            else if (b.status === 'review') review.push(b);
            else if (b.status === 'scheduled') scheduled.push(b);
            else if (b.status === 'published') published.push(b);
        });
        return { draft, review, scheduled, published, refreshDue };
    }, [items]);

    if (loading) {
        return <p className="font-mono text-[11px] uppercase tracking-widest text-mute">Loading…</p>;
    }

    return (
        <div className="space-y-5" data-testid="admin-blog-calendar">
            <div>
                <h2 className="font-serif text-2xl text-forest tracking-tight">Publishing calendar</h2>
                <p className="mt-1 text-sm text-mute max-w-2xl">
                    Recommended cadence: 3 substantial new articles per month + 1 meaningful refresh. Adjust to quality capacity —
                    frequency alone is not an SEO strategy.
                </p>
                <p className="mt-2 font-mono text-[10px] tracking-[0.14em] uppercase text-mute">
                    Monthly mix · Evergreen · Commercial / service · Industry or timely · Refresh
                </p>
            </div>

            {error && (
                <p className="text-sm text-copper" role="alert">
                    {error}
                </p>
            )}

            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3">
                {[
                    ['Draft', buckets.draft, 'draft'],
                    ['In review', buckets.review, 'review'],
                    ['Scheduled', buckets.scheduled, 'scheduled'],
                    ['Published', buckets.published.slice(0, 12), 'published'],
                    ['Refresh due', buckets.refreshDue, null],
                ].map(([title, rows, statusFilter]) => (
                    <section key={title} className={panel}>
                        <div className="px-3 py-2.5 border-b border-graphite/10 flex justify-between items-center">
                            <h3 className={sectionTitle}>{title}</h3>
                            <span className="font-mono text-[10px] text-mute tabular-nums">{rows.length}</span>
                        </div>
                        {statusFilter !== null && (
                            <div className="px-3 py-1.5 border-b border-graphite/8">
                                <Link
                                    to={`/admin/blogs?status=${statusFilter}`}
                                    className="font-mono text-[9px] uppercase tracking-widest text-copper"
                                >
                                    View list
                                </Link>
                            </div>
                        )}
                        {title === 'Refresh due' && (
                            <div className="px-3 py-1.5 border-b border-graphite/8">
                                <Link to="/admin/blogs?needsRefresh=true" className="font-mono text-[9px] uppercase tracking-widest text-copper">
                                    View list
                                </Link>
                            </div>
                        )}
                        <ul className="divide-y divide-graphite/8 max-h-[28rem] overflow-y-auto">
                            {rows.length === 0 && <li className="px-3 py-4 text-xs text-mute">None</li>}
                            {rows.map((b) => (
                                <li key={b.id} className="px-3 py-2.5">
                                    <Link to={`/admin/blogs/${b.id}`} className="text-sm font-medium hover:text-copper line-clamp-2">
                                        {b.title || 'Untitled'}
                                    </Link>
                                    <p className={`mt-1 font-mono text-[10px] uppercase tracking-wider ${statusTone(b.status)}`}>
                                        {b.status}
                                    </p>
                                    <p className="font-mono text-[10px] text-mute mt-0.5">
                                        {fmtDate(b.scheduledAt || b.publishedAt || b.updatedAt)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
