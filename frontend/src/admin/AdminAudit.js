import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listAudit } from '@/services/adminApi';

function fmt(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' });
    } catch {
        return iso;
    }
}

export default function AdminAudit() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [data, setData] = useState({ items: [], total: 0 });
    const [page, setPage] = useState(1);
    const [action, setAction] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPageTitle('Audit log');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setData(await listAudit({ page, limit: 40, action: action || undefined }));
        } catch (err) {
            setError(err.status === 403 ? 'Admin role required.' : err.message);
        } finally {
            setLoading(false);
        }
    }, [page, action]);

    useEffect(() => {
        load();
    }, [load]);

    if (error) return <p className="text-copper text-sm">{error}</p>;

    return (
        <div className="space-y-4" data-testid="admin-audit">
            <div className="flex gap-2">
                <input
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="Filter action (exact)"
                    className="border border-graphite/20 bg-white px-2.5 py-2 text-sm"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setPage(1);
                            load();
                        }
                    }}
                />
                <button
                    type="button"
                    className="px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase border border-graphite/25"
                    onClick={() => {
                        setPage(1);
                        load();
                    }}
                >
                    Apply
                </button>
            </div>

            {loading ? (
                <p className="font-mono text-[11px] uppercase tracking-widest text-mute">Loading…</p>
            ) : (
                <div className="border border-graphite/15 bg-white overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                        <thead>
                            <tr className="border-b border-graphite/10 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-mute">
                                <th className="px-3 py-2 font-normal">Time</th>
                                <th className="px-3 py-2 font-normal">Action</th>
                                <th className="px-3 py-2 font-normal">Resource</th>
                                <th className="px-3 py-2 font-normal">Result</th>
                                <th className="px-3 py-2 font-normal">User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((row) => (
                                <tr key={row.id || `${row.timestamp}-${row.action}`} className="border-b border-graphite/8">
                                    <td className="px-3 py-2 whitespace-nowrap text-mute">{fmt(row.timestamp)}</td>
                                    <td className="px-3 py-2 font-mono text-[10px]">{row.action}</td>
                                    <td className="px-3 py-2">
                                        {row.resourceType}
                                        {row.resourceId ? ` · ${row.resourceId.slice(0, 8)}…` : ''}
                                    </td>
                                    <td className="px-3 py-2">{row.result}</td>
                                    <td className="px-3 py-2 font-mono text-[10px] text-mute">
                                        {(row.adminUserId || '').slice(0, 8) || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-between font-mono text-[10px] tracking-widest uppercase text-mute">
                <span>{data.total || 0} events</span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        className="border border-graphite/20 px-2 py-1 disabled:opacity-40"
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        disabled={page * 40 >= (data.total || 0)}
                        className="border border-graphite/20 px-2 py-1 disabled:opacity-40"
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
