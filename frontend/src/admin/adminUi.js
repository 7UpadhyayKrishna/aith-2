/** Shared admin UI primitives - dense, calm, AITH brand tokens. */

export const field =
    'w-full border border-graphite/20 bg-white px-2.5 py-2 text-sm text-graphite outline-none focus-visible:border-copper focus-visible:ring-1 focus-visible:ring-copper/40 transition-colors duration-micro';

export const label = 'block font-mono text-[9px] tracking-[0.16em] uppercase text-mute mb-1';

export const btn =
    'inline-flex items-center justify-center px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase border border-graphite/25 text-graphite hover:border-copper hover:text-copper disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper transition-colors duration-micro';

export const btnPrimary =
    'inline-flex items-center justify-center px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase bg-forest text-ivory hover:bg-olive disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper transition-colors duration-micro';

export const btnCopper =
    'inline-flex items-center justify-center px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase bg-copper text-ivory hover:bg-terra disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper transition-colors duration-micro';

export const panel = 'border border-graphite/15 bg-white';

export const sectionTitle = 'font-mono text-[9px] tracking-[0.2em] uppercase text-mute';

export const pageEnter = 'animate-admin-enter';

export function statusTone(status) {
    switch (status) {
        case 'published':
            return 'text-emerald-800';
        case 'scheduled':
            return 'text-copper';
        case 'review':
            return 'text-olive';
        case 'archived':
            return 'text-mute';
        case 'new':
            return 'text-copper';
        default:
            return 'text-graphite';
    }
}

export function fmtDate(iso) {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return iso;
    }
}

export function fmtDateTime(iso) {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return iso;
    }
}

export function PageIntro({ title, children, actions }) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-3 mb-1">
            <div className="min-w-0">
                {title ? <h2 className="font-serif text-2xl text-forest tracking-tight">{title}</h2> : null}
                {children ? <p className="mt-1 text-sm text-mute max-w-2xl">{children}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2 shrink-0">{actions}</div> : null}
        </div>
    );
}

export function EmptyState({ title, body, action }) {
    return (
        <div className={`${panel} px-6 py-12 text-center animate-admin-fade`}>
            <p className="font-serif text-xl text-forest tracking-tight">{title}</p>
            {body ? <p className="mt-2 text-sm text-mute max-w-md mx-auto">{body}</p> : null}
            {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
        </div>
    );
}

export function LoadingBlock({ label = 'Loading…' }) {
    return (
        <div className="space-y-3 animate-admin-fade" aria-busy="true" aria-live="polite">
            <p className="font-mono text-[11px] uppercase tracking-widest text-mute">{label}</p>
            <div className="grid gap-2">
                <div className="h-10 bg-bone/80 border border-graphite/10" />
                <div className="h-10 bg-bone/60 border border-graphite/10 w-11/12" />
                <div className="h-10 bg-bone/40 border border-graphite/10 w-4/5" />
            </div>
        </div>
    );
}

export function ErrorBanner({ children }) {
    return (
        <p role="alert" className="text-sm text-copper border border-copper/25 bg-copper/5 px-3 py-2 animate-admin-fade">
            {children}
        </p>
    );
}

export const DRAFT_STORAGE_PREFIX = 'aith_admin_blog_draft:';

export function saveLocalDraft(key, payload) {
    try {
        sessionStorage.setItem(DRAFT_STORAGE_PREFIX + key, JSON.stringify({ savedAt: Date.now(), payload }));
    } catch {
        /* quota / private mode */
    }
}

export function loadLocalDraft(key) {
    try {
        const raw = sessionStorage.getItem(DRAFT_STORAGE_PREFIX + key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearLocalDraft(key) {
    try {
        sessionStorage.removeItem(DRAFT_STORAGE_PREFIX + key);
    } catch {
        /* ignore */
    }
}
