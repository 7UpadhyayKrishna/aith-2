import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { btn, btnPrimary, field, label, panel, sectionTitle, fmtDateTime } from './adminUi';

export function BackLink({ to, children }) {
    return (
        <Link
            to={to}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] uppercase text-mute hover:text-copper transition-colors"
        >
            ← {children}
        </Link>
    );
}

export function RecordHeader({ eyebrow, title, subtitle, actions }) {
    return (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-graphite/15 pb-5">
            <div className="min-w-0">
                {eyebrow ? <p className={sectionTitle}>{eyebrow}</p> : null}
                <h1 className="mt-1 font-serif text-2xl sm:text-3xl text-forest tracking-tight break-words">{title}</h1>
                {subtitle ? <p className="mt-2 text-sm text-mute max-w-2xl">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2 shrink-0">{actions}</div> : null}
        </header>
    );
}

export function RecordSection({ title, children }) {
    return (
        <section className={`${panel} p-4 sm:p-5`}>
            <h2 className={`${sectionTitle} mb-4`}>{title}</h2>
            {children}
        </section>
    );
}

export function RecordField({ label: fieldLabel, value, mono }) {
    return (
        <div className="min-w-0">
            <dt className={sectionTitle}>{fieldLabel}</dt>
            <dd className={`mt-1 text-sm break-words ${mono ? 'font-mono text-xs' : ''}`}>{value || '-'}</dd>
        </div>
    );
}

export function RecordGrid({ children }) {
    return <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">{children}</dl>;
}

/** Full-page ops record: main column + sticky workflow sidebar. */
export function AdminRecordPage({ backTo, backLabel, header, children, sidebar }) {
    return (
        <div className="space-y-5 animate-admin-enter" data-testid="admin-record-page">
            <BackLink to={backTo}>{backLabel}</BackLink>
            {header}
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] gap-5 items-start">
                <div className="space-y-4 min-w-0">{children}</div>
                {sidebar ? (
                    <aside className={`${panel} p-4 lg:sticky lg:top-4 space-y-4`}>{sidebar}</aside>
                ) : null}
            </div>
        </div>
    );
}

export function AttentionBadges({ attention }) {
    if (!attention?.needsAttention && !(attention?.reasons || []).length) return null;
    const reasons = attention.reasons || ['needs_attention'];
    return (
        <div className="flex flex-wrap gap-1.5">
            {reasons.map((r) => (
                <span
                    key={r}
                    className="inline-flex font-mono text-[9px] tracking-[0.12em] uppercase px-1.5 py-0.5 border border-copper/40 text-copper bg-copper/5"
                >
                    {String(r).replace(/_/g, ' ')}
                </span>
            ))}
        </div>
    );
}

export function StatusWorkflow({
    statusId,
    status,
    statuses,
    onStatusChange,
    noteId,
    note,
    onNoteChange,
    onSave,
    saving,
    extra,
    showNote = false,
}) {
    const noteEnabled = showNote && typeof onNoteChange === 'function';
    return (
        <>
            <p className={sectionTitle}>Workflow</p>
            <div>
                <label className={label} htmlFor={statusId}>
                    Status
                </label>
                <select
                    id={statusId}
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className={field}
                >
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>
            {noteEnabled ? (
                <div>
                    <label className={label} htmlFor={noteId}>
                        Internal note
                    </label>
                    <textarea
                        id={noteId}
                        rows={5}
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value)}
                        className={field}
                    />
                </div>
            ) : null}
            <button type="button" className={`${btnPrimary} w-full`} disabled={saving} onClick={onSave}>
                {saving ? 'Saving…' : 'Save changes'}
            </button>
            {extra}
        </>
    );
}

export function AssignmentPanel({
    assignedTo,
    assignedToName,
    assignees = [],
    currentUserId,
    onAssign,
    busy,
}) {
    const [selectId, setSelectId] = useState(assignedTo || '');

    useEffect(() => {
        setSelectId(assignedTo || '');
    }, [assignedTo]);

    return (
        <div className="space-y-3 border-t border-graphite/10 pt-4">
            <p className={sectionTitle}>Assignment</p>
            <p className="text-sm">
                {assignedTo ? (
                    <>
                        Assigned to <span className="font-medium">{assignedToName || assignedTo}</span>
                    </>
                ) : (
                    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute">Unassigned</span>
                )}
            </p>
            <div className="flex flex-wrap gap-2">
                {currentUserId ? (
                    <button
                        type="button"
                        className={btn}
                        disabled={busy || assignedTo === currentUserId}
                        onClick={() => onAssign(currentUserId)}
                    >
                        Assign to me
                    </button>
                ) : null}
                {assignedTo ? (
                    <button type="button" className={btn} disabled={busy} onClick={() => onAssign(null)}>
                        Unassign
                    </button>
                ) : null}
            </div>
            <div className="flex gap-2 items-end">
                <div className="flex-1 min-w-0">
                    <label className={label} htmlFor="ops-assignee">
                        Assignee
                    </label>
                    <select
                        id="ops-assignee"
                        className={field}
                        value={selectId}
                        onChange={(e) => setSelectId(e.target.value)}
                        disabled={busy}
                    >
                        <option value="">Select…</option>
                        {assignees.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name || a.email}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="button"
                    className={btnPrimary}
                    disabled={busy || !selectId || selectId === assignedTo}
                    onClick={() => onAssign(selectId)}
                >
                    Assign
                </button>
            </div>
        </div>
    );
}

