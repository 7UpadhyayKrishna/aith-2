import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    bulkCareers,
    exportCareersCsv,
    listCareers,
    listJobs,
    seedDefaultJobs,
} from '@/services/adminApi';
import { CAREER_APP_STATUSES } from '@/data/blogCategories';
import {
    EmptyState,
    ErrorBanner,
    LoadingBlock,
    btn,
    btnPrimary,
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

const tabCls = ({ isActive }) =>
    `px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase border-b-2 transition-colors ${
        isActive ? 'border-copper text-forest' : 'border-transparent text-mute hover:text-graphite'
    }`;

export default function AdminCareersLayout() {
    const ctx = useOutletContext();
    const { setPageTitle, setHeaderActions } = ctx;
    const location = useLocation();

    useEffect(() => {
        const onJobs = location.pathname.includes('/careers/jobs');
        setPageTitle(onJobs ? 'Job openings' : 'Career applications');
        if (onJobs && !location.pathname.includes('/jobs/new') && !/\/jobs\/[^/]+$/.test(location.pathname)) {
            setHeaderActions(
                <Link to="/admin/careers/jobs/new" className={btnPrimary}>
                    + Post job
                </Link>
            );
        } else {
            setHeaderActions(null);
        }
        return () => setHeaderActions(null);
    }, [location.pathname, setPageTitle, setHeaderActions]);

    return (
        <div data-testid="admin-careers" className="space-y-4">
            <nav className="flex gap-1 border-b border-graphite/15" aria-label="Careers sections">
                <NavLink to="/admin/careers" end className={tabCls}>
                    Applications
                </NavLink>
                <NavLink to="/admin/careers/jobs" className={tabCls}>
                    Job openings
                </NavLink>
            </nav>
            <Outlet context={ctx} />
        </div>
    );
}

export function AdminCareerApplications() {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState({ items: [], total: 0 });
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(() => new Set());
    const [busy, setBusy] = useState(false);
    const assignees = useAssignees();

    const page = Number(params.get('page') || 1);
    const filterStatus = params.get('status') || params.get('stage') || '';
    const search = params.get('search') || '';
    const assignee = params.get('assignee') || '';
    const unassigned = params.get('unassigned') === 'true';
    const needsAttention = params.get('needsAttention') === 'true';
    const dateFrom = params.get('dateFrom') || '';
    const dateTo = params.get('dateTo') || '';
    const jobId = params.get('jobId') || '';

    useEffect(() => {
        listJobs()
            .then((res) => setJobs(res.items || []))
            .catch(() => setJobs([]));
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setData(
                await listCareers({
                    page,
                    limit: 20,
                    status: filterStatus,
                    search,
                    assignee,
                    unassigned: unassigned || undefined,
                    needsAttention: needsAttention || undefined,
                    dateFrom,
                    dateTo,
                    jobId,
                })
            );
            setSelected(new Set());
        } catch (err) {
            setError(err.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, [page, filterStatus, search, assignee, unassigned, needsAttention, dateFrom, dateTo, jobId]);

    useEffect(() => {
        load();
    }, [load]);

    function setFilter(key, value) {
        const next = new URLSearchParams(params);
        if (value === true) next.set(key, 'true');
        else if (value === false || value === '' || value == null) next.delete(key);
        else next.set(key, value);
        next.delete('page');
        if (key === 'status') next.delete('stage');
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
            () => bulkCareers({ ids: [...selected], action: 'assign', assignedTo }),
            'Assigned'
        );
        await load();
        setBusy(false);
    }

    async function handleBulkStatus(status) {
        setBusy(true);
        await runBulkWithToast(
            () => bulkCareers({ ids: [...selected], action: 'status', status }),
            'Status updated'
        );
        await load();
        setBusy(false);
    }

    async function handleBulkArchive() {
        if (!window.confirm(`Archive ${selected.size} application${selected.size === 1 ? '' : 's'}?`)) return;
        setBusy(true);
        await runBulkWithToast(
            () => bulkCareers({ ids: [...selected], action: 'archive', confirm: true }),
            'Archived'
        );
        await load();
        setBusy(false);
    }

    async function handleExport() {
        setBusy(true);
        try {
            const blob = await exportCareersCsv({
                status: filterStatus,
                assignee,
                unassigned: unassigned || undefined,
            });
            downloadBlob(blob, 'career_applications.csv');
            toast.success('Exported');
        } catch (err) {
            toast.error(err.message || 'Export failed');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-4">
            <OpsFilterBar>
                <input
                    defaultValue={search}
                    placeholder="Search name, email, role…"
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
                    {CAREER_APP_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
                <select
                    value={jobId}
                    onChange={(e) => setFilter('jobId', e.target.value)}
                    className={field}
                    style={{ width: 'auto' }}
                >
                    <option value="">All jobs</option>
                    {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                            {j.title}
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
                />
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setFilter('dateTo', e.target.value)}
                    className={field}
                    style={{ width: 'auto' }}
                />
            </OpsFilterBar>

            <OpsBulkBar
                selectedCount={selected.size}
                assignees={assignees}
                statuses={CAREER_APP_STATUSES}
                onAssign={handleBulkAssign}
                onStatus={handleBulkStatus}
                onArchive={handleBulkArchive}
                onExport={handleExport}
                busy={busy}
            />

            {error ? <ErrorBanner>{error}</ErrorBanner> : null}
            {loading ? (
                <LoadingBlock label="Loading applications…" />
            ) : data.items.length === 0 ? (
                <EmptyState
                    title="No applications yet"
                    body="Careers form submissions appear here. Publish open roles under Job openings."
                    action={
                        <Link to="/admin/careers/jobs" className={btnPrimary}>
                            Manage job openings
                        </Link>
                    }
                />
            ) : (
                <div className={`${panel} overflow-x-auto`}>
                    <table className="w-full text-sm min-w-[760px]">
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
                                <th className="px-3 py-2 font-normal">Role</th>
                                <th className="px-3 py-2 font-normal">Assignee</th>
                                <th className="px-3 py-2 font-normal">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-graphite/8 hover:bg-bone/40 cursor-pointer"
                                    onClick={() => navigate(`/admin/careers/applications/${row.id}`)}
                                >
                                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selected.has(row.id)}
                                            onChange={() => toggleRow(row.id)}
                                            aria-label={`Select ${row.name}`}
                                        />
                                    </td>
                                    <td className="px-3 py-2.5 text-mute whitespace-nowrap">
                                        {fmtDateTime(row.createdAt)}
                                    </td>
                                    <td className="px-3 py-2.5 font-medium">
                                        {row.name}
                                        <div className="mt-1">
                                            <AttentionBadges attention={row.attention} />
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        {row.jobTitle || row.roleInterest || row.subject || '-'}
                                    </td>
                                    <td className="px-3 py-2.5 text-mute text-xs">
                                        {row.assignedToName || '—'}
                                    </td>
                                    <td className={`px-3 py-2.5 ${statusTone(row.internalStatus || 'new')}`}>
                                        {row.internalStatus || 'new'}
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

export function AdminJobList() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await listJobs();
            setItems(res.items || []);
        } catch (err) {
            setError(err.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function handleSeed() {
        setBusy(true);
        setError('');
        try {
            const res = await seedDefaultJobs();
            await load();
            if (res.created === 0) {
                setError('Default openings already exist (nothing new imported).');
            }
        } catch (err) {
            setError(err.message || 'Seed failed');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-mute max-w-2xl">
                Published openings appear on the public Careers page. Drafts stay admin-only until you publish.
            </p>
            {error ? <ErrorBanner>{error}</ErrorBanner> : null}
            {loading ? (
                <LoadingBlock label="Loading job openings…" />
            ) : items.length === 0 ? (
                <EmptyState
                    title="No job openings yet"
                    body="Post a role for /careers, or import the site’s default sample openings."
                    action={
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Link to="/admin/careers/jobs/new" className={btnPrimary}>
                                + Post job
                            </Link>
                            <button type="button" className={btn} disabled={busy} onClick={handleSeed}>
                                {busy ? 'Importing…' : 'Import defaults'}
                            </button>
                        </div>
                    }
                />
            ) : (
                <div className={`${panel} overflow-x-auto`}>
                    <table className="w-full text-sm min-w-[720px]">
                        <thead>
                            <tr className="border-b border-graphite/10 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-mute">
                                <th className="px-3 py-2 font-normal">Title</th>
                                <th className="px-3 py-2 font-normal">Team</th>
                                <th className="px-3 py-2 font-normal">Location</th>
                                <th className="px-3 py-2 font-normal">Status</th>
                                <th className="px-3 py-2 font-normal">Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-graphite/8 hover:bg-bone/40 cursor-pointer"
                                    onClick={() => navigate(`/admin/careers/jobs/${row.id}`)}
                                >
                                    <td className="px-3 py-2.5 font-medium">{row.title}</td>
                                    <td className="px-3 py-2.5">{row.team || '-'}</td>
                                    <td className="px-3 py-2.5">{row.location || '-'}</td>
                                    <td className={`px-3 py-2.5 ${statusTone(row.status)}`}>{row.status}</td>
                                    <td className="px-3 py-2.5 text-mute whitespace-nowrap">
                                        {fmtDateTime(row.updatedAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {items.length > 0 ? (
                <button type="button" className={btn} disabled={busy} onClick={handleSeed}>
                    {busy ? 'Importing…' : 'Import missing defaults'}
                </button>
            ) : null}
        </div>
    );
}
