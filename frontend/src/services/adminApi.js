/**
 * Admin CMS API client.
 * Session: HttpOnly cookie aith_admin_session (never localStorage).
 * CSRF: cookie aith_admin_csrf or /me csrfToken → header X-CSRF-Token on mutations.
 */

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const CSRF_COOKIE = 'aith_admin_csrf';

let memoryCsrf = '';
let unauthorizedHandler = null;

function endpoint(path) {
    if (API_BASE) return `${API_BASE}${path}`;
    return path;
}

function readCookie(name) {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
}

export function getCsrf() {
    return memoryCsrf || readCookie(CSRF_COOKIE) || '';
}

export function setCsrf(token) {
    if (token) memoryCsrf = token;
}

/** Register once from AdminApp. Called on authenticated-route 401s (not login/me). */
export function setUnauthorizedHandler(fn) {
    unauthorizedHandler = typeof fn === 'function' ? fn : null;
}

function qs(params = {}) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        if (typeof v === 'boolean') sp.set(k, v ? 'true' : 'false');
        else sp.set(k, String(v));
    });
    const s = sp.toString();
    return s ? `?${s}` : '';
}

function detailMessage(data, fallback) {
    if (!data) return fallback;
    if (typeof data.detail === 'string') return data.detail;
    if (data.detail && typeof data.detail === 'object' && data.detail.message) return data.detail.message;
    if (data.message) return data.message;
    return fallback;
}

/**
 * @param {string} path - e.g. /api/admin/dashboard
 * @param {RequestInit & { raw?: boolean, skipAuthHandler?: boolean }} options
 */
export async function adminFetch(path, options = {}) {
    const { raw, headers: extraHeaders, body, skipAuthHandler, ...rest } = options;
    const method = (rest.method || 'GET').toUpperCase();
    const headers = {
        Accept: 'application/json',
        ...(extraHeaders || {}),
    };

    let finalBody = body;
    if (body != null && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        finalBody = JSON.stringify(body);
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        headers['X-CSRF-Token'] = getCsrf();
    }

    const res = await fetch(endpoint(path), {
        ...rest,
        method,
        headers,
        body: finalBody,
        credentials: 'include',
    });

    if (raw) return res;

    let data = null;
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { raw: text };
        }
    }

    if (!res.ok) {
        // CRA often returns HTML 404 when /api is not proxied - don't treat as auth failure
        const looksHtml = typeof data?.raw === 'string' && data.raw.trimStart().startsWith('<');
        let fallback = `Request failed (${res.status})`;
        if (res.status === 404 || looksHtml) {
            fallback = 'API unavailable (404). Ensure the backend is running and /api is proxied.';
        } else if (res.status === 502) {
            fallback = detailMessage(data, 'API unreachable. Start the backend on port 8000.');
        } else if (res.status === 401) {
            fallback = detailMessage(data, 'Invalid credentials.');
        } else if (res.status === 429) {
            fallback = detailMessage(data, 'Too many attempts. Please wait and try again.');
        }
        const message = detailMessage(data, fallback);
        const err = new Error(message);
        err.status = res.status;
        err.data = data;

        if (
            res.status === 401 &&
            !skipAuthHandler &&
            unauthorizedHandler &&
            !path.includes('/admin/auth/login') &&
            !path.includes('/admin/auth/me')
        ) {
            try {
                unauthorizedHandler(message);
            } catch {
                /* ignore handler errors */
            }
        }
        throw err;
    }
    return data;
}

// ---- Auth ----

export async function login(email, password, totpCode) {
    const body = { email, password };
    if (totpCode) body.totpCode = totpCode;
    const data = await adminFetch('/api/admin/auth/login', {
        method: 'POST',
        body,
        skipAuthHandler: true,
    });
    if (data?.csrfToken) setCsrf(data.csrfToken);
    return data;
}

export async function logout() {
    try {
        await adminFetch('/api/admin/auth/logout', { method: 'POST', body: {}, skipAuthHandler: true });
    } finally {
        memoryCsrf = '';
    }
}

export async function me() {
    const data = await adminFetch('/api/admin/auth/me', { skipAuthHandler: true });
    if (data?.csrfToken) setCsrf(data.csrfToken);
    return data;
}

export function changePassword(currentPassword, newPassword) {
    return adminFetch('/api/admin/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
    });
}

export function listSessions() {
    return adminFetch('/api/admin/auth/sessions');
}

export function revokeOtherSessions() {
    return adminFetch('/api/admin/auth/sessions/revoke-others', {
        method: 'POST',
        body: {},
    });
}

// ---- Dashboard / system ----

export function dashboard() {
    return adminFetch('/api/admin/dashboard');
}

export function systemStatus() {
    return adminFetch('/api/admin/system');
}

export function seoOverview() {
    return adminFetch('/api/admin/seo');
}

export function listAudit(params = {}) {
    return adminFetch(`/api/admin/audit${qs(params)}`);
}