export function ActivityTimeline({ events = [] }) {
    return (
        <RecordSection title="Activity">
            {events.length === 0 ? (
                <p className="text-sm text-mute">No activity yet.</p>
            ) : (
                <ul className="space-y-3">
                    {events.map((ev) => (
                        <li key={ev.id || `${ev.createdAt}-${ev.eventType}`} className="border-b border-graphite/8 pb-3 last:border-0">
                            <p className="text-sm">{ev.summary || ev.eventType}</p>
                            <p className="mt-1 font-mono text-[10px] text-mute tracking-wide">
                                {fmtDateTime(ev.createdAt)}
                                {ev.actorName ? ` · ${ev.actorName}` : ''}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </RecordSection>
    );
}

export function NotesPanel({ notes = [], onAdd, busy }) {
    const [body, setBody] = useState('');

    async function submit(e) {
        e.preventDefault();
        const text = body.trim();
        if (!text || busy) return;
        await onAdd(text);
        setBody('');
    }

    return (
        <RecordSection title="Notes">
            {notes.length === 0 ? (
                <p className="text-sm text-mute mb-4">No notes yet.</p>
            ) : (
                <ul className="space-y-3 mb-4">
                    {notes.map((n) => (
                        <li key={n.id} className="border border-graphite/10 bg-bone/30 p-3">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{n.body}</p>
                            <p className="mt-2 font-mono text-[10px] text-mute">
                                {fmtDateTime(n.createdAt)}
                                {n.authorName ? ` · ${n.authorName}` : ''}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
            <form onSubmit={submit} className="space-y-2">
                <label className={label} htmlFor="ops-note-body">
                    Add note
                </label>
                <textarea
                    id="ops-note-body"
                    rows={3}
                    className={field}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Append-only internal note…"
                />
                <button type="submit" className={btnPrimary} disabled={busy || !body.trim()}>
                    {busy ? 'Adding…' : 'Add note'}
                </button>
            </form>
        </RecordSection>
    );
}

export function MessagesPanel({ messages = [] }) {
    return (
        <RecordSection title="Messages">
            {messages.length === 0 ? (
                <p className="text-sm text-mute">No outbound replies yet.</p>
            ) : (
                <ul className="space-y-3">
                    {messages.map((m) => (
                        <li key={m.id || m.messageId} className="border-b border-graphite/8 pb-3">
                            <p className="text-sm font-medium">{m.subject || 'Reply'}</p>
                            <p className="mt-1 text-sm text-mute line-clamp-3">{m.bodyPreview || m.body}</p>
                            <p className="mt-1 font-mono text-[10px] text-mute">
                                {fmtDateTime(m.sentAt)} · {m.deliveryStatus || 'sent'}
                                {m.to ? ` · ${m.to}` : ''}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </RecordSection>
    );
}

export function ReplyModal({ open, onClose, defaultTo, defaultSubject, onSend }) {
    const [to, setTo] = useState(defaultTo || '');
    const [subject, setSubject] = useState(defaultSubject || '');
    const [body, setBody] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [unconfigured, setUnconfigured] = useState(null);

    useEffect(() => {
        if (open) {
            setTo(defaultTo || '');
            setSubject(defaultSubject || '');
            setBody('');
            setError('');
            setUnconfigured(null);
        }
    }, [open, defaultTo, defaultSubject]);

    if (!open) return null;

    async function handleSend(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        setUnconfigured(null);
        try {
            const res = await onSend({ to, subject, body });
            if (res && res.configured === false) {
                setUnconfigured(res.copy || { to, subject, body });
                return;
            }
            toast.success('Reply sent');
            onClose();
        } catch (err) {
            setError(err.message || 'Send failed');
        } finally {
            setBusy(false);
        }
    }

    function copyText(label, text) {
        navigator.clipboard.writeText(text || '');
        toast.success(`${label} copied`);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <button type="button" className="absolute inset-0 bg-forest/40" aria-label="Close" onClick={onClose} />
            <div className={`relative z-10 w-full max-w-lg ${panel} p-5 space-y-4 shadow-lg`}>
                <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-xl text-forest">Compose reply</h2>
                    <button type="button" className={btn} onClick={onClose}>
                        Close
                    </button>
                </div>

                {unconfigured ? (
                    <div className="space-y-3">
                        <p className="text-sm text-copper">Email delivery is not configured</p>
                        <p className="text-sm text-mute">
                            Copy the recipient or response and send from your mail client.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" className={btn} onClick={() => copyText('Email', unconfigured.to)}>
                                Copy email
                            </button>
                            <button
                                type="button"
                                className={btn}
                                onClick={() =>
                                    copyText(
                                        'Response',
                                        `To: ${unconfigured.to}\nSubject: ${unconfigured.subject}\n\n${unconfigured.body}`
                                    )
                                }
                            >
                                Copy response
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="space-y-3">
                        <div>
                            <label className={label} htmlFor="reply-to">
                                To
                            </label>
                            <input
                                id="reply-to"
                                className={field}
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="reply-subject">
                                Subject
                            </label>
                            <input
                                id="reply-subject"
                                className={field}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="reply-body">
                                Body
                            </label>
                            <textarea
                                id="reply-body"
                                rows={8}
                                className={field}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                required
                            />
                        </div>
                        {error ? <p className="text-sm text-copper">{error}</p> : null}
                        <button type="submit" className={btnPrimary} disabled={busy}>
                            {busy ? 'Sending…' : 'Send reply'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export function CopyMailtoActions({ email }) {
    if (!email) return null;
    return (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-graphite/10">
            <button
                type="button"
                className={btn}
                onClick={() => {
                    navigator.clipboard.writeText(email);
                    toast.success('Email copied');
                }}
            >
                Copy email
            </button>
            <a href={`mailto:${email}`} className={btn}>
                Mailto
            </a>
        </div>
    );
}

export { btn, btnPrimary, field, label, panel, sectionTitle };
