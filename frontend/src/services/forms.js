/**
 * Form submission boundary.
 *
 * Success only when FastAPI confirms durable Postgres persistence (HTTP 2xx + ok).
 * Never auto-open mailto / Gmail / Outlook on failure.
 * Passive SITE_EMAIL is shown as a passive contact option in page UI only.
 *
 * Wire REACT_APP_API_URL (or same-origin /api via Vercel rewrite) for production.
 * Never put secrets in the frontend.
 */

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

function endpoint(path) {
    if (API_BASE) return `${API_BASE}${path}`;
    return path;
}

function classifyError(err) {
    const status = err?.status;
    if (status === 429) return 'rate_limit';
    if (status === 400 || status === 422) return 'validation';
    if (status === 0 || status == null || err?.name === 'TypeError') return 'network';
    return 'server';
}

function userMessage(code) {
    switch (code) {
        case 'validation':
            return 'Please check the highlighted fields.';
        case 'rate_limit':
            return 'Too many requests. Please try again shortly.';
        case 'network':
            return "We couldn't reach the server. Please try again.";
        default:
            return "We couldn't submit your request right now. Please try again.";
    }
}

async function postJson(path, body) {
    let res;
    try {
        res = await fetch(endpoint(path), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body),
        });
    } catch (networkErr) {
        const err = new Error(userMessage('network'));
        err.status = 0;
        err.code = 'network';
        err.cause = networkErr;
        throw err;
    }

    let data = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }

    if (!res.ok) {
        const code = classifyError({ status: res.status });
        const err = new Error(userMessage(code));
        err.status = res.status;
        err.code = code;
        err.data = data;
        throw err;
    }

    if (!data || data.ok !== true) {
        const err = new Error(userMessage('server'));
        err.status = res.status;
        err.code = 'server';
        err.data = data;
        throw err;
    }

    return data;
}

/**
 * @returns {Promise<{ ok: true, mode: 'api' | 'stub', reference?: string } | { ok: false, mode: 'error', code: string, message: string }>}
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
    } catch (err) {
        const code = err.code || classifyError(err);
        return { ok: false, mode: 'error', code, message: err.message || userMessage(code) };
    }
}

/** Thin wrapper for careers applications. */
export async function submitCareerApplication(payload) {
    return submitContact({
        ...payload,
        intent: 'careers',
        kind: 'careers',
        company: payload.company || 'Career applicant',
        subject: payload.subject || `Careers - ${payload.roleInterest || payload.jobTitle || 'General interest'}`,
        jobId: payload.jobId || undefined,
        jobSlug: payload.jobSlug || undefined,
        jobTitle: payload.jobTitle || payload.roleInterest || undefined,
    });
}

/**
 * @returns {Promise<{ ok: true, mode: 'api' | 'stub', reference?: string } | { ok: false, mode: 'error', code: string, message: string }>}
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
    } catch (err) {
        const code = err.code || classifyError(err);
        return {
            ok: false,
            mode: 'error',
            code,
            message: err.message || userMessage(code),
            reference: payload.refCode,
        };
    }
}
