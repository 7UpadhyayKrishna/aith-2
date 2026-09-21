/**
 * Form submission boundary.
 *
 * Modes:
 * - api    → durable Mongo persistence confirmed by backend
 * - mailto → client email fallback only (NOT equivalent to server store)
 * - stub   → honeypot filtered
 *
 * Wire REACT_APP_API_URL (or same-origin /api) for production.
 * Never put secrets in the frontend.
 */

import { SITE_EMAIL } from '../config/site';

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

function endpoint(path) {
    if (API_BASE) return `${API_BASE}${path}`;
    return path;
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
        kind: payload.kind || (payload.intent === 'careers' ? 'careers' : 'contact'),
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
        const subject = encodeURIComponent(
            payload.subject
                ? `AITH - ${payload.subject}`
                : `AITH Contact - ${payload.intent || 'Enquiry'} - ${payload.name || ''}`
        );
        const text = [
            `Name: ${payload.name || ''}`,
            `Email: ${payload.email || ''}`,
            `Company: ${payload.company || ''}`,
            `Phone: ${payload.phone || ''}`,
            `Country: ${payload.country || ''}`,
            `Intent: ${payload.intent || 'general'}`,
            `Subject: ${payload.subject || ''}`,
            payload.roleInterest ? `Role interest: ${payload.roleInterest}` : '',
            payload.locationPreference ? `Location: ${payload.locationPreference}` : '',
            payload.linkedinOrCv ? `LinkedIn/CV: ${payload.linkedinOrCv}` : '',
            '',
            payload.message || '',
        ]
            .filter(Boolean)
            .join('\n');
        const mailto = `mailto:${SITE_EMAIL}?subject=${subject}&body=${encodeURIComponent(text)}`;
        return { ok: true, mode: 'mailto', mailto };
    }
}

/** Thin wrapper for careers applications. */
export async function submitCareerApplication(payload) {
    return submitContact({
        ...payload,
        intent: 'careers',
        kind: 'careers',
        company: payload.company || 'Career applicant',
        subject: payload.subject || `Careers - ${payload.roleInterest || 'General interest'}`,
    });
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
        const subject = encodeURIComponent(`AITH Quote ${payload.refCode || ''} - ${payload.product || 'Requirement'}`);
        const text = [
            `Reference: ${payload.refCode || ''}`,
            `Requirement type: ${payload.requirementType || ''}`,
            `Product: ${payload.product || ''}`,
            `Category: ${payload.category || ''}`,
            `Specification: ${payload.specification || ''}`,
            `Quantity: ${payload.quantity || ''} ${payload.unit || ''}`,
            `Destination: ${payload.destination || ''}`,
            `Origin: ${payload.origin || ''}`,
            `Supplier known: ${payload.supplierKnown || ''}`,
            `Timeline: ${payload.timeline || ''}`,
            `Mode: ${payload.mode || ''}`,
            `Incoterm: ${payload.incoterm || ''}`,
            `Budget: ${payload.budget || ''}`,
            `Packaging: ${payload.packaging || ''}`,
            `OEM / private label: ${payload.oem || ''}`,
            `Quality: ${payload.qualityRequirements || ''}`,
            `Certifications: ${payload.certifications || ''}`,
            `Inspection: ${payload.inspection || ''}`,
            `Documentation: ${payload.documentation || ''}`,
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
