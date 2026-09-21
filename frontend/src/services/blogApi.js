/**
 * Public blog API - credentials omitted (no session cookies required).
 */

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

function endpoint(path) {
    if (API_BASE) return `${API_BASE}${path}`;
    return path;
}

function errorMessage(data, fallback) {
    if (!data || typeof data !== 'object') return fallback;
    const detail = data.detail ?? data.message;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length) {
        const first = detail[0];
        if (typeof first === 'string') return first;
        if (first && typeof first.msg === 'string') return first.msg;
    }
    return fallback;
}

async function parseBody(res) {
    const contentType = res.headers.get('content-type') || '';
    const canJson =
        contentType.includes('application/json') ||
        contentType.includes('+json') ||
        contentType === '';

    if (!canJson) {
        try {
            await res.text();
        } catch {
            /* ignore */
        }
        return null;
    }

    try {
        const text = await res.text();
        if (!text || !text.trim()) return null;
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function getJson(path) {
    let res;
    try {
        res = await fetch(endpoint(path), {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'omit',
        });
    } catch {
        const err = new Error('Network error');
        err.status = 0;
        throw err;
    }

    const data = await parseBody(res);

    if (!res.ok) {
        const err = new Error(errorMessage(data, 'Request failed'));
        err.status = res.status;
        err.data = data;
        throw err;
    }
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        const err = new Error('Invalid blog API response');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

function qs(params = {}) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        sp.set(k, String(v));
    });
    const s = sp.toString();
    return s ? `?${s}` : '';
}

/** Swap em/en dashes for plain hyphens in user-facing blog copy */
function plainHyphens(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/\u2014|\u2013/g, '-');
}

function scrubBlogFields(blog) {
    if (!blog || typeof blog !== 'object') return blog;
    const next = { ...blog };
    for (const key of ['title', 'excerpt', 'summary', 'category', 'contentMarkdown', 'contentHtml']) {
        if (typeof next[key] === 'string') next[key] = plainHyphens(next[key]);
    }
    return next;
}

/**
 * Normalize list payload to the public contract:
 * { items: Blog[], page, limit, total, pages }
 * Only `items` is accepted - wrong field names surface as an empty list, not a crash.
 */
function normalizeBlogList(data) {
    const items = Array.isArray(data?.items)
        ? data.items.filter(Boolean).map(scrubBlogFields)
        : [];
    const page = Number(data?.page) > 0 ? Number(data.page) : 1;
    const limit = Number(data?.limit) > 0 ? Number(data.limit) : items.length || 12;
    const total = Number.isFinite(Number(data?.total)) ? Number(data.total) : items.length;
    const pages =
        Number(data?.pages) > 0
            ? Number(data.pages)
            : Math.max(1, Math.ceil(total / Math.max(limit, 1)) || 1);
    return { items, page, limit, total, pages };
}

/** @returns {{ items, page, limit, total, pages }} */
export async function listBlogs(params = {}) {
    const data = await getJson(`/api/blogs${qs(params)}`);
    return normalizeBlogList(data);
}

/**
 * @returns {object} blog or { redirect, toSlug, path }
 * Throws with status 404 when the slug is empty/missing.
 */
export async function getBlogBySlug(slug) {
    const clean = typeof slug === 'string' ? slug.trim() : '';
    if (!clean) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
    }
    const data = await getJson(`/api/blogs/${encodeURIComponent(clean)}`);
    if (data.redirect) {
        if (!data.toSlug) {
            const err = new Error('Not found');
            err.status = 404;
            err.data = data;
            throw err;
        }
        return {
            redirect: true,
            fromSlug: data.fromSlug || clean,
            toSlug: data.toSlug,
            path: data.path || `/blogs/${data.toSlug}`,
        };
    }
    if (!data.slug || !data.title) {
        const err = new Error('Invalid blog API response');
        err.status = 502;
        err.data = data;
        throw err;
    }
    return scrubBlogFields(data);
}
