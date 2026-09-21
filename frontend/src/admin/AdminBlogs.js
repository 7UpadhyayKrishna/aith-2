import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    listBlogs,
    publishBlog,
    unpublishBlog,
    archiveBlog,
    bulkBlogs,
    duplicateBlog,
    exportBlogs,
} from '@/services/adminApi';
import { BLOG_CATEGORIES, BLOG_STATUSES, SEO_ISSUE_FILTERS } from '@/data/blogCategories';
import { btn, btnPrimary, field, fmtDate, label, panel, sectionTitle, statusTone } from './adminUi';

function seoBadge(status) {
    if (status === 'Healthy') return 'text-emerald-800';
    if (status === 'Issues') return 'text-red-700';
    return 'text-copper';
}

export default function AdminBlogs() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(() => new Set());
    const [bulkTag, setBulkTag] = useState('');
    const [bulkCategory, setBulkCategory] = useState('');
    const [busyId, setBusyId] = useState('');
    const [menuId, setMenuId] = useState('');

    const page = Number(params.get('page') || 1);
    const status = params.get('status') || '';
    const category = params.get('category') || '';
    const search = params.get('search') || '';
    const author = params.get('author') || '';
    const seoIssue = params.get('seoIssue') || '';
    const needsRefresh = params.get('needsRefresh') === 'true';

    useEffect(() => {
        setPageTitle('Blogs');
        setHeaderActions(
            <div className="flex gap-2">
                <Link to="/admin/blogs/calendar" className={btn}>
                    Calendar
                </Link>
                <Link to="/admin/blogs/import" className={btn}>
                    Import JSON
                </Link>
                <Link to="/admin/blogs/new" className={btnPrimary}>
                    + New Blog
                </Link>
            </div>
        );
        return () => setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await listBlogs({
                page,
                limit: 20,
                status,
                category,
                search,
                author,
                seoIssue,
                needsRefresh: needsRefresh || undefined,
            });
            setData(res);
            setSelected(new Set());
        } catch (err) {
            setError(err.message || 'Failed to load blogs');
        } finally {
            setLoading(false);
        }
    }, [page, status, category, search, author, seoIssue, needsRefresh]);

    useEffect(() => {
        load();
    }, [load]);

    function updateFilter(key, value) {
        const next = new URLSearchParams(params);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        setParams(next);
    }

    function toggle(id) {
        setSelected((prev) => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });
    }

    function toggleAll() {
        if (selected.size === data.items.length) setSelected(new Set());
        else setSelected(new Set(data.items.map((b) => b.id)));
    }

    async function act(id, fn) {
        setBusyId(id);
        try {
            await fn();
            await load();
        } catch (err) {
            toast.error(err.message || 'Action failed');
        } finally {
            setBusyId('');
            setMenuId('');
        }
    }

    async function runBulk(action, extra = {}) {
        if (!selected.size) return;
        try {
            await bulkBlogs({ ids: [...selected], action, ...extra });
            await load();
            toast.success('Bulk action done');
        } catch (err) {
            toast.error(err.message || 'Bulk action failed');
        }
    }

    async function exportSelected() {
        try {
            const res = await exportBlogs({ ids: [...selected] });
            const blob = new Blob([JSON.stringify(res.blogs || [], null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'aith-blogs-export.json';
            a.click();
            URL.revokeObjectURL(a.href);
            toast.success('Exported');
        } catch (err) {
            toast.error(err.message || 'Export failed');
        }
    }

    const pages = Math.max(1, Math.ceil((data.total || 0) / (data.limit || 20)));

    return (
        <div className="space-y-4" data-testid="admin-blogs">
            <div>
                <p className="text-sm text-mute max-w-2xl">
                    Manage editorial content, publishing and organic search visibility.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[12rem]">
                    <label className={label} htmlFor="blog-search">
                        Search
                    </label>
                    <input
                        id="blog-search"
                        defaultValue={search}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') updateFilter('search', e.target.value.trim());
                        }}
                        placeholder="Title, slug…"
                        className={field}
                    />
                </div>
                <div>
                    <label className={label} htmlFor="blog-status">
                        Status
                    </label>
                    <select id="blog-status" value={status} onChange={(e) => updateFilter('status', e.target.value)} className={field}>
                        <option value="">All</option>
                        {BLOG_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={label} htmlFor="blog-cat">
                        Category
                    </label>
                    <select id="blog-cat" value={category} onChange={(e) => updateFilter('category', e.target.value)} className={field}>
                        <option value="">All</option>
                        {BLOG_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={label} htmlFor="blog-author">
                        Author
                    </label>
                    <input
                        id="blog-author"
                        defaultValue={author}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') updateFilter('author', e.target.value.trim());
                        }}
                        placeholder="Name"
                        className={field}
                    />
                </div>
                <div>
                    <label className={label} htmlFor="blog-seo">
                        SEO issues
                    </label>
                    <select id="blog-seo" value={seoIssue} onChange={(e) => updateFilter('seoIssue', e.target.value)} className={field}>
                        {SEO_ISSUE_FILTERS.map((f) => (
                            <option key={f.value || 'all'} value={f.value}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                </div>
                <label className="flex items-center gap-2 text-sm pb-2">
                    <input
                        type="checkbox"
                        checked={needsRefresh}
                        onChange={(e) => updateFilter('needsRefresh', e.target.checked ? 'true' : '')}
                    />
                    Needs refresh
                </label>
            </div>

            {selected.size > 0 && (
                <div className={`${panel} px-3 py-2 flex flex-wrap gap-2 items-center`}>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-mute">{selected.size} selected</span>
                    <button type="button" className={btn} onClick={() => runBulk('archive')}>
                        Archive
                    </button>
                    <button type="button" className={btn} onClick={exportSelected}>
                        Export JSON
                    </button>
                    <select className={field + ' !w-auto'} value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)}>
                        <option value="">Set category…</option>
                        {BLOG_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={btn}
                        disabled={!bulkCategory}
                        onClick={() => runBulk('category', { category: bulkCategory })}
                    >
                        Apply category
                    </button>
                    <input
                        className={field + ' !w-40'}
                        placeholder="Add tag"
                        value={bulkTag}
                        onChange={(e) => setBulkTag(e.target.value)}
                    />
                    <button
                        type="button"
                        className={btn}
                        disabled={!bulkTag.trim()}
                        onClick={() => runBulk('add_tag', { tag: bulkTag.trim() })}
                    >
                        Add tag
                    </button>
                </div>
            )}

            {error && (
                <p className="text-sm text-copper" role="alert">
                    {error}
                </p>
            )}

            <div className={`${panel} overflow-hidden`}>
                {loading ? (
                    <p className="px-4 py-8 font-mono text-[11px] uppercase tracking-widest text-mute">Loading…</p>
                ) : data.items.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                        <p className="font-serif text-xl text-forest">No posts match these filters.</p>
                        <Link to="/admin/blogs/new" className={`${btnPrimary} mt-4 inline-flex`}>
                            + New Blog
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[56rem]">
                            <thead>
                                <tr className="border-b border-graphite/10 text-left font-mono text-[9px] tracking-[0.16em] uppercase text-mute">
                                    <th className="px-3 py-2 w-8">
                                        <input
                                            type="checkbox"
                                            checked={selected.size === data.items.length && data.items.length > 0}
                                            onChange={toggleAll}
                                            aria-label="Select all"
                                        />
                                    </th>
                                    <th className="px-3 py-2 font-normal">Blog</th>
                                    <th className="px-3 py-2 font-normal">Category</th>
                                    <th className="px-3 py-2 font-normal">Status</th>
                                    <th className="px-3 py-2 font-normal">SEO</th>
                                    <th className="px-3 py-2 font-normal">Published</th>
                                    <th className="px-3 py-2 font-normal">Updated</th>
                                    <th className="px-3 py-2 font-normal">Author</th>
                                    <th className="px-3 py-2 font-normal w-10">⋯</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((b) => (
                                    <tr key={b.id} className="border-b border-graphite/8 hover:bg-bone/30 align-top">
                                        <td className="px-3 py-3">
                                            <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggle(b.id)} aria-label={`Select ${b.title}`} />
                                        </td>
                                        <td className="px-3 py-3">
                                            <Link to={`/admin/blogs/${b.id}`} className="font-medium text-forest hover:text-copper">
                                                {b.title || 'Untitled'}
                                            </Link>
                                            <p className="font-mono text-[10px] text-mute mt-0.5">{b.slug}</p>
                                        </td>
                                        <td className="px-3 py-3 text-mute">{b.category || '-'}</td>
                                        <td className={`px-3 py-3 font-mono text-[10px] uppercase tracking-wider ${statusTone(b.status)}`}>
                                            {b.status}
                                            {b.refreshDue ? <span className="block text-copper normal-case tracking-normal">refresh due</span> : null}
                                        </td>
                                        <td className={`px-3 py-3 font-mono text-[10px] uppercase tracking-wider ${seoBadge(b.seoStatus)}`}>
                                            {b.seoStatus || '-'}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-[11px] text-mute">{fmtDate(b.publishedAt)}</td>
                                        <td className="px-3 py-3 font-mono text-[11px] text-mute">{fmtDate(b.updatedAt)}</td>
                                        <td className="px-3 py-3 text-mute">{b.author?.name || '-'}</td>
                                        <td className="px-3 py-3 relative">
                                            <button
                                                type="button"
                                                className={btn}
                                                aria-haspopup="menu"
                                                aria-expanded={menuId === b.id}
                                                onClick={() => setMenuId(menuId === b.id ? '' : b.id)}
                                            >
                                                ⋯
                                            </button>
                                            {menuId === b.id && (
                                                <div role="menu" className="absolute right-0 z-20 mt-1 w-48 border border-graphite/15 bg-white shadow-sm py-1">
                                                    <Link role="menuitem" className="block px-3 py-1.5 text-sm hover:bg-bone/50" to={`/admin/blogs/${b.id}`}>
                                                        Edit
                                                    </Link>
                                                    <Link role="menuitem" className="block px-3 py-1.5 text-sm hover:bg-bone/50" to={`/admin/blogs/${b.id}/preview`}>
                                                        Preview
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        role="menuitem"
                                                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-bone/50"
                                                        disabled={busyId === b.id}
                                                        onClick={() =>
                                                            act(b.id, async () => {
                                                                const copy = await duplicateBlog(b.id);
                                                                window.location.href = `/admin/blogs/${copy.id}`;
                                                            })
                                                        }
                                                    >
                                                        Duplicate as Draft
                                                    </button>
                                                    {b.status !== 'published' && (
                                                        <button
                                                            type="button"
                                                            role="menuitem"
                                                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-bone/50"
                                                            disabled={busyId === b.id}
                                                            onClick={() => act(b.id, () => publishBlog(b.id, {}))}
                                                        >
                                                            Publish / Schedule
                                                        </button>
                                                    )}
                                                    {b.status === 'published' && (
                                                        <button
                                                            type="button"
                                                            role="menuitem"
                                                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-bone/50"
                                                            disabled={busyId === b.id}
                                                            onClick={() => {
                                                                if (!window.confirm('Unpublish this post?')) return;
                                                                act(b.id, () => unpublishBlog(b.id));
                                                            }}
                                                        >
                                                            Unpublish
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        role="menuitem"
                                                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-bone/50"
                                                        onClick={async () => {
                                                            const res = await exportBlogs({ ids: [b.id] });
                                                            const blob = new Blob([JSON.stringify(res.blogs?.[0] || {}, null, 2)], {
                                                                type: 'application/json',
                                                            });
                                                            const a = document.createElement('a');
                                                            a.href = URL.createObjectURL(blob);
                                                            a.download = `${b.slug || 'blog'}.json`;
                                                            a.click();
                                                            URL.revokeObjectURL(a.href);
                                                            setMenuId('');
                                                        }}
                                                    >
                                                        Export JSON
                                                    </button>
                                                    {b.status !== 'archived' && (
                                                        <button
                                                            type="button"
                                                            role="menuitem"
                                                            className="w-full text-left px-3 py-1.5 text-sm text-copper hover:bg-bone/50"
                                                            disabled={busyId === b.id}
                                                            onClick={() => {
                                                                if (!window.confirm('Archive this post? Prefer archive over delete.')) return;
                                                                act(b.id, () => archiveBlog(b.id));
                                                            }}
                                                        >
                                                            Archive
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {pages > 1 && (
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                    <button type="button" className={btn} disabled={page <= 1} onClick={() => updateFilter('page', String(page - 1))}>
                        Prev
                    </button>
                    <span className="text-mute">
                        {page} / {pages}
                    </span>
                    <button type="button" className={btn} disabled={page >= pages} onClick={() => updateFilter('page', String(page + 1))}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
