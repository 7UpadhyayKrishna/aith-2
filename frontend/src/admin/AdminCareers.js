import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listCareers } from '@/services/adminApi';

function fmt(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return iso;
    }
}

export default function AdminCareers() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [data, setData] = useState({ items: [], total: 0, page: 1 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        setPageTitle('Career applications');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setData(await listCareers({ page, limit: 20 }));
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div data-testid="admin-careers">
            {loading ? (
                <p className="font-mono text-[11px] uppercase tracking-widest text-mute">Loading…</p>
            ) : (
                <div className="border border-graphite/15 bg-white overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead>
                            <tr className="border-b border-graphite/10 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-mute">
                                <th className="px-3 py-2 font-normal">When</th>
                                <th className="px-3 py-2 font-normal">Name</th>
                                <th className="px-3 py-2 font-normal">Email</th>
                                <th className="px-3 py-2 font-normal">Role interest</th>
                                <th className="px-3 py-2 font-normal">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-mute">
                                        No applications yet.
                                    </td>
                                </tr>
                            )}
                            {data.items.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-graphite/8 hover:bg-bone/40 cursor-pointer"
                                    onClick={() => setSelected(row)}
                                >
                                    <td className="px-3 py-2.5 text-mute whitespace-nowrap">{fmt(row.createdAt)}</td>
                                    <td className="px-3 py-2.5 font-medium">{row.name}</td>
                                    <td className="px-3 py-2.5 break-all">{row.email}</td>
                                    <td className="px-3 py-2.5">{row.roleInterest || row.subject || '—'}</td>
                                    <td className="px-3 py-2.5">{row.internalStatus || 'new'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-3 flex justify-between font-mono text-[10px] tracking-widest uppercase text-mute">
                <span>{data.total || 0} total</span>
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
                        disabled={page * 20 >= (data.total || 0)}
                        className="border border-graphite/20 px-2 py-1 disabled:opacity-40"
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-40 flex justify-end bg-forest/40" role="dialog" aria-modal="true">
                    <button type="button" className="flex-1" aria-label="Close" onClick={() => setSelected(null)} />
                    <div className="w-full max-w-md bg-ivory border-l border-graphite/20 h-full overflow-y-auto p-5">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-extrabold">{selected.name}</h2>
                            <button
                                type="button"
                                className="font-mono text-[9px] uppercase tracking-widest border border-graphite/20 px-2 py-1"
                                onClick={() => setSelected(null)}
                            >
                                Close
                            </button>
                        </div>
                        <dl className="space-y-3 text-sm">
                            {[
                                ['Email', selected.email],
                                ['Phone', selected.phone],
                                ['Role interest', selected.roleInterest],
                                ['Location', selected.locationPreference],
                                ['LinkedIn / CV', selected.linkedinOrCv],
                                ['Subject', selected.subject],
                                ['Created', fmt(selected.createdAt)],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <dt className="font-mono text-[9px] tracking-widest uppercase text-mute">{k}</dt>
                                    <dd className="mt-0.5 break-all">{v || '—'}</dd>
                                </div>
                            ))}
                        </dl>
                        {selected.message && (
                            <p className="mt-4 text-sm whitespace-pre-wrap border border-graphite/15 bg-white p-3">
                                {selected.message}
                            </p>
                        )}
                        {selected.email && (
                            <button
                                type="button"
                                className="mt-4 font-mono text-[9px] uppercase tracking-widest border border-graphite/20 px-2 py-1"
                                onClick={() => navigator.clipboard.writeText(selected.email)}
                            >
                                Copy email
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