export function listUsers() {
    return adminFetch('/api/admin/users');
}

export function createUser(payload) {
    return adminFetch('/api/admin/users', { method: 'POST', body: payload });
}

export function disableUser(userId) {
    return adminFetch(`/api/admin/users/${encodeURIComponent(userId)}/disable`, {
        method: 'POST',
        body: {},
    });
}

// ---- Blogs ----

export function listBlogs(params = {}) {
    return adminFetch(`/api/admin/blogs${qs(params)}`);
}

export function getBlog(id) {
    return adminFetch(`/api/admin/blogs/${encodeURIComponent(id)}`);
}

export function createBlog(payload) {
    return adminFetch('/api/admin/blogs', { method: 'POST', body: payload });
}

export function updateBlog(id, payload) {
    return adminFetch(`/api/admin/blogs/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: payload,
    });
}

export function publishBlog(id, body = {}) {
    return adminFetch(`/api/admin/blogs/${encodeURIComponent(id)}/publish`, {
        method: 'POST',
        body,
    });
}

export function unpublishBlog(id) {
    return adminFetch(`/api/admin/blogs/${encodeURIComponent(id)}/unpublish`, {
        method: 'POST',
        body: {},
    });
}

export function archiveBlog(id) {
    return adminFetch(`/api/admin/blogs/${encodeURIComponent(id)}/archive`, {
        method: 'POST',
        body: {},
    });
}

export function bulkBlogs(payload) {
    return adminFetch('/api/admin/blogs/bulk', { method: 'POST', body: payload });
}

export function validateBlog(blog, forPublish = false) {
    return adminFetch('/api/admin/blogs/validate', {
        method: 'POST',
        body: { blog, forPublish },
    });
}

export function importBlogs(blogs, { dryRun = true, confirm = false } = {}) {
    return adminFetch('/api/admin/blogs/import', {
        method: 'POST',
        body: { blogs, dryRun, confirm },
    });
}

export function exportBlogs({ ids, all } = {}) {
    const params = {};
    if (all) params.all = true;
    if (ids?.length) params.ids = ids.join(',');
    return adminFetch(`/api/admin/blogs/export${qs(params)}`);
}

export function listRevisions(blogId) {
    return adminFetch(`/api/admin/blogs/${encodeURIComponent(blogId)}/revisions`);
}

export function getRevision(blogId, revisionId) {
    return adminFetch(
        `/api/admin/blogs/${encodeURIComponent(blogId)}/revisions/${encodeURIComponent(revisionId)}`
    );
}

export function restoreRevision(blogId, revisionId) {
    return adminFetch(
        `/api/admin/blogs/${encodeURIComponent(blogId)}/restore/${encodeURIComponent(revisionId)}`,
        { method: 'POST', body: {} }
    );
}

export function previewBlog(blogId) {
    return adminFetch(`/api/admin/blogs/${encodeURIComponent(blogId)}/preview`);
}

export function duplicateBlog(blogId) {
    return adminFetch(`/api/admin/blogs/${encodeURIComponent(blogId)}/duplicate`, {
        method: 'POST',
        body: {},
    });
}

// ---- Operations ----

export function listAssignees() {
    return adminFetch('/api/admin/assignees');
}

export function getOpsConfig() {
    return adminFetch('/api/admin/ops/config');
}

export function listEnquiries(params = {}) {
    return adminFetch(`/api/admin/enquiries${qs(params)}`);
}

export function getEnquiry(id) {
    return adminFetch(`/api/admin/enquiries/${encodeURIComponent(id)}`);
}

export function patchEnquiry(id, payload) {
    return adminFetch(`/api/admin/enquiries/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: payload,
    });
}

export function assignEnquiry(id, { assignedTo } = {}) {
    return adminFetch(`/api/admin/enquiries/${encodeURIComponent(id)}/assign`, {
        method: 'POST',
        body: { assignedTo: assignedTo ?? null },
    });
}

export function addEnquiryNote(id, { body }) {
    return adminFetch(`/api/admin/enquiries/${encodeURIComponent(id)}/notes`, {
        method: 'POST',
        body: { body },
    });
}

export function replyEnquiry(id, { to, subject, body }) {
    return adminFetch(`/api/admin/enquiries/${encodeURIComponent(id)}/reply`, {
        method: 'POST',
        body: { to, subject, body },
    });
}

export function bulkEnquiries(payload) {
    return adminFetch('/api/admin/enquiries/bulk', { method: 'POST', body: payload });
}

export function listQuotes(params = {}) {
    return adminFetch(`/api/admin/quotes${qs(params)}`);
}

export function getQuote(id) {
    return adminFetch(`/api/admin/quotes/${encodeURIComponent(id)}`);
}

