import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { listQuotes, getQuote, patchQuote } from '@/services/adminApi';
import { QUOTE_STATUSES } from '@/data/blogCategories';

const btn =
    'px-2 py-1 font-mono text-[9px] tracking-[0.14em] uppercase border border-graphite/20 hover:border-copper disabled:opacity-40';

function fmt(iso) {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return iso;
    }
}

function Section({ title, children }) {
    return (
        <section className="border border-graphite/15 bg-white p-3">
            <h3 className="font-mono text-[9px] tracking-[0.2em] uppercase text-mute mb-3">{title}</h3>
            {children}
        </section>
    );
}

function Field({ label, value }) {
    return (
        <div className="mb-2">
            <dt className="font-mono text-[9px] tracking-widest uppercase text-mute">{label}</dt>
            <dd className="text-sm mt-0.5 break-words">{value || '-'}</dd>
        </div>
    );
}

export default function AdminQuotes() {
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
        setPageTitle('Quote requests');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setData(await listQuotes({ page, limit: 20, status: filterStatus, search }));
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
        getQuote(openId)
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
    }

    async function saveStatus() {
        await patchQuote(detail.id, { internalStatus: status, internalNote: note });
        await load();
        setDetail(await getQuote(detail.id));
    }

    return (
        <div data-testid="admin-quotes">
            <div className="flex flex-wrap gap-2 mb-4">
                <input
                    defaultValue={search}
                    placeholder="Search name, company, ref…"
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
                    {QUOTE_STATUSES.map((s) => (
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
                    <table className="w-full text-sm min-w-[700px]">
                        <thead>
                            <tr className="border-b border-graphite/10 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-mute">
                                <th className="px-3 py-2 font-normal">When</th>
                                <th className="px-3 py-2 font-normal">Reference</th>
                                <th className="px-3 py-2 font-normal">Name</th>
                                <th className="px-3 py-2 font-normal">Product</th>
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
                                    <td className="px-3 py-2.5 text-mute whitespace-nowrap">{fmt(row.createdAt)}</td>
                                    <td className="px-3 py-2.5 font-mono text-xs">{row.reference || '-'}</td>
                                    <td className="px-3 py-2.5">{row.name}</td>
                                    <td className="px-3 py-2.5">{row.product || '-'}</td>
                                    <td className="px-3 py-2.5">{row.internalStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {detail && (
                <div className="fixed inset-0 z-40 flex justify-end bg-forest/40" role="dialog" aria-modal="true">
                    <button type="button" className="flex-1" aria-label="Close" onClick={close} />
                    <div className="w-full max-w-lg bg-ivory border-l border-graphite/20 h-full overflow-y-auto p-5">
                        <div className="flex justify-between items-start mb-4 gap-3">
                            <div>
                                <h2 className="text-lg font-extrabold tracking-tight">
                                    {detail.reference || 'Quote'}
                                </h2>
                                <p className="text-sm text-mute mt-1">{detail.product}</p>
                            </div>
                            <button type="button" className={btn} onClick={close}>
                                Close
                            </button>
                        </div>

                        <div className="space-y-3">
                            <Section title="Contact">
                                <Field label="Name" value={detail.name} />
                                <Field label="Email" value={detail.email} />
                                <Field label="Phone" value={detail.phone} />
                                <Field label="Company" value={detail.company} />
                                <Field label="Country" value={detail.country} />
                                <Field label="Role" value={detail.role} />
                            </Section>
                            <Section title="Requirement">
                                <Field label="Type" value={detail.requirementType} />
                                <Field label="Timeline" value={detail.timeline} />
                                <Field label="Quantity" value={[detail.quantity, detail.unit].filter(Boolean).join(' ')} />
                            </Section>
                            <Section title="Product">
                                <Field label="Product" value={detail.product} />
                                <Field label="Category" value={detail.category} />
                                <Field label="Specification" value={detail.specification} />
                                <Field label="Quality" value={detail.qualityRequirements} />
                                <Field label="Certifications" value={detail.certifications} />
                            </Section>
                            <Section title="Shipment">
                                <Field label="Origin" value={detail.origin} />
                                <Field label="Destination" value={detail.destination} />
                                <Field label="Mode" value={detail.mode} />
                                <Field label="Incoterm" value={detail.incoterm} />
                                <Field label="Packaging" value={detail.packaging} />
                            </Section>
                            <Section title="Commercial">
                                <Field label="Budget" value={detail.budget} />
                                <Field label="OEM / private label" value={detail.oem} />
                                <Field label="Supplier known" value={detail.supplierKnown} />
                                <Field label="Inspection" value={detail.inspection} />
                                <Field label="Documentation" value={detail.documentation} />
                            </Section>
                            <Section title="Notes">
                                <p className="text-sm whitespace-pre-wrap">{detail.notes || '-'}</p>
                            </Section>
                            <Section title="Metadata">
                                <Field label="ID" value={detail.id} />
                                <Field label="Created" value={fmt(detail.createdAt)} />
                                <Field label="Notification" value={detail.notificationStatus} />
                                <Field label="Reference" value={detail.reference || detail.refCode} />
                            </Section>
                        </div>

                        <div className="mt-5 space-y-3 border-t border-graphite/15 pt-4">
                            <div>
                                <label className="block font-mono text-[9px] tracking-widest uppercase text-mute mb-1" htmlFor="q-status">
                                    Status
                                </label>
                                <select
                                    id="q-status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full border border-graphite/20 bg-white px-2 py-2 text-sm"
                                >
                                    {QUOTE_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-mono text-[9px] tracking-widest uppercase text-mute mb-1" htmlFor="q-note">
                                    Internal note
                                </label>
                                <textarea
                                    id="q-note"
                                    rows={3}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full border border-graphite/20 bg-white px-2 py-2 text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" className={`${btn} bg-forest text-ivory border-forest`} onClick={saveStatus}>
                                    Save
                                </button>
                                {detail.email && (
                                    <button
                                        type="button"
                                        className={btn}
                                        onClick={() => navigator.clipboard.writeText(detail.email)}
                                    >
                                        Copy email
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
