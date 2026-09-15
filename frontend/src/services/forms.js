import { SITE_EMAIL } from '../config/site';

/**
 * Form submission boundary.
 * Wire REACT_APP_API_URL (or same-origin /api) when backend is ready.
 * Never put secrets in the frontend.
 */

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

function endpoint(path) {
    if (API_BASE) return `${API_BASE}${path}`;
    return path; // same-origin /api proxied in production
}

async function postJson(path, body) {
    const res = await fetch(endpoint(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
    });
    let data = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }
    if (!res.ok) {
        const err = new Error((data && data.detail) || 'Submission failed');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

/**
 * @returns {{ ok: boolean, mode: 'api' | 'mailto' | 'stub', reference?: string, mailto?: string }}
 */
export async function submitContact(payload) {
    const body = {
        ...payload,
        kind: 'contact',
        // Honeypot — bots fill this; server should reject if non-empty
        website: payload.website || '',
        submittedAt: new Date().toISOString(),
    };

    if (body.website) {
        return { ok: true, mode: 'stub', reference: 'SPAM-FILTERED' };
    }

    try {
        const data = await postJson('/api/contact', body);
        return { ok: true, mode: 'api', reference: data?.id || data?.reference };
    } catch {
        // Graceful fallback: open mailto with structured body (no silent data loss)
        const subject = encodeURIComponent(`AITH Contact — ${payload.name || 'Enquiry'}`);
        const text = [
            `Name: ${payload.name || ''}`,
            `Email: ${payload.email || ''}`,
            `Company: ${payload.company || ''}`,
            `Intent: ${payload.intent || 'general'}`,
            '',
            payload.message || '',
        ].join('\n');
        const mailto = `mailto:${SITE_EMAIL}?subject=${subject}&body=${encodeURIComponent(text)}`;
        return { ok: true, mode: 'mailto', mailto };
    }
}

/**
 * @returns {{ ok: boolean, mode: 'api' | 'mailto' | 'stub', reference?: string, mailto?: string }}
 */
export async function submitQuote(payload) {
    const body = {
        ...payload,
        kind: 'quote',
        website: payload.website || '',
        submittedAt: new Date().toISOString(),
    };

    if (body.website) {
        return { ok: true, mode: 'stub', reference: 'SPAM-FILTERED' };
    }

    try {
        const data = await postJson('/api/quote', body);
        return { ok: true, mode: 'api', reference: data?.id || data?.reference || payload.refCode };
    } catch {
        const subject = encodeURIComponent(`AITH Quote ${payload.refCode || ''} — ${payload.product || 'Requirement'}`);
        const text = [
            `Reference: ${payload.refCode || ''}`,
            `Product: ${payload.product || ''}`,
            `Category: ${payload.category || ''}`,
            `Quantity: ${payload.quantity || ''} ${payload.unit || ''}`,
            `Destination: ${payload.destination || ''}`,
            `Origin: ${payload.origin || ''}`,
            `Timeline: ${payload.timeline || ''}`,
            `Mode: ${payload.mode || ''}`,
            `Incoterm: ${payload.incoterm || ''}`,
            `Company: ${payload.company || ''}`,
            `Country: ${payload.country || ''}`,
            `Role: ${payload.role || ''}`,
            `Name: ${payload.name || ''}`,
            `Email: ${payload.email || ''}`,
            `Phone: ${payload.phone || ''}`,
            `Notes: ${payload.notes || ''}`,
        ].join('\n');
        const mailto = `mailto:${SITE_EMAIL}?subject=${subject}&body=${encodeURIComponent(text)}`;
        return { ok: true, mode: 'mailto', mailto, reference: payload.refCode };
    }
}
