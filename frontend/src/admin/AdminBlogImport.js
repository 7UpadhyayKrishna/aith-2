import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { importBlogs } from '@/services/adminApi';

const btn =
    'px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase border border-graphite/25 hover:border-copper disabled:opacity-40';
const btnPrimary =
    'px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase bg-forest text-ivory hover:bg-forest/90 disabled:opacity-40';

export default function AdminBlogImport() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [raw, setRaw] = useState('[]');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setPageTitle('Import blogs');
        setHeaderActions(
            <Link to="/admin/blogs" className={btn}>
                Back to list
            </Link>
        );
        return () => setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    function parseBlogs() {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.blogs)) return parsed.blogs;
        throw new Error('JSON must be an array of blogs or { blogs: [...] }');
    }

    async function dryRun() {
        setBusy(true);
        setError('');
        try {
            const blogs = parseBlogs();
            const res = await importBlogs(blogs, { dryRun: true, confirm: false });
            setResult(res);
        } catch (err) {
            setError(err.message || 'Dry-run failed');
            setResult(null);
        } finally {
            setBusy(false);
        }
    }

    async function confirmImport() {
        if (!window.confirm('Import valid blogs as drafts (published only if payload passes publish checks)?')) return;
        setBusy(true);
        setError('');
        try {
            const blogs = parseBlogs();
            const res = await importBlogs(blogs, { dryRun: false, confirm: true });
            setResult(res);
        } catch (err) {
            setError(err.message || 'Import failed');
            if (err.data?.detail) setResult(err.data.detail);
        } finally {
            setBusy(false);
        }
    }

    async function onFile(file) {
        const text = await file.text();
        setRaw(text);
        setResult(null);
    }

    const summary = result?.summary;

    return (
        <div className="space-y-4 max-w-3xl" data-testid="admin-blog-import">
            <p className="text-sm text-mute">
                Upload a JSON array of blog objects. Run a dry-run first, then confirm import. Maximum 50 posts per
                batch.
            </p>
            <div className="flex flex-wrap gap-2">
                <label className={`${btn} cursor-pointer`}>
                    Choose file
                    <input
                        type="file"
                        accept="application/json,.json"
                        className="sr-only"
                        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                    />
                </label>
                <button type="button" className={btn} disabled={busy} onClick={dryRun}>
                    Dry-run
                </button>
                <button
                    type="button"
                    className={btnPrimary}
                    disabled={busy || !summary || summary.invalid > 0}
                    onClick={confirmImport}
                >
                    Confirm import
                </button>
            </div>
            <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full border border-graphite/20 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-copper"
            />
            {error && <p className="text-sm text-copper">{error}</p>}
            {summary && (
                <div className="border border-graphite/15 bg-white p-4">
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute mb-2">
                        {result.dryRun === false ? 'Import result' : 'Dry-run summary'}
                    </p>
                    <p className="text-sm">
                        Valid: <strong>{summary.valid}</strong> · Invalid: <strong>{summary.invalid}</strong> · Total:{' '}
                        <strong>{summary.total}</strong>
                    </p>
                    {result.created && (
                        <p className="text-sm mt-2 text-emerald-800">Created {result.created.length} post(s).</p>
                    )}
                    <ul className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                        {(result.results || []).map((r) => (
                            <li key={r.index} className="text-xs border-t border-graphite/10 pt-2">
                                <span className={r.ok ? 'text-emerald-700' : 'text-copper'}>
                                    [{r.ok ? 'OK' : 'ERR'}]
                                </span>{' '}
                                {r.title || r.slug || `#${r.index}`}
                                {!r.ok && r.errors?.length > 0 && (
                                    <ul className="mt-1 text-mute pl-4 list-disc">
                                        {r.errors.map((e, i) => (
                                            <li key={i}>
                                                {e.path}: {e.message}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
