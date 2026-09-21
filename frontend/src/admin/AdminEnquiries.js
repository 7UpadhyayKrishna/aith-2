import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    bulkEnquiries,
    exportEnquiriesCsv,
    listEnquiries,
} from '@/services/adminApi';
import { ENQUIRY_STATUSES } from '@/data/blogCategories';
import {
    EmptyState,
    ErrorBanner,
    LoadingBlock,
    field,
    fmtDateTime,
    panel,
    statusTone,
} from './adminUi';
import {
    AttentionBadges,
    BoolFilter,
    OpsBulkBar,
    OpsFilterBar,
    downloadBlob,
    runBulkWithToast,
    useAssignees,
} from './AdminOpsShared';

export default function AdminEnquiries() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(() => new Set());
    const [busy, setBusy] = useState(false);
    const assignees = useAssignees();

    const page = Number(params.get('page') || 1);
    const filterStatus = params.get('status') || '';
    const search = params.get('search') || '';
    const assignee = params.get('assignee') || '';
    const unassigned = params.get('unassigned') === 'true';
    const needsAttention = params.get('needsAttention') === 'true';
    const dateFrom = params.get('dateFrom') || '';
    const dateTo = params.get('dateTo') || '';
    const legacyId = params.get('id') || '';

    useEffect(() => {
        setPageTitle('Enquiries');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    useEffect(() => {
        if (legacyId) {
            navigate(`/admin/enquiries/${encodeURIComponent(legacyId)}`, { replace: true });
        }
    }, [legacyId, navigate]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setData(
                await listEnquiries({
                    page,
                    limit: 20,
                    status: filterStatus,
                    search,
                    assignee,
                    unassigned: unassigned || undefined,
                    needsAttention: needsAttention || undefined,
                    dateFrom,
                    dateTo,
                })
            );
            setSelected(new Set());
        } catch (err) {
            setError(err.message || 'Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    }, [page, filterStatus, search, assignee, unassigned, needsAttention, dateFrom, dateTo]);

    useEffect(() => {
        load();
    }, [load]);

    function setFilter(key, value) {
        const next = new URLSearchParams(params);
        if (value === true) next.set(key, 'true');
        else if (value === false || value === '' || value == null) next.delete(key);
        else next.set(key, value);
        next.delete('page');
        setParams(next);
    }

    function toggleRow(id) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAll() {
        if (selected.size === data.items.length) setSelected(new Set());
        else setSelected(new Set(data.items.map((r) => r.id)));
    }

    async function handleBulkAssign(assignedTo) {
        setBusy(true);
        await runBulkWithToast(
            () => bulkEnquiries({ ids: [...selected], action: 'assign', assignedTo }),
            'Assigned'
        );
        await load();
        setBusy(false);
    }

    async function handleBulkStatus(status) {
        setBusy(true);
        await runBulkWithToast(
            () => bulkEnquiries({ ids: [...selected], action: 'status', status }),
            'Status updated'
        );
        await load();
        setBusy(false);
    }

    async function handleBulkArchive() {
        if (!window.confirm(`Archive ${selected.size} enquir${selected.size === 1 ? 'y' : 'ies'}?`)) return;
        setBusy(true);
        await runBulkWithToast(
            () => bulkEnquiries({ ids: [...selected], action: 'archive', confirm: true }),
            'Archived'
        );
        await load();
        setBusy(false);
    }

    async function handleExport() {
        setBusy(true);
        try {
            const blob = await exportEnquiriesCsv({
                status: filterStatus,
                assignee,
                unassigned: unassigned || undefined,
            });
            downloadBlob(blob, 'enquiries.csv');
            toast.success('Exported');
        } catch (err) {
            toast.error(err.message || 'Export failed');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-4" data-testid="admin-enquiries">
            <OpsFilterBar>
                <input
                    defaultValue={search}
                    placeholder="Search name, email, company…"
                    className={`${field} max-w-xs`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') setFilter('search', e.target.value.trim());
                    }}
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilter('status', e.target.value)}
                    className={field}
                    style={{ width: 'auto' }}
                >
                    <option value="">All statuses</option>
                    {ENQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
                <select
                    value={assignee}
                    onChange={(e) => setFilter('assignee', e.target.value)}
                    className={field}
                    style={{ width: 'auto' }}
                    disabled={unassigned}
                >
                    <option value="">All assignees</option>
                    {assignees.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.name || a.email}
                        </option>
                    ))}
                </select>
                <BoolFilter
                    label="Unassigned"
                    checked={unassigned}
                    onChange={(v) => {
                        setFilter('unassigned', v);
                        if (v) setFilter('assignee', '');
                    }}
                />
                <BoolFilter
                    label="Needs attention"
                    checked={needsAttention}
                    onChange={(v) => setFilter('needsAttention', v)}
                />
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setFilter('dateFrom', e.target.value)}
                    className={field}
                    style={{ width: 'auto' }}
                    title="From"
                />
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setFilter('dateTo', e.target.value)}
                    className={field}
                    style={{ width: 'auto' }}
                    title="To"
                />
            </OpsFilterBar>

            <OpsBulkBar
                selectedCount={selected.size}
                assignees={assignees}
                statuses={ENQUIRY_STATUSES}
                onAssign={handleBulkAssign}
                onStatus={handleBulkStatus}
                onArchive={handleBulkArchive}
                onExport={handleExport}
                busy={busy}
            />

            {error ? <ErrorBanner>{error}</ErrorBanner> : null}

            {loading ? (
                <LoadingBlock label="Loading enquiries…" />
            ) : data.items.length === 0 ? (
                <EmptyState
                    title="No enquiries yet"
                    body="Contact form submissions appear here. Open a row for the full request."
                />
            ) : (
                <div className={`${panel} overflow-x-auto`}>
                    <table className="w-full text-sm min-w-[720px]">
                        <thead>
                            <tr className="border-b border-graphite/10 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-mute">
                                <th className="px-3 py-2 font-normal w-8">
                                    <input
                                        type="checkbox"
                                        checked={selected.size === data.items.length && data.items.length > 0}
                                        onChange={toggleAll}
                                        aria-label="Select all"
                                    />
                                </th>
                                <th className="px-3 py-2 font-normal">When</th>
                                <th className="px-3 py-2 font-normal">Name</th>
                                <th className="px-3 py-2 font-normal">Company</th>
                                <th className="px-3 py-2 font-normal">Assignee</th>
                                <th className="px-3 py-2 font-normal">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-graphite/8 hover:bg-bone/40 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/admin/enquiries/${row.id}`)}
                                >
                                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selected.has(row.id)}
                                            onChange={() => toggleRow(row.id)}
                                            aria-label={`Select ${row.name}`}
                                        />
                                    </td>
                                    <td className="px-3 py-2.5 whitespace-nowrap text-mute">
                                        {fmtDateTime(row.createdAt)}
                                    </td>
                                    <td className="px-3 py-2.5 font-medium">
                                        <Link
                                            to={`/admin/enquiries/${row.id}`}
                                            className="hover:text-copper"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {row.name}
                                        </Link>
                                        <div className="mt-1">
                                            <AttentionBadges attention={row.attention} />
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5">{row.company || '-'}</td>
                                    <td className="px-3 py-2.5 text-mute text-xs">
                                        {row.assignedToName || '—'}
                                    </td>
                                    <td className={`px-3 py-2.5 ${statusTone(row.internalStatus)}`}>
                                        {row.internalStatus}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-between font-mono text-[10px] tracking-widest uppercase text-mute">
                <span>{data.total || 0} total</span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        className="border border-graphite/20 px-2 py-1 disabled:opacity-40"
                        onClick={() => {
                            const next = new URLSearchParams(params);
                            next.set('page', String(page - 1));
                            setParams(next);
                        }}
                    >
                        Prev
                    </button>
                    <button
                        type="button"
                        disabled={page * 20 >= (data.total || 0)}
                        className="border border-graphite/20 px-2 py-1 disabled:opacity-40"
                        onClick={() => {
                            const next = new URLSearchParams(params);
                            next.set('page', String(page + 1));
                            setParams(next);
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
