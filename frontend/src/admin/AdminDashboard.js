import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { dashboard } from '@/services/adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { EmptyState, ErrorBanner, LoadingBlock, btn, btnPrimary, fmtDateTime, panel, sectionTitle, statusTone } from './adminUi';

function Metric({ label, value, to }) {
    const inner = (
        <>
            <p className={sectionTitle}>{label}</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-forest tabular-nums">{value ?? '-'}</p>
        </>
    );
    const cls = `${panel} px-3 py-3 hover:border-copper/40 transition-colors duration-micro`;
    return to ? (
        <Link to={to} className={`block ${cls}`}>
            {inner}
        </Link>
    ) : (
        <div className={cls}>{inner}</div>
    );
}

function MiniTable({ title, rows, columns, empty }) {
    return (
        <section className={panel}>
            <div className="px-3 py-2.5 border-b border-graphite/10 flex items-center justify-between">
                <h2 className={sectionTitle}>{title}</h2>
            </div>
            {(!rows || rows.length === 0) && (
                <div className="px-3 py-6 text-center">
                    <p className="text-sm text-mute">{empty || 'Nothing yet.'}</p>
                </div>
            )}
            {rows?.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-graphite/10 text-left font-mono text-[9px] tracking-[0.16em] uppercase text-mute">
                                {columns.map((c) => (
                                    <th key={c.key} className="px-3 py-2 font-normal">
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id || row.slug} className="border-b border-graphite/8 hover:bg-bone/40 transition-colors">
                                    {columns.map((c) => (
                                        <td key={c.key} className="px-3 py-2 align-top">
                                            {c.render ? c.render(row) : row[c.key] ?? '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default function AdminDashboard() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const { user } = useAdminAuth();
    const isAdmin = user?.role === 'admin';
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPageTitle('Dashboard');
        setHeaderActions(
            <Link to="/admin/blogs/new" className={`${btnPrimary} sm:hidden`}>
                + New Blog
            </Link>
        );
        return () => setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const d = await dashboard();
                if (!cancelled) setData(d);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Failed to load dashboard');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) return <LoadingBlock label="Loading dashboard…" />;
    if (error) return <ErrorBanner>{error}</ErrorBanner>;

    const s = data?.summary || {};
    const pipe = data?.pipeline || {};
    const ops = data?.operations || {};
    const attention = data?.attentionNeeded || [];
    const hasContent = (s.publishedBlogs || 0) + (s.draftBlogs || 0) + (s.scheduledBlogs || 0) > 0;

    return (
        <div className="space-y-6" data-testid="admin-dashboard">
            <div>
                <p className="font-serif text-2xl text-forest tracking-tight">Editorial operations</p>
                <p className="mt-1 text-sm text-mute max-w-2xl">
                    Draft → Review → Scheduled → Published. Prefer useful maintained articles over volume.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <Metric label="Published" value={s.publishedBlogs} to="/admin/blogs?status=published" />
                <Metric label="Drafts" value={s.draftBlogs} to="/admin/blogs?status=draft" />
                <Metric label="Scheduled" value={s.scheduledBlogs} to="/admin/blogs?status=scheduled" />
                {isAdmin ? (
                    <>
                        <Metric label="New enquiries" value={s.newEnquiries} to="/admin/enquiries?status=new" />
                        <Metric label="New quotes" value={s.newQuoteRequests} to="/admin/quotes?status=new" />
                    </>
                ) : null}
            </div>

            {isAdmin ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                <Metric label="Open jobs" value={s.openJobs ?? s.publishedJobs} to="/admin/careers/jobs" />
                <Metric
                    label="New applications"
                    value={s.newApplications ?? s.newCareerApplications}
                    to="/admin/careers?status=new"
                />
                <Metric
                    label="In review"
                    value={s.applicationsInReview ?? s.inReviewApplications}
                    to="/admin/careers?status=reviewing"
                />
                <Metric
                    label="Unassigned applications"
                    value={s.unassignedApplications}
                    to="/admin/careers?unassigned=true"
                />
                <Metric
                    label="Unassigned enquiries"
                    value={s.unassignedEnquiries}
                    to="/admin/enquiries?unassigned=true"
                />
                <Metric
                    label="Unassigned quotes"
                    value={s.unassignedQuotes}
                    to="/admin/quotes?unassigned=true"
                />
                <Metric
                    label="Needs attention"
                    value={s.needsAttention ?? s.opsNeedsAttention}
                    to="/admin/enquiries?needsAttention=true"
                />
            </div>
            ) : null}

            {!hasContent && (
                <EmptyState
                    title="No blogs yet"
                    body="Seed evergreen articles or create your first draft to start the editorial pipeline."
                    action={
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Link to="/admin/blogs/new" className={btnPrimary}>
                                Create first blog
                            </Link>
                            <Link to="/admin/blogs/import" className={btn}>
                                Import JSON
                            </Link>
                        </div>
                    }
                />
            )}

            <section className={panel}>
                <div className="px-3 py-2.5 border-b border-graphite/10 flex items-center justify-between gap-2">
                    <h2 className={sectionTitle}>Content pipeline</h2>
                    <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-mute hidden sm:inline">
                        Draft → Review → Scheduled → Published
                    </span>
                </div>
                <div className="grid lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-graphite/10">
                    {[
                        ['Draft', pipe.drafts],
                        ['Review', pipe.review],
                        ['Scheduled', pipe.scheduled],
                        ['Published', pipe.published],
                    ].map(([label, rows]) => (
                        <div key={label} className="p-3">
                            <p className={`${sectionTitle} mb-2`}>{label}</p>
                            {(!rows || rows.length === 0) && <p className="text-xs text-mute">Empty</p>}
                            <ul className="space-y-2">
                                {(rows || []).slice(0, 4).map((r) => (
                                    <li key={r.id} className="text-sm">
                                        <Link
                                            to={`/admin/blogs/${r.id}`}
                                            className="font-medium hover:text-copper line-clamp-2 transition-colors"
                                        >
                                            {r.title || 'Untitled'}
                                        </Link>
                                        <div className="mt-0.5 flex flex-wrap gap-2 font-mono text-[10px] text-mute">
                                            <span className={statusTone(r.status)}>{r.status}</span>
                                            <span>{r.category || '-'}</span>
                                            <span>{fmtDateTime(r.updatedAt || r.publishedAt || r.scheduledAt)}</span>
                                        </div>
                                        <div className="mt-1.5 flex gap-2">
                                            <Link to={`/admin/blogs/${r.id}`} className={btn}>
                                                Continue
                                            </Link>
                                            <Link to={`/admin/blogs/${r.id}/preview`} className={btn}>
                                                Preview
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className={panel}>
                <div className="px-3 py-2.5 border-b border-graphite/10 flex justify-between items-center">
                    <h2 className={sectionTitle}>Attention needed</h2>
                    <Link to="/admin/seo" className="font-mono text-[10px] uppercase tracking-widest text-copper hover:underline">
                        SEO health
                    </Link>
                </div>
                {attention.length === 0 ? (
                    <p className="px-3 py-5 text-sm text-mute">No urgent editorial issues in the sampled set.</p>
                ) : (
                    <ul className="divide-y divide-graphite/10">
                        {attention.map((a) => (
                            <li key={a.href + a.label}>
                                <Link to={a.href} className="flex gap-3 px-3 py-3 hover:bg-bone/40 transition-colors">
                                    <span className="font-mono text-sm font-bold text-copper tabular-nums shrink-0">{a.count}</span>
                                    <span className="text-sm text-graphite">{a.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {isAdmin ? (
            <div className="grid lg:grid-cols-2 gap-4">
                <MiniTable
                    title="Recent enquiries"
                    rows={ops.enquiries}
                    empty="No enquiries yet — public Contact form submissions appear here."
                    columns={[
                        {
                            key: 'name',
                            label: 'Name',
                            render: (r) => (
                                <Link to={`/admin/enquiries/${r.id}`} className="hover:text-copper transition-colors">
                                    {r.name || '-'}
                                </Link>
                            ),
                        },
                        { key: 'company', label: 'Company' },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (r) => <span className={statusTone(r.status)}>{r.status}</span>,
                        },
                        { key: 'createdAt', label: 'When', render: (r) => fmtDateTime(r.createdAt) },
                    ]}
                />
                <MiniTable
                    title="Recent quotes"
                    rows={ops.quotes}
                    empty="No quote requests yet — /request-quote submissions appear here."
                    columns={[
                        {
                            key: 'reference',
                            label: 'Ref',
                            render: (r) => (
                                <Link to={`/admin/quotes/${r.id}`} className="hover:text-copper transition-colors">
                                    {r.reference || r.name || '-'}
                                </Link>
                            ),
                        },
                        { key: 'company', label: 'Company' },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (r) => <span className={statusTone(r.status)}>{r.status}</span>,
                        },
                        { key: 'createdAt', label: 'When', render: (r) => fmtDateTime(r.createdAt) },
                    ]}
                />
            </div>
            ) : null}
        </div>
    );
}
