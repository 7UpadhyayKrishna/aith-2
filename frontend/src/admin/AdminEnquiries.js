import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { listEnquiries, getEnquiry, patchEnquiry } from '@/services/adminApi';
import { ENQUIRY_STATUSES } from '@/data/blogCategories';

const btn =
    'px-2 py-1 font-mono text-[9px] tracking-[0.14em] uppercase border border-graphite/20 hover:border-copper disabled:opacity-40';

function fmt(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return iso;
    }
}

export default function AdminEnquiries() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState({ items: [], total: 0 });
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState('new');

    const page = Number(params.get('page') || 1);
    const filterStatus = params.get('status') || '';
    const search = params.get('search') || '';
    const openId = params.get('id') || '';

    useEffect(() => {
        setPageTitle('Enquiries');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listEnquiries({ page, limit: 20, status: filterStatus, search });
            setData(res);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, filterStatus, search]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!openId) {
            setDetail(null);
            return;
        }
        getEnquiry(openId)
            .then((d) => {
                setDetail(d);
                setStatus(d.internalStatus || 'new');
                setNote(d.internalNote || '');
            })
            .catch((err) => alert(err.message));
    }, [openId]);

    function open(id) {
        const next = new URLSearchParams(params);
        next.set('id', id);
        setParams(next);
    }

    function close() {
        const next = new URLSearchParams(params);
        next.delete('id');
        setParams(next);
        setDetail(null);
    }

    async function saveStatus() {
        await patchEnquiry(detail.id, { internalStatus: status, internalNote: note });
        await load();
        const d = await getEnquiry(detail.id);
        setDetail(d);
    }

    async function copyEmail() {
        if (detail?.email) {
            await navigator.clipboard.writeText(detail.email);
        }
    }

    return (
        <div className="relative" data-testid="admin-enquiries">
            <div className="flex flex-wrap gap-2 mb-4">
                <input
                    defaultValue={search}
                    placeholder="Search…"
                    className="border border-graphite/20 bg-white px-2.5 py-2 text-sm"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const next = new URLSearchParams(params);
                            if (e.target.value.trim()) next.set('search', e.target.value.trim());
                            else next.delete('search');
                            next.delete('page');
                            setParams(next);
                        }
                    }}
                />
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        const next = new URLSearchParams(params);
                        if (e.target.value) next.set('status', e.target.value);
                        else next.delete('status');
                        next.delete('page');
                        setParams(next);
                    }}
                    className="border border-graphite/20 bg-white px-2.5 py-2 text-sm"
                >
                    <option value="">All statuses</option>
                    {ENQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p className="font-mono text-[11px] uppercase tracking-widest text-mute">Loading…</p>
            ) : (
                <div className="border border-graphite/15 bg-white overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                        <thead>
                            <tr className="border-b border-graphite/10 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-mute">
                                <th className="px-3 py-2 font-normal">When</th>
                                <th className="px-3 py-2 font-normal">Name</th>
                                <th className="px-3 py-2 font-normal">Company</th>
                                <th className="px-3 py-2 font-normal">Type</th>
                                <th className="px-3 py-2 font-normal">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-graphite/8 hover:bg-bone/40 cursor-pointer"
                                    onClick={() => open(row.id)}
                                >
                                    <td className="px-3 py-2.5 whitespace-nowrap text-mute">{fmt(row.createdAt)}</td>
                                    <td className="px-3 py-2.5 font-medium">{row.name}</td>
                                    <td className="px-3 py-2.5">{row.company || '—'}</td>
                                    <td className="px-3 py-2.5 font-mono text-[10px] uppercase">{row.type}</td>
                                    <td className="px-3 py-2.5">{row.internalStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {detail && (
                <div className="fixed inset-0 z-40 flex justify-end bg-forest/40" role="dialog" aria-modal="true">
                    <button type="button" className="flex-1 cursor-default" aria-label="Close" onClick={close} />
                    <div className="w-full max-w-md bg-ivory border-l border-graphite/20 h-full overflow-y-auto p-5 shadow-xl">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <h2 className="text-lg font-extrabold tracking-tight">{detail.name || 'Enquiry'}</h2>
                            <button type="button" className={btn} onClick={close}>
                                Close
                            </button>
                        </div>
                        <dl className="space-y-3 text-sm">
                            {[
                                ['Email', detail.email],
                                ['Phone', detail.phone],
                                ['Company', detail.company],
                                ['Subject', detail.subject],
                                ['Type', detail.kind || detail.intent],
                                ['Created', fmt(detail.createdAt)],
                                ['Notify', detail.notificationStatus],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <dt className="font-mono text-[9px] tracking-widest uppercase text-mute">{k}</dt>
                                    <dd className="mt-0.5 break-all">{v || '—'}</dd>
                                </div>
                            ))}
                        </dl>
                        {detail.message && (
                            <div className="mt-4">
                                <p className="font-mono text-[9px] tracking-widest uppercase text-mute mb-1">Message</p>
                                <p className="text-sm whitespace-pre-wrap border border-graphite/15 bg-white p-3">
                                    {detail.message}
                                </p>
                            </div>
                        )}
                        <div className="mt-4 flex gap-2">
                            <button type="button" className={btn} onClick={copyEmail}>
                                Copy email
                            </button>
                            {detail.email && (
                                <a href={`mailto:${detail.email}`} className={btn}>
                                    Mailto
                                </a>
                            )}
                        </div>
                        <div className="mt-6 space-y-3 border-t border-graphite/15 pt-4">
                            <div>
                                <label className="block font-mono text-[9px] tracking-widest uppercase text-mute mb-1" htmlFor="enq-status">
                                    Status
                                </label>
                                <select
                                    id="enq-status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full border border-graphite/20 bg-white px-2 py-2 text-sm"
                                >
                                    {ENQUIRY_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-mono text-[9px] tracking-widest uppercase text-mute mb-1" htmlFor="enq-note">
                                    Internal note
                                </label>
                                <textarea
                                    id="enq-note"
                                    rows={4}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full border border-graphite/20 bg-white px-2 py-2 text-sm"
                                />
                            </div>
                            <button type="button" className={`${btn} bg-forest text-ivory border-forest`} onClick={saveStatus}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
