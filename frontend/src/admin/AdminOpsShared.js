import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listAssignees } from '@/services/adminApi';
import { AttentionBadges } from './AdminRecordPage';
import { btn, btnPrimary, field } from './adminUi';

export { AttentionBadges };

export function useAssignees() {
    const [assignees, setAssignees] = useState([]);
    useEffect(() => {
        let cancelled = false;
        listAssignees()
            .then((res) => {
                if (!cancelled) setAssignees(res.items || []);
            })
            .catch(() => {
                if (!cancelled) setAssignees([]);
            });
        return () => {
            cancelled = true;
        };
    }, []);
    return assignees;
}

export function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

export function OpsFilterBar({ children }) {
    return <div className="flex flex-wrap gap-2 items-end">{children}</div>;
}

export function BoolFilter({ label: text, checked, onChange }) {
    return (
        <label className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase text-mute border border-graphite/15 px-2 py-2 cursor-pointer hover:border-copper/40">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            {text}
        </label>
    );
}

export function OpsBulkBar({
    selectedCount,
    assignees = [],
    statuses = [],
    onAssign,
    onStatus,
    onArchive,
    onExport,
    busy,
}) {
    const [assignee, setAssignee] = useState('');
    const [status, setStatus] = useState('');

    if (!selectedCount) return null;

    return (
        <div className="flex flex-wrap gap-2 items-center border border-graphite/15 bg-bone/40 px-3 py-2">
            <span className="font-mono text-[10px] tracking-widest uppercase text-mute">
                {selectedCount} selected
            </span>
            <select
                className={field}
                style={{ width: 'auto' }}
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                disabled={busy}
            >
                <option value="">Assign to…</option>
                {assignees.map((a) => (
                    <option key={a.id} value={a.id}>
                        {a.name || a.email}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className={btn}
                disabled={busy || !assignee}
                onClick={() => onAssign(assignee)}
            >
                Assign
            </button>
            <select
                className={field}
                style={{ width: 'auto' }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={busy}
            >
                <option value="">Change status…</option>
                {statuses.map((s) => (
                    <option key={s} value={s}>
                        {s}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className={btn}
                disabled={busy || !status}
                onClick={() => onStatus(status)}
            >
                Apply status
            </button>
            <button type="button" className={btn} disabled={busy} onClick={onArchive}>
                Archive
            </button>
            <button type="button" className={btnPrimary} disabled={busy} onClick={onExport}>
                Export CSV
            </button>
        </div>
    );
}

export async function runBulkWithToast(fn, successMsg) {
    try {
        await fn();
        toast.success(successMsg);
        return true;
    } catch (err) {
        toast.error(err.message || 'Action failed');
        return false;
    }
}
