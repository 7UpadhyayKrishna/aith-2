/** Shared admin UI primitives - dense, calm, AITH brand tokens. */

export const field =
    'w-full border border-graphite/20 bg-white px-2.5 py-2 text-sm text-graphite outline-none focus-visible:border-copper focus-visible:ring-1 focus-visible:ring-copper/40';

export const label = 'block font-mono text-[9px] tracking-[0.16em] uppercase text-mute mb-1';

export const btn =
    'inline-flex items-center justify-center px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase border border-graphite/25 text-graphite hover:border-copper hover:text-copper disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper';

export const btnPrimary =
    'inline-flex items-center justify-center px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase bg-forest text-ivory hover:bg-olive disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper';

export const btnCopper =
    'inline-flex items-center justify-center px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase bg-copper text-ivory hover:bg-terra disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper';

export const panel = 'border border-graphite/15 bg-white';

export const sectionTitle = 'font-mono text-[9px] tracking-[0.2em] uppercase text-mute';

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