export function patchQuote(id, payload) {
    return adminFetch(`/api/admin/quotes/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: payload,
    });
}

export function assignQuote(id, { assignedTo } = {}) {
    return adminFetch(`/api/admin/quotes/${encodeURIComponent(id)}/assign`, {
        method: 'POST',
        body: { assignedTo: assignedTo ?? null },
    });
}

export function addQuoteNote(id, { body }) {
    return adminFetch(`/api/admin/quotes/${encodeURIComponent(id)}/notes`, {
        method: 'POST',
        body: { body },
    });
}

export function replyQuote(id, { to, subject, body }) {
    return adminFetch(`/api/admin/quotes/${encodeURIComponent(id)}/reply`, {
        method: 'POST',
        body: { to, subject, body },
    });
}

export function bulkQuotes(payload) {
    return adminFetch('/api/admin/quotes/bulk', { method: 'POST', body: payload });
}

export function listCareers(params = {}) {
    return adminFetch(`/api/admin/careers${qs(params)}`);
}

export function getCareer(id) {
    return adminFetch(`/api/admin/careers/${encodeURIComponent(id)}`);
}

export function patchCareer(id, payload) {
    return adminFetch(`/api/admin/careers/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: payload,
    });
}

export function assignCareer(id, { assignedTo } = {}) {
    return adminFetch(`/api/admin/careers/${encodeURIComponent(id)}/assign`, {
        method: 'POST',
        body: { assignedTo: assignedTo ?? null },
    });
}

export function addCareerNote(id, { body }) {
    return adminFetch(`/api/admin/careers/${encodeURIComponent(id)}/notes`, {
        method: 'POST',
        body: { body },
    });
}

export function replyCareer(id, { to, subject, body }) {
    return adminFetch(`/api/admin/careers/${encodeURIComponent(id)}/reply`, {
        method: 'POST',
        body: { to, subject, body },
    });
}

export function bulkCareers(payload) {
    return adminFetch('/api/admin/careers/bulk', { method: 'POST', body: payload });
}

/** GET CSV export with credentials + CSRF header; returns a Blob. */
async function exportCsvBlob(path, params = {}) {
    const res = await adminFetch(`${path}${qs(params)}`, {
        raw: true,
        headers: {
            Accept: 'text/csv,*/*',
            'X-CSRF-Token': getCsrf(),
        },
    });
    if (!res.ok) {
        let message = `Export failed (${res.status})`;
        try {
            const text = await res.text();
            if (text) {
                try {
                    const data = JSON.parse(text);
                    message = detailMessage(data, message);
                } catch {
                    /* keep status message */
                }
            }
        } catch {
            /* ignore */
        }
        const err = new Error(message);
        err.status = res.status;
        throw err;
    }
    return res.blob();
}

export function exportEnquiriesCsv(params = {}) {
    return exportCsvBlob('/api/admin/enquiries/export.csv', params);
}

export function exportQuotesCsv(params = {}) {
    return exportCsvBlob('/api/admin/quotes/export.csv', params);
}

export function exportCareersCsv(params = {}) {
    return exportCsvBlob('/api/admin/careers/export.csv', params);
}

export function listJobs(params = {}) {
    return adminFetch(`/api/admin/jobs${qs(params)}`);
}

export function getJob(id) {
    return adminFetch(`/api/admin/jobs/${encodeURIComponent(id)}`);
}

export function createJob(payload) {
    return adminFetch('/api/admin/jobs', { method: 'POST', body: payload });
}

export function updateJob(id, payload) {
    return adminFetch(`/api/admin/jobs/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: payload,
    });
}

export function publishJob(id) {
    return adminFetch(`/api/admin/jobs/${encodeURIComponent(id)}/publish`, {
        method: 'POST',
        body: {},
    });
}

export function unpublishJob(id) {
    return adminFetch(`/api/admin/jobs/${encodeURIComponent(id)}/unpublish`, {
        method: 'POST',
        body: {},
    });
}

export function deleteJob(id) {
    return adminFetch(`/api/admin/jobs/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

export function seedDefaultJobs() {
    return adminFetch('/api/admin/jobs/seed-defaults', {
        method: 'POST',
        body: {},
    });
}

/** Public careers board (no admin cookie required). */
export async function fetchPublicJobs() {
    const res = await fetch(endpoint('/api/careers/jobs'), {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });
    if (!res.ok) {
        const err = new Error(`Failed to load jobs (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return res.json();
}

/** Public job detail by slug. Retries with includeArchived when first response is 404. */
export async function fetchPublicJob(slug) {
    const clean = String(slug || '').trim();
    async function once(path) {
        const res = await fetch(endpoint(path), {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        });
        let data = null;
        const text = await res.text();
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = null;
            }
        }
        return { res, data };
    }

    const primary = await once(`/api/careers/jobs/${encodeURIComponent(clean)}`);
    if (primary.res.ok) return primary.data;

    if (primary.res.status === 404) {
        const archived = await once(
            `/api/careers/jobs/${encodeURIComponent(clean)}${qs({ includeArchived: true })}`
        );
        if (archived.res.ok) return archived.data;
    }

    const err = new Error(`Failed to load job (${primary.res.status})`);
    err.status = primary.res.status;
    throw err;
}
