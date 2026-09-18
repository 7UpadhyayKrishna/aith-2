/**
 * Public blog API — credentials omitted (no session cookies required).
 */

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

function endpoint(path) {
    if (API_BASE) return `${API_BASE}${path}`;
    return path;
}

async function getJson(path) {
    const res = await fetch(endpoint(path), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'omit',
    });
    let data = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }
    if (!res.ok) {
        const err = new Error((data && (data.detail || data.message)) || 'Request failed');
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

/** @returns {{ items, page, limit, total, pages }} */
export function listBlogs(params = {}) {
    return getJson(`/api/blogs${qs(params)}`);
}

/** @returns {object} blog or { redirect, toSlug, path } */
export function getBlogBySlug(slug) {
    return getJson(`/api/blogs/${encodeURIComponent(slug)}`);
}
