import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import BlogArticleView from '@/components/blog/BlogArticleView';
import {
    createBlog,
    getBlog,
    updateBlog,
    publishBlog,
    unpublishBlog,
    archiveBlog,
    validateBlog,
    listRevisions,
    restoreRevision,
} from '@/services/adminApi';
import { BLOG_CATEGORIES } from '@/data/blogCategories';
import { createBlogTemplate, syncCoverAndFeatured, suggestInternalLinks } from '@/data/blogTemplate';
import {
    field,
    label,
    btn,
    btnPrimary,
    btnCopper,
    panel,
    sectionTitle,
    statusTone,
    fmtDateTime,
    saveLocalDraft,
    loadLocalDraft,
    clearLocalDraft,
} from './adminUi';

const WEAK_ANCHORS = /^(click here|learn more|read more|here|this|link)$/i;
const PUBLISHING_STATUSES = ['draft', 'review', 'scheduled'];

function slugify(title) {
    return (
        title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 120) || 'untitled'
    );
}

function draftKey(id) {
    return id || 'new';
}

function mergeTemplate(doc = {}) {
    const base = createBlogTemplate();
    const merged = {
        ...base,
        ...doc,
        author: { ...base.author, ...(doc.author || {}) },
        cover: {
            ...base.cover,
            ...(doc.cover || {}),
            image: {
                ...base.cover.image,
                ...((doc.cover && doc.cover.image) || {}),
                ...(doc.featuredImage && !doc.cover?.image?.url
                    ? {
                          url: doc.featuredImage.url || '',
                          alt: doc.featuredImage.alt || '',
                          caption: doc.featuredImage.caption || '',
                      }
                    : {}),
            },
        },
        featuredImage: { ...base.featuredImage, ...(doc.featuredImage || {}) },
        seo: {
            ...base.seo,
            ...(doc.seo || {}),
            ogImage:
                typeof doc.seo?.ogImage === 'string'
                    ? { url: doc.seo.ogImage, alt: '' }
                    : { ...base.seo.ogImage, ...((doc.seo && doc.seo.ogImage) || {}) },
        },
        editorial: { ...base.editorial, ...(doc.editorial || {}) },
        brief: { ...base.brief, ...(doc.brief || {}) },
        searchPerformance: { ...base.searchPerformance, ...(doc.searchPerformance || {}) },
        contentImages: Array.isArray(doc.contentImages) ? doc.contentImages : base.contentImages,
        internalLinks: Array.isArray(doc.internalLinks) ? doc.internalLinks : base.internalLinks,
        sources: Array.isArray(doc.sources) ? doc.sources : base.sources,
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        relatedSlugs: Array.isArray(doc.relatedSlugs) ? doc.relatedSlugs : [],
    };
    return syncCoverAndFeatured(merged);
}

function clientSeoChecks(blog) {
    const checks = [];
    const seo = blog.seo || {};
    const coverImg = blog.cover?.image || {};
    const fi = blog.featuredImage || {};
    const md = blog.contentMarkdown || '';
    const brief = blog.brief || {};
    const add = (code, level, message) => checks.push({ code, level, message });

    if (!(blog.title || '').trim()) add('title', 'ERROR', 'Missing title');
    else add('title', 'PASS', 'Title present');

    const intent = (seo.primaryIntent || brief.primarySearchIntent || '').trim();
    if (intent) add('primary_intent', 'PASS', 'Primary intent specified');
    else add('primary_intent', 'WARNING', 'Primary search intent not specified');

    if ((seo.metaTitle || blog.title || '').trim()) add('meta_title', 'PASS', 'Meta title present');
    else add('meta_title', 'WARNING', 'Missing meta title');

    if (!(seo.metaDescription || blog.excerpt || '').trim()) {
        add('meta_description', 'WARNING', 'Missing meta description');
    } else add('meta_description', 'PASS', 'Meta description present');

    if (!(blog.excerpt || '').trim()) add('excerpt', 'WARNING', 'Missing excerpt');
    else add('excerpt', 'PASS', 'Excerpt present');

    const imgUrl = coverImg.url || fi.url;
    const imgAlt = coverImg.alt || fi.alt;
    if (imgUrl) {
        add('cover_image', 'PASS', 'Cover image set');
        if ((imgAlt || '').trim()) add('cover_alt', 'PASS', 'Cover alt present');
        else add('cover_alt', 'WARNING', 'Cover image missing alt text');
    } else add('cover_image', 'WARNING', 'No cover image');

    if (/^#\s+/m.test(md)) add('body_h1', 'WARNING', 'Body contains an H1');
    else add('body_h1', 'PASS', 'No H1 in article body');

    if (!(blog.author?.name || '').trim()) add('author', 'ERROR', 'Author name required');
    else add('author', 'PASS', 'Author configured');

    const hasMdInternal = /\]\(\/[a-z0-9\-/]+\)/i.test(md);
    const storedLinks = (blog.internalLinks || []).filter((l) => (l.url || '').trim());
    if (hasMdInternal || storedLinks.length) {
        add('internal_links', 'PASS', 'Internal links found');
    } else {
        add('internal_links', 'WARNING', 'No internal links yet');
    }

    const missingAlt = (blog.contentImages || []).filter(
        (img) => img.url && !img.decorative && !(img.alt || '').trim()
    );
    if (missingAlt.length) {
        add('article_image_alt', 'WARNING', `${missingAlt.length} article image(s) missing alt`);
    } else if ((blog.contentImages || []).some((img) => img.url)) {
        add('article_image_alt', 'PASS', 'Article image alt text present');
    }

    return checks;
}

function checkLevelClass(level) {
    if (level === 'PASS') return 'text-emerald-800';
    if (level === 'ERROR') return 'text-red-700';
    return 'text-copper';
}

function formatSavedClock(date) {
    if (!date) return '';
    try {
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

function csvToList(value, max = 20) {
    return String(value || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, max);
}

function listToCsv(arr) {
    return (arr || []).join(', ');
}

function emptyContentImage(index = 1) {
    return {
        id: `image-${index}`,
        url: '',
        alt: '',
        caption: '',
        credit: '',
        placement: 'inline',
        decorative: false,
    };
}

function emptyInternalLink() {
    return { anchor: '', url: '', reason: '' };
}

function emptySource() {
    return { label: '', url: '' };
}

export default function AdminBlogEditor() {
    const { id } = useParams();
    const isNew = !id || id === 'new';
    const navigate = useNavigate();
    const { setPageTitle, setHeaderActions } = useOutletContext();

    const [blog, setBlog] = useState(() => mergeTemplate());
    const [blogId, setBlogId] = useState(isNew ? null : id);
    const [tab, setTab] = useState('write');
    const [jsonText, setJsonText] = useState('');
    const [jsonAppliedSnapshot, setJsonAppliedSnapshot] = useState('');
    const [seoChecks, setSeoChecks] = useState([]);
    const [linkSuggestions, setLinkSuggestions] = useState([]);
    const [overlaps, setOverlaps] = useState([]);
    const [revisions, setRevisions] = useState([]);
    const [tagsInput, setTagsInput] = useState('');
    const [relatedInput, setRelatedInput] = useState('');
    const [supportingKwInput, setSupportingKwInput] = useState('');
    const [supportingTopicsInput, setSupportingTopicsInput] = useState('');
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveFailed, setSaveFailed] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(!isNew);
    const [slugLocked, setSlugLocked] = useState(!isNew);
    const [validateErrors, setValidateErrors] = useState([]);
    const [localDraftNotice, setLocalDraftNotice] = useState('');

    const dirtyRef = useRef(false);
    const idleTimer = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        dirtyRef.current = dirty;
    }, [dirty]);

    useEffect(() => {
        const onBeforeUnload = (e) => {
            if (dirtyRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, []);

    const markDirty = useCallback(() => {
        setDirty(true);
        setSaveFailed(false);
        setStatusMsg('');
        setError('');
    }, []);

    const hydrateFromBlog = useCallback((doc, checks, suggestions, overlapList) => {
        const next = mergeTemplate(doc);
        setBlog(next);
        setTagsInput(listToCsv(next.tags));
        setRelatedInput(listToCsv(next.relatedSlugs));
        setSupportingKwInput(listToCsv(next.seo?.supportingKeywords));
        setSupportingTopicsInput(listToCsv(next.brief?.supportingTopics));
        setSeoChecks(checks || clientSeoChecks(next));
        setLinkSuggestions(suggestions || []);
        setOverlaps(overlapList || []);
        const snap = JSON.stringify(next, null, 2);
        setJsonText(snap);
        setJsonAppliedSnapshot(snap);
        setDirty(false);
        setSaveFailed(false);
    }, []);

    useEffect(() => {
        if (isNew) {
            const tpl = mergeTemplate();
            const local = loadLocalDraft('new');
            if (local?.payload) {
                hydrateFromBlog(local.payload, clientSeoChecks(local.payload), [], []);
                setLocalDraftNotice('Restored unsaved local draft from this browser session.');
                setDirty(true);
            } else {
                hydrateFromBlog(tpl, clientSeoChecks(tpl), [], []);
            }
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await getBlog(id);
                if (cancelled) return;
                setBlogId(res.blog.id);
                const local = loadLocalDraft(res.blog.id);
                const serverUpdated = res.blog.updatedAt ? new Date(res.blog.updatedAt).getTime() : 0;
                const preferLocal =
                    local?.payload && local.savedAt && (!serverUpdated || local.savedAt > serverUpdated);
                if (preferLocal) {
                    hydrateFromBlog(
                        local.payload,
                        res.seoChecks,
                        res.linkSuggestions,
                        res.overlaps
                    );
                    setLocalDraftNotice('Restored newer unsaved local draft from this browser session.');
                    setDirty(true);
                } else {
                    hydrateFromBlog(res.blog, res.seoChecks, res.linkSuggestions, res.overlaps);
                    if (local) clearLocalDraft(res.blog.id);
                }
                const revs = await listRevisions(id);
                if (!cancelled) setRevisions(revs.items || []);
            } catch (err) {
                if (cancelled) return;
                if (err.status === 401) {
                    setError('Your admin session expired. Sign in again to continue editing.');
                } else {
                    setError(err.message || 'Failed to load blog');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, isNew, hydrateFromBlog]);

    useEffect(() => {
        setPageTitle(isNew ? 'New blog' : blog.title || 'Edit blog');
        setHeaderActions(null);
        return () => setHeaderActions(null);
    }, [setPageTitle, setHeaderActions, isNew, blog.title]);

    function setPath(obj, path, value) {
        const parts = path.split('.');
        let cur = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') {
                cur[parts[i]] = {};
            }
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
    }

    function patch(path, value) {
        setBlog((prev) => {
            const next = structuredClone(prev);
            setPath(next, path, value);
            if (path === 'title' && !slugLocked && isNew) {
                next.slug = slugify(value);
            }
            if (path === 'title' && !(next.cover?.headline || '').trim()) {
                next.cover = { ...(next.cover || {}), headline: value };
            }
            setSeoChecks(clientSeoChecks(next));
            return next;
        });
        markDirty();
    }

    /** Patch brief + editorial mirrors in one state update */
    function patchBriefEditorial(fieldName, value) {
        setBlog((prev) => {
            const next = structuredClone(prev);
            if (!next.brief) next.brief = {};
            if (!next.editorial) next.editorial = {};
            next.brief[fieldName] = value;
            next.editorial[fieldName] = value;
            setSeoChecks(clientSeoChecks(next));
            return next;
        });
        markDirty();
    }

    const buildPayload = useCallback(() => {
        const tags = csvToList(tagsInput, 20);
        const relatedSlugs = csvToList(relatedInput, 20);
        const supportingKeywords = csvToList(supportingKwInput, 20);
        const supportingTopics = csvToList(supportingTopicsInput, 20);

        const raw = {
            ...blog,
            tags,
            relatedSlugs,
            slug: blog.slug || slugify(blog.title),
            seo: {
                ...(blog.seo || {}),
                supportingKeywords,
                ogImage:
                    typeof blog.seo?.ogImage === 'string'
                        ? { url: blog.seo.ogImage, alt: '' }
                        : blog.seo?.ogImage || { url: '', alt: '' },
            },
            brief: {
                ...(blog.brief || {}),
                supportingTopics,
            },
            sources: (blog.sources || [])
                .filter((s) => (s.label || '').trim() || (s.url || '').trim())
                .slice(0, 30),
            internalLinks: (blog.internalLinks || [])
                .filter((l) => (l.anchor || '').trim() || (l.url || '').trim() || (l.reason || '').trim())
                .slice(0, 30),
            contentImages: (blog.contentImages || []).slice(0, 30),
        };
        return syncCoverAndFeatured(raw);
    }, [blog, tagsInput, relatedInput, supportingKwInput, supportingTopicsInput]);

    const persistLocalDraft = useCallback(
        (payload) => {
            saveLocalDraft(draftKey(blogId), payload);
        },
        [blogId]
    );

    useEffect(() => {
        if (!dirty) return undefined;
        const t = setTimeout(() => {
            try {
                persistLocalDraft(buildPayload());
            } catch {
                /* ignore */
            }
        }, 800);
        return () => clearTimeout(t);
    }, [dirty, blog, tagsInput, relatedInput, supportingKwInput, supportingTopicsInput, buildPayload, persistLocalDraft]);

    const save = useCallback(
        async ({ quiet = false } = {}) => {
            const payload = buildPayload();
            setSaving(true);
            setError('');
            setSaveFailed(false);
            try {
                if (!blogId) {
                    const created = await createBlog(payload);
                    setBlogId(created.id);
                    hydrateFromBlog(created, clientSeoChecks(created), linkSuggestions, overlaps);
                    setLastSavedAt(new Date());
                    setStatusMsg(quiet ? '' : 'Draft created');
                    setDirty(false);
                    clearLocalDraft('new');
                    clearLocalDraft(created.id);
                    navigate(`/admin/blogs/${created.id}`, { replace: true });
                    return created;
                }
                const res = await updateBlog(blogId, payload);
                hydrateFromBlog(
                    res.blog,
                    res.seoChecks || clientSeoChecks(res.blog),
                    res.linkSuggestions || linkSuggestions,
                    res.overlaps || overlaps
                );
                setValidateErrors(res.errors || []);
                setLastSavedAt(new Date());
                setStatusMsg(quiet ? '' : 'Saved');
                setDirty(false);
                clearLocalDraft(blogId);
                const revs = await listRevisions(blogId);
                setRevisions(revs.items || []);
                return res.blog;
            } catch (err) {
                const errs = err.data?.detail?.errors || err.data?.errors;
                if (errs) setValidateErrors(errs);
                setSaveFailed(true);
                if (err.status === 401) {
                    setError('Your admin session expired. Sign in again — your content is still in the editor.');
                } else {
                    setError(err.message || 'Save failed');
                }
                persistLocalDraft(payload);
                throw err;
            } finally {
                setSaving(false);
            }
        },
        [blogId, buildPayload, hydrateFromBlog, linkSuggestions, overlaps, navigate, persistLocalDraft]
    );

    useEffect(() => {
        if (!dirty || !blogId) return undefined;
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
            save({ quiet: true }).catch(() => {});
        }, 3000);
        return () => clearTimeout(idleTimer.current);
    }, [dirty, blogId, blog, tagsInput, relatedInput, supportingKwInput, supportingTopicsInput, save]);

    const saveStatusLabel = useMemo(() => {
        if (saving) return 'Saving…';
        if (saveFailed) return 'Save failed';
        if (dirty) return 'Unsaved changes';
        if (lastSavedAt) return `Saved ${formatSavedClock(lastSavedAt)}`;
        return '';
    }, [saving, saveFailed, dirty, lastSavedAt]);

    const jsonNotApplied = useMemo(() => {
        if (tab !== 'json') return false;
        return jsonText.trim() !== jsonAppliedSnapshot.trim();
    }, [tab, jsonText, jsonAppliedSnapshot]);

    const combinedSuggestions = useMemo(() => {
        const fromApi = linkSuggestions || [];
        const fromTpl = suggestInternalLinks(blog);
        return [...new Set([...fromApi, ...fromTpl])];
    }, [linkSuggestions, blog]);

    const checks = useMemo(
        () => (seoChecks.length ? seoChecks : clientSeoChecks(blog)),
        [seoChecks, blog]
    );

    const previewBlog = useMemo(() => {
        const payload = buildPayload();
        return {
            ...payload,
            featuredImage: payload.featuredImage || payload.cover?.image,
        };
    }, [buildPayload]);

    async function handlePublish() {
        try {
            let publishId = blogId;
            if (dirty || !publishId) {
                const saved = await save();
                publishId = saved?.id || blogId;
            }
            if (!publishId) return;
            try {
                const res = await publishBlog(publishId, {});
                hydrateFromBlog(
                    res.blog,
                    res.seoChecks || seoChecks,
                    res.linkSuggestions || linkSuggestions,
                    res.overlaps || overlaps
                );
                setStatusMsg(res.blog.status === 'scheduled' ? 'Scheduled' : 'Published');
                setLastSavedAt(new Date());
            } catch (err) {
                if (err.status === 409 && err.data?.requiresOverride) {
                    const msgs = (err.data.errors || [])
                        .filter((e) => e.level === 'warning')
                        .map((e) => e.message)
                        .join('\n');
                    if (window.confirm(`Warnings:\n${msgs}\n\nOverride and publish?`)) {
                        const res = await publishBlog(publishId, { overrideWarnings: true });
                        hydrateFromBlog(
                            res.blog,
                            res.seoChecks || seoChecks,
                            res.linkSuggestions || linkSuggestions,
                            res.overlaps || overlaps
                        );
                        setStatusMsg('Published (warnings overridden)');
                        setLastSavedAt(new Date());
                    }
                } else if (err.status === 401) {
                    setError('Your admin session expired. Sign in again to publish.');
                } else {
                    const errs = err.data?.detail?.errors || err.data?.errors;
                    if (errs) setValidateErrors(errs);
                    setError(err.message || 'Publish failed');
                }
            }
        } catch {
            /* save error already set */
        }
    }

    async function handleUnpublish() {
        if (!blogId) return;
        if (!window.confirm('Unpublish this article? It will leave the public site.')) return;
        try {
            const res = await unpublishBlog(blogId);
            hydrateFromBlog(res.blog, seoChecks, linkSuggestions, overlaps);
            setStatusMsg('Unpublished');
        } catch (err) {
            if (err.status === 401) setError('Your admin session expired. Sign in again.');
            else setError(err.message || 'Unpublish failed');
        }
    }

    async function handleArchive() {
        if (!blogId) return;
        if (!window.confirm('Archive this article? Prefer archive over deletion for public URLs.')) return;
        try {
            const res = await archiveBlog(blogId);
            hydrateFromBlog(res.blog, seoChecks, linkSuggestions, overlaps);
            setStatusMsg('Archived');
        } catch (err) {
            if (err.status === 401) setError('Your admin session expired. Sign in again.');
            else setError(err.message || 'Archive failed');
        }
    }

    async function runValidate(forPublish = false) {
        try {
            const res = await validateBlog(buildPayload(), forPublish);
            setValidateErrors(res.errors || []);
            if (res.seoChecks) setSeoChecks(res.seoChecks);
            if (res.linkSuggestions) setLinkSuggestions(res.linkSuggestions);
            if (res.overlaps) setOverlaps(res.overlaps);
            setStatusMsg(res.ok ? 'Validation passed' : 'Validation found issues');
            return res;
        } catch (err) {
            if (err.status === 401) setError('Your admin session expired. Sign in again.');
            else setError(err.message || 'Validate failed');
            return null;
        }
    }

    function switchTab(next) {
        if (next === 'json' && tab !== 'json') {
            const snap = JSON.stringify(buildPayload(), null, 2);
            setJsonText(snap);
            setJsonAppliedSnapshot(snap);
        }
        setTab(next);
    }

    function applyJson() {
        try {
            const parsed = JSON.parse(jsonText);
            const next = mergeTemplate(parsed);
            hydrateFromBlog(next, clientSeoChecks(next), linkSuggestions, overlaps);
            setDirty(true);
            setStatusMsg('JSON applied to editor');
            setTab('write');
        } catch {
            setError('Invalid JSON — fix syntax before applying');
        }
    }

    function formatJson() {
        try {
            const parsed = JSON.parse(jsonText);
            setJsonText(JSON.stringify(parsed, null, 2));
            setStatusMsg('JSON formatted');
        } catch {
            setError('Invalid JSON — cannot format');
        }
    }

    function resetJsonTemplate() {
        if (!window.confirm('Reset JSON to the blank blog template? Unapplied JSON edits will be lost.')) {
            return;
        }
        const snap = JSON.stringify(createBlogTemplate(), null, 2);
        setJsonText(snap);
        setStatusMsg('Template loaded into JSON (not yet applied)');
    }

    async function importJsonFile(file) {
        const text = await file.text();
        setJsonText(text);
        setTab('json');
        setStatusMsg('JSON imported — review and Apply to editor');
    }

    function downloadJson() {
        const blob = new Blob([jsonText || JSON.stringify(buildPayload(), null, 2)], {
            type: 'application/json',
        });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${blog.slug || 'blog'}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    async function copyJson() {
        await navigator.clipboard.writeText(jsonText || JSON.stringify(buildPayload(), null, 2));
        setStatusMsg('Copied JSON');
    }

    function updateContentImage(index, key, value) {
        setBlog((prev) => {
            const next = structuredClone(prev);
            const list = [...(next.contentImages || [])];
            list[index] = { ...list[index], [key]: value };
            next.contentImages = list;
            setSeoChecks(clientSeoChecks(next));
            return next;
        });
        markDirty();
    }

    function addContentImage() {
        setBlog((prev) => {
            const next = structuredClone(prev);
            const list = [...(next.contentImages || [])];
            list.push(emptyContentImage(list.length + 1));
            next.contentImages = list;
            return next;
        });
        markDirty();
    }

    function removeContentImage(index) {
        setBlog((prev) => {
            const next = structuredClone(prev);
            next.contentImages = (next.contentImages || []).filter((_, i) => i !== index);
            setSeoChecks(clientSeoChecks(next));
            return next;
        });
        markDirty();
    }

    function copyImageMarkdown(img) {
        const alt = img.alt || 'image';
        const md = img.id ? `![${alt}](media:${img.id})` : `![${alt}](${img.url || ''})`;
        navigator.clipboard.writeText(md).then(() => setStatusMsg('Markdown copied'));
    }

    function updateInternalLink(index, key, value) {
        setBlog((prev) => {
            const next = structuredClone(prev);
            const list = [...(next.internalLinks || [])];
            list[index] = { ...list[index], [key]: value };
            next.internalLinks = list;
            setSeoChecks(clientSeoChecks(next));
            return next;
        });
        markDirty();
    }

    function addInternalLink(seed = null) {
        setBlog((prev) => {
            const next = structuredClone(prev);
            next.internalLinks = [...(next.internalLinks || []), seed || emptyInternalLink()];
            return next;
        });
        markDirty();
    }

    function removeInternalLink(index) {
        setBlog((prev) => {
            const next = structuredClone(prev);
            next.internalLinks = (next.internalLinks || []).filter((_, i) => i !== index);
            return next;
        });
        markDirty();
    }

    function updateSource(index, key, value) {
        setBlog((prev) => {
            const next = structuredClone(prev);
            const list = [...(next.sources || [])];
            list[index] = { ...list[index], [key]: value };
            next.sources = list;
            return next;
        });
        markDirty();
    }

    function addSource() {
        setBlog((prev) => {
            const next = structuredClone(prev);
            next.sources = [...(next.sources || []), emptySource()];
            return next;
        });
        markDirty();
    }

    function removeSource(index) {
        setBlog((prev) => {
            const next = structuredClone(prev);
            next.sources = (next.sources || []).filter((_, i) => i !== index);
            return next;
        });
        markDirty();
    }

    const isPublished = blog.status === 'published';
    const coverImage = blog.cover?.image || {};

    if (loading) {
        return (
            <p className="font-mono text-[11px] uppercase tracking-widest text-mute" data-testid="admin-blog-editor">
                Loading…
            </p>
        );
    }

    return (
        <div className="space-y-4 font-sans" data-testid="admin-blog-editor">
            {/* Header toolbar */}
            <div className="flex flex-wrap items-center gap-2 justify-between border-b border-graphite/10 pb-3">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <Link to="/admin/blogs" className={`${btn} shrink-0`}>
                        ← Blogs
                    </Link>
                    <span
                        className={`font-mono text-[10px] tracking-[0.16em] uppercase ${statusTone(blog.status)}`}
                    >
                        {blog.status || 'draft'}
                    </span>
                    {saveStatusLabel && (
                        <span
                            className={`font-mono text-[9px] tracking-[0.14em] uppercase ${
                                saveFailed ? 'text-red-700' : dirty ? 'text-copper' : 'text-mute'
                            }`}
                        >
                            {saveStatusLabel}
                        </span>
                    )}
                    {statusMsg && (
                        <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-mute truncate max-w-[14rem]">
                            {statusMsg}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex border border-graphite/20">
                        {[
                            ['write', 'Write'],
                            ['json', 'JSON'],
                            ['preview', 'Preview'],
                        ].map(([key, lab]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => switchTab(key)}
                                className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase ${
                                    tab === key ? 'bg-forest text-ivory' : 'bg-white text-mute hover:text-graphite'
                                }`}
                            >
                                {lab}
                            </button>
                        ))}
                    </div>
                    <button type="button" className={btnPrimary} disabled={saving} onClick={() => save().catch(() => {})}>
                        Save draft
                    </button>
                    {isPublished ? (
                        <>
                            <button type="button" className={btnCopper} disabled={saving} onClick={handlePublish}>
                                Update
                            </button>
                            {blog.slug && (
                                <a
                                    href={`/blogs/${blog.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={btn}
                                >
                                    View live
                                </a>
                            )}
                            <button type="button" className={btn} onClick={handleUnpublish}>
                                Unpublish
                            </button>
                            {blog.status !== 'archived' && (
                                <button type="button" className={btn} onClick={handleArchive}>
                                    Archive
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button type="button" className={btnCopper} disabled={saving} onClick={handlePublish}>
                                Publish
                            </button>
                            {blogId && blog.status !== 'archived' && (
                                <button type="button" className={btn} onClick={handleArchive}>
                                    Archive
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {error && <p className="text-sm text-copper">{error}</p>}
            {localDraftNotice && (
                <p className="font-mono text-[10px] tracking-wide text-mute">{localDraftNotice}</p>
            )}

            {tab === 'json' && (
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 items-center">
                        <button type="button" className={btn} onClick={formatJson}>
                            Format
                        </button>
                        <button
                            type="button"
                            className={btn}
                            onClick={async () => {
                                const res = await runValidate(false);
                                if (res?.normalized) {
                                    setJsonText(JSON.stringify(res.normalized, null, 2));
                                }
                            }}
                        >
                            Validate
                        </button>
                        <button type="button" className={btnPrimary} onClick={applyJson}>
                            Apply to editor
                        </button>
                        <button type="button" className={btn} onClick={resetJsonTemplate}>
                            Reset template
                        </button>
                        <button type="button" className={btn} onClick={copyJson}>
                            Copy JSON
                        </button>
                        <button type="button" className={btn} onClick={() => fileInputRef.current?.click()}>
                            Import
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/json,.json"
                            className="sr-only"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) importJsonFile(f);
                                e.target.value = '';
                            }}
                        />
                        <button type="button" className={btn} onClick={downloadJson}>
                            Export
                        </button>
                    </div>
                    {jsonNotApplied && (
                        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-copper">
                            JSON changes not applied.
                        </p>
                    )}
                    {validateErrors.length > 0 && (
                        <ul className={`${panel} p-3 space-y-1`}>
                            {validateErrors.map((e, i) => (
                                <li key={i} className="text-xs text-copper font-mono">
                                    <span className="text-mute">{e.path || '—'}</span>: {e.message}
                                </li>
                            ))}
                        </ul>
                    )}
                    <textarea
                        value={jsonText}
                        onChange={(e) => {
                            setJsonText(e.target.value);
                            markDirty();
                        }}
                        rows={28}
                        spellCheck={false}
                        className={`${field} font-mono text-xs leading-relaxed`}
                    />
                </div>
            )}

            {tab === 'preview' && (
                <div className="bg-ivory border border-graphite/10 px-5 py-10 lg:px-12">
                    <p className="mb-6 font-mono text-[10px] tracking-[0.2em] uppercase text-copper">
                        Live editor preview · not public
                    </p>
                    <BlogArticleView blog={previewBlog} />
                </div>
            )}

            {tab === 'write' && (
                <div className="grid lg:grid-cols-10 gap-5 items-start">
                    {/* Left ~70% */}
                    <div className="lg:col-span-7 space-y-4">
                        <div>
                            <label className={label} htmlFor="blog-title">
                                Title
                            </label>
                            <input
                                id="blog-title"
                                className={field}
                                value={blog.title}
                                onChange={(e) => patch('title', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="blog-subtitle">
                                Subtitle
                            </label>
                            <input
                                id="blog-subtitle"
                                className={field}
                                value={blog.subtitle || ''}
                                onChange={(e) => patch('subtitle', e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className={`${label} !mb-0`} htmlFor="blog-slug">
                                    Slug
                                </label>
                                {!isNew && (
                                    <button
                                        type="button"
                                        className="font-mono text-[9px] uppercase tracking-widest text-mute hover:text-copper"
                                        onClick={() => setSlugLocked((v) => !v)}
                                    >
                                        {slugLocked ? 'Unlock' : 'Lock'}
                                    </button>
                                )}
                            </div>
                            <input
                                id="blog-slug"
                                className={`${field} font-mono text-sm`}
                                value={blog.slug}
                                disabled={slugLocked && !isNew}
                                onChange={(e) => {
                                    setSlugLocked(true);
                                    patch('slug', e.target.value);
                                }}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="blog-excerpt">
                                Excerpt
                            </label>
                            <textarea
                                id="blog-excerpt"
                                rows={3}
                                className={field}
                                value={blog.excerpt}
                                onChange={(e) => patch('excerpt', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="blog-md">
                                Content (Markdown)
                            </label>
                            <textarea
                                id="blog-md"
                                rows={24}
                                className={`${field} font-mono text-[13px] leading-relaxed`}
                                value={blog.contentMarkdown}
                                onChange={(e) => patch('contentMarkdown', e.target.value)}
                                spellCheck
                            />
                            <p className="mt-1 font-mono text-[9px] text-mute tracking-wide">
                                Page template supplies the H1 — start body sections with ##
                            </p>
                        </div>
                    </div>

                    {/* Right ~30% sticky */}
                    <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-4 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
                        {/* Publishing */}
                        <section className={`${panel} p-3 space-y-3`}>
                            <p className={sectionTitle}>Publishing</p>
                            <div>
                                <label className={label} htmlFor="blog-status">
                                    Status
                                </label>
                                <select
                                    id="blog-status"
                                    className={field}
                                    value={PUBLISHING_STATUSES.includes(blog.status) ? blog.status : 'draft'}
                                    disabled={isPublished || blog.status === 'archived'}
                                    onChange={(e) => patch('status', e.target.value)}
                                >
                                    {PUBLISHING_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                {(isPublished || blog.status === 'archived') && (
                                    <p className="mt-1 font-mono text-[9px] text-mute">
                                        Current: {blog.status}
                                    </p>
                                )}
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={!!blog.featured}
                                    onChange={(e) => patch('featured', e.target.checked)}
                                />
                                Featured
                            </label>
                            <div>
                                <label className={label} htmlFor="blog-scheduled">
                                    Scheduled at (ISO)
                                </label>
                                <input
                                    id="blog-scheduled"
                                    className={`${field} font-mono text-xs`}
                                    value={blog.scheduledAt || ''}
                                    onChange={(e) => patch('scheduledAt', e.target.value || null)}
                                    placeholder="2026-10-01T09:00:00Z"
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="blog-cat">
                                    Category
                                </label>
                                <select
                                    id="blog-cat"
                                    className={field}
                                    value={blog.category}
                                    onChange={(e) => patch('category', e.target.value)}
                                >
                                    {BLOG_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={label} htmlFor="blog-tags">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    id="blog-tags"
                                    className={field}
                                    value={tagsInput}
                                    onChange={(e) => {
                                        setTagsInput(e.target.value);
                                        markDirty();
                                    }}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="author-name">
                                    Author name
                                </label>
                                <input
                                    id="author-name"
                                    className={field}
                                    value={blog.author?.name || ''}
                                    onChange={(e) => patch('author.name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="author-type">
                                    Author type
                                </label>
                                <select
                                    id="author-type"
                                    className={field}
                                    value={blog.author?.type || 'Organization'}
                                    onChange={(e) => patch('author.type', e.target.value)}
                                >
                                    <option value="Organization">Organization</option>
                                    <option value="Person">Person</option>
                                </select>
                            </div>
                        </section>

                        {/* Cover Image */}
                        <section className={`${panel} p-3 space-y-3`}>
                            <p className={sectionTitle}>Cover Image</p>
                            <p className="font-mono text-[9px] text-mute leading-relaxed">
                                Recommended 1600×900; avoid logo/generic stock. Synced to featuredImage on save.
                            </p>
                            {coverImage.url ? (
                                <img
                                    src={coverImage.url}
                                    alt={coverImage.alt || ''}
                                    className="w-full max-h-36 object-cover border border-graphite/10"
                                />
                            ) : null}
                            {['url', 'alt', 'caption', 'credit'].map((k) => (
                                <div key={k}>
                                    <label className={label} htmlFor={`cover-${k}`}>
                                        {k}
                                    </label>
                                    <input
                                        id={`cover-${k}`}
                                        className={field}
                                        value={coverImage[k] || ''}
                                        onChange={(e) => patch(`cover.image.${k}`, e.target.value)}
                                    />
                                </div>
                            ))}
                        </section>

                        {/* SEO */}
                        <section className={`${panel} p-3 space-y-3`}>
                            <p className={sectionTitle}>SEO</p>
                            <div>
                                <label className={label} htmlFor="seo-primaryIntent">
                                    Primary intent
                                </label>
                                <input
                                    id="seo-primaryIntent"
                                    className={field}
                                    value={blog.seo?.primaryIntent || ''}
                                    onChange={(e) => patch('seo.primaryIntent', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="seo-primaryKeyword">
                                    Primary keyword
                                </label>
                                <input
                                    id="seo-primaryKeyword"
                                    className={field}
                                    value={blog.seo?.primaryKeyword || ''}
                                    onChange={(e) => patch('seo.primaryKeyword', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="seo-supportingKeywords">
                                    Supporting keywords
                                </label>
                                <input
                                    id="seo-supportingKeywords"
                                    className={field}
                                    value={supportingKwInput}
                                    onChange={(e) => {
                                        setSupportingKwInput(e.target.value);
                                        markDirty();
                                    }}
                                />
                            </div>
                            {[
                                ['metaTitle', 'Meta title'],
                                ['metaDescription', 'Meta description'],
                                ['canonicalUrl', 'Canonical URL'],
                                ['ogTitle', 'OG title'],
                                ['ogDescription', 'OG description'],
                            ].map(([k, lab]) => (
                                <div key={k}>
                                    <label className={label} htmlFor={`seo-${k}`}>
                                        {lab}
                                    </label>
                                    <input
                                        id={`seo-${k}`}
                                        className={field}
                                        value={blog.seo?.[k] || ''}
                                        onChange={(e) =>
                                            patch(`seo.${k}`, e.target.value || (k === 'canonicalUrl' ? null : ''))
                                        }
                                    />
                                </div>
                            ))}
                            <div>
                                <label className={label} htmlFor="seo-ogImage-url">
                                    OG image URL
                                </label>
                                <input
                                    id="seo-ogImage-url"
                                    className={field}
                                    value={
                                        typeof blog.seo?.ogImage === 'string'
                                            ? blog.seo.ogImage
                                            : blog.seo?.ogImage?.url || ''
                                    }
                                    onChange={(e) =>
                                        patch('seo.ogImage', {
                                            ...(typeof blog.seo?.ogImage === 'object' ? blog.seo.ogImage : {}),
                                            url: e.target.value,
                                            alt:
                                                typeof blog.seo?.ogImage === 'object'
                                                    ? blog.seo.ogImage?.alt || ''
                                                    : '',
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="seo-ogImage-alt">
                                    OG image alt
                                </label>
                                <input
                                    id="seo-ogImage-alt"
                                    className={field}
                                    value={
                                        typeof blog.seo?.ogImage === 'object' ? blog.seo?.ogImage?.alt || '' : ''
                                    }
                                    onChange={(e) =>
                                        patch('seo.ogImage', {
                                            url:
                                                typeof blog.seo?.ogImage === 'string'
                                                    ? blog.seo.ogImage
                                                    : blog.seo?.ogImage?.url || '',
                                            alt: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={blog.seo?.index !== false}
                                    onChange={(e) => patch('seo.index', e.target.checked)}
                                />
                                Index
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={blog.seo?.follow !== false}
                                    onChange={(e) => patch('seo.follow', e.target.checked)}
                                />
                                Follow
                            </label>
                        </section>

                        {/* Content Brief */}
                        <section className={`${panel} p-3 space-y-3`}>
                            <p className="font-serif text-lg text-forest tracking-tight">Content Brief</p>
                            <p className={sectionTitle}>Internal only</p>
                            <div>
                                <label className={label} htmlFor="brief-intent">
                                    Primary search intent
                                </label>
                                <input
                                    id="brief-intent"
                                    className={field}
                                    value={blog.brief?.primarySearchIntent || ''}
                                    onChange={(e) => patch('brief.primarySearchIntent', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="brief-kw">
                                    Primary keyword
                                </label>
                                <input
                                    id="brief-kw"
                                    className={field}
                                    value={blog.brief?.primaryKeyword || ''}
                                    onChange={(e) => patch('brief.primaryKeyword', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="brief-topics">
                                    Supporting topics
                                </label>
                                <input
                                    id="brief-topics"
                                    className={field}
                                    value={supportingTopicsInput}
                                    onChange={(e) => {
                                        setSupportingTopicsInput(e.target.value);
                                        markDirty();
                                    }}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="brief-audience">
                                    Audience
                                </label>
                                <input
                                    id="brief-audience"
                                    className={field}
                                    value={blog.brief?.audience || blog.editorial?.audience || ''}
                                    onChange={(e) => patchBriefEditorial('audience', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="brief-question">
                                    Reader question
                                </label>
                                <textarea
                                    id="brief-question"
                                    rows={2}
                                    className={field}
                                    value={blog.brief?.readerQuestion || blog.editorial?.readerQuestion || ''}
                                    onChange={(e) => patchBriefEditorial('readerQuestion', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="brief-service">
                                    Recommended service link
                                </label>
                                <input
                                    id="brief-service"
                                    className={`${field} font-mono text-xs`}
                                    value={
                                        blog.brief?.recommendedServiceLink ||
                                        blog.editorial?.recommendedServiceLink ||
                                        ''
                                    }
                                    onChange={(e) =>
                                        patchBriefEditorial('recommendedServiceLink', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="brief-industry">
                                    Recommended industry link
                                </label>
                                <input
                                    id="brief-industry"
                                    className={`${field} font-mono text-xs`}
                                    value={
                                        blog.brief?.recommendedIndustryLink ||
                                        blog.editorial?.recommendedIndustryLink ||
                                        ''
                                    }
                                    onChange={(e) =>
                                        patchBriefEditorial('recommendedIndustryLink', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="brief-competitor">
                                    Competitor notes
                                </label>
                                <textarea
                                    id="brief-competitor"
                                    rows={2}
                                    className={field}
                                    value={blog.brief?.competitorNotes || blog.editorial?.competitorNotes || ''}
                                    onChange={(e) => patchBriefEditorial('competitorNotes', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="brief-author-notes">
                                    Author notes
                                </label>
                                <textarea
                                    id="brief-author-notes"
                                    rows={2}
                                    className={field}
                                    value={blog.brief?.authorNotes || blog.editorial?.authorNotes || ''}
                                    onChange={(e) => patchBriefEditorial('authorNotes', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="ed-last-reviewed">
                                    Last reviewed at
                                </label>
                                <input
                                    id="ed-last-reviewed"
                                    className={`${field} font-mono text-xs`}
                                    value={blog.editorial?.lastReviewedAt || ''}
                                    onChange={(e) => patch('editorial.lastReviewedAt', e.target.value || null)}
                                    placeholder="ISO date"
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="ed-next-review">
                                    Next review at
                                </label>
                                <input
                                    id="ed-next-review"
                                    className={`${field} font-mono text-xs`}
                                    value={blog.editorial?.nextReviewAt || ''}
                                    onChange={(e) => patch('editorial.nextReviewAt', e.target.value || null)}
                                    placeholder="ISO date"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={!!blog.editorial?.needsRefresh}
                                    onChange={(e) => patch('editorial.needsRefresh', e.target.checked)}
                                />
                                Needs refresh
                            </label>
                        </section>

                        {/* Internal Links */}
                        <section className={`${panel} p-3 space-y-3`}>
                            <div className="flex items-center justify-between gap-2">
                                <p className={sectionTitle}>Internal Links</p>
                                <button type="button" className={btn} onClick={() => addInternalLink()}>
                                    Add
                                </button>
                            </div>
                            <p className="font-mono text-[9px] text-mute leading-relaxed">
                                Prefer descriptive anchors — avoid “click here” / “learn more”.
                            </p>
                            {(blog.internalLinks || []).map((link, i) => {
                                const weak = WEAK_ANCHORS.test((link.anchor || '').trim());
                                return (
                                    <div key={i} className="space-y-2 border-t border-graphite/10 pt-2">
                                        <input
                                            className={field}
                                            placeholder="Anchor text"
                                            value={link.anchor || ''}
                                            onChange={(e) => updateInternalLink(i, 'anchor', e.target.value)}
                                        />
                                        {weak && (
                                            <p className="font-mono text-[9px] text-copper">
                                                Prefer a descriptive anchor
                                            </p>
                                        )}
                                        <input
                                            className={`${field} font-mono text-xs`}
                                            placeholder="/path"
                                            value={link.url || ''}
                                            onChange={(e) => updateInternalLink(i, 'url', e.target.value)}
                                        />
                                        <input
                                            className={field}
                                            placeholder="Reason"
                                            value={link.reason || ''}
                                            onChange={(e) => updateInternalLink(i, 'reason', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className={btn}
                                            onClick={() => removeInternalLink(i)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })}
                            {combinedSuggestions.length > 0 && (
                                <div className="pt-2 border-t border-graphite/10">
                                    <p className={`${sectionTitle} mb-2`}>Suggestions</p>
                                    <ul className="space-y-1">
                                        {combinedSuggestions.map((href) => (
                                            <li key={href}>
                                                <button
                                                    type="button"
                                                    className="font-mono text-xs text-copper hover:underline text-left"
                                                    onClick={() =>
                                                        addInternalLink({
                                                            anchor: '',
                                                            url: href,
                                                            reason: 'Suggested pillar / cluster link',
                                                        })
                                                    }
                                                >
                                                    {href}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>

                        {/* Article Images */}
                        <section className={`${panel} p-3 space-y-3`}>
                            <div className="flex items-center justify-between gap-2">
                                <p className={sectionTitle}>Article Images</p>
                                <button type="button" className={btn} onClick={addContentImage}>
                                    Add Image
                                </button>
                            </div>
                            {(blog.contentImages || []).map((img, i) => (
                                <div key={img.id || i} className="space-y-2 border-t border-graphite/10 pt-2">
                                    {img.url ? (
                                        <img
                                            src={img.url}
                                            alt={img.alt || ''}
                                            className="w-full max-h-28 object-cover border border-graphite/10"
                                        />
                                    ) : null}
                                    {['url', 'alt', 'caption', 'credit', 'placement'].map((k) => (
                                        <div key={k}>
                                            <label className={label} htmlFor={`cimg-${i}-${k}`}>
                                                {k}
                                            </label>
                                            <input
                                                id={`cimg-${i}-${k}`}
                                                className={field}
                                                value={img[k] || ''}
                                                onChange={(e) => updateContentImage(i, k, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={!!img.decorative}
                                            onChange={(e) =>
                                                updateContentImage(i, 'decorative', e.target.checked)
                                            }
                                        />
                                        Decorative
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" className={btn} onClick={() => copyImageMarkdown(img)}>
                                            Copy Markdown
                                        </button>
                                        <button type="button" className={btn} onClick={() => removeContentImage(i)}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Related */}
                        <section className={`${panel} p-3 space-y-3`}>
                            <p className={sectionTitle}>Related</p>
                            <div>
                                <label className={label} htmlFor="related">
                                    Related slugs (comma-separated)
                                </label>
                                <input
                                    id="related"
                                    className={field}
                                    value={relatedInput}
                                    onChange={(e) => {
                                        setRelatedInput(e.target.value);
                                        markDirty();
                                    }}
                                />
                            </div>
                        </section>

                        {/* Sources */}
                        <section className={`${panel} p-3 space-y-3`}>
                            <div className="flex items-center justify-between gap-2">
                                <p className={sectionTitle}>Sources</p>
                                <button type="button" className={btn} onClick={addSource}>
                                    Add
                                </button>
                            </div>
                            {(blog.sources || []).map((src, i) => (
                                <div key={i} className="space-y-2 border-t border-graphite/10 pt-2">
                                    <input
                                        className={field}
                                        placeholder="Label"
                                        value={src.label || ''}
                                        onChange={(e) => updateSource(i, 'label', e.target.value)}
                                    />
                                    <input
                                        className={`${field} font-mono text-xs`}
                                        placeholder="URL"
                                        value={src.url || ''}
                                        onChange={(e) => updateSource(i, 'url', e.target.value)}
                                    />
                                    <button type="button" className={btn} onClick={() => removeSource(i)}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </section>

                        {/* Cannibalization */}
                        {overlaps.length > 0 && (
                            <section className={`${panel} p-3 space-y-2`}>
                                <p className={sectionTitle}>Possible Overlap</p>
                                <p className="font-mono text-[9px] text-mute leading-relaxed">
                                    Advisory only — does not block publish.
                                </p>
                                <ul className="space-y-2">
                                    {overlaps.map((o) => (
                                        <li key={o.id || o.slug} className="text-xs">
                                            <span className="font-mono text-[9px] tracking-wider uppercase text-copper">
                                                Possible overlap
                                            </span>
                                            <p className="mt-0.5">
                                                {o.title || o.slug}
                                                {o.status ? (
                                                    <span className="text-mute"> · {o.status}</span>
                                                ) : null}
                                            </p>
                                            {o.sharedTokens?.length ? (
                                                <p className="font-mono text-[9px] text-mute mt-0.5">
                                                    {o.sharedTokens.join(', ')}
                                                </p>
                                            ) : null}
                                            {o.slug && (
                                                <Link
                                                    to={`/admin/blogs/${o.id}`}
                                                    className="font-mono text-[10px] text-copper hover:underline"
                                                >
                                                    /{o.slug}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* SEO Readiness */}
                        <section className={`${panel} p-3`}>
                            <p className={`${sectionTitle} mb-3`}>SEO Readiness</p>
                            <ul className="space-y-2">
                                {checks.map((c) => (
                                    <li key={c.code} className="flex gap-2 text-xs">
                                        <span
                                            className={`font-mono text-[9px] tracking-wider uppercase shrink-0 w-16 ${checkLevelClass(
                                                c.level
                                            )}`}
                                        >
                                            {c.level}
                                        </span>
                                        <span>{c.message}</span>
                                    </li>
                                ))}
                            </ul>
                            {validateErrors.length > 0 && (
                                <ul className="mt-3 pt-3 border-t border-graphite/10 space-y-1">
                                    {validateErrors.map((e, i) => (
                                        <li key={i} className="text-xs text-copper font-mono">
                                            <span className="text-mute">{e.path || '—'}</span>: {e.message}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button
                                type="button"
                                className={`${btn} mt-3`}
                                onClick={() => runValidate(false)}
                            >
                                Re-validate
                            </button>
                        </section>

                        {/* Revisions */}
                        {blogId && (
                            <section className={`${panel} p-3`}>
                                <p className={`${sectionTitle} mb-2`}>Revisions</p>
                                {revisions.length === 0 && (
                                    <p className="text-xs text-mute">No revisions yet.</p>
                                )}
                                <ul className="space-y-2 max-h-48 overflow-y-auto">
                                    {revisions.map((r) => (
                                        <li
                                            key={r.id}
                                            className="flex items-start justify-between gap-2 text-xs"
                                        >
                                            <div>
                                                <p className="font-mono text-[10px] text-mute">
                                                    {fmtDateTime(r.timestamp)}
                                                </p>
                                                <p>{r.reason}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className={btn}
                                                onClick={async () => {
                                                    if (!window.confirm('Restore this revision?')) return;
                                                    try {
                                                        const res = await restoreRevision(blogId, r.id);
                                                        hydrateFromBlog(
                                                            res.blog,
                                                            clientSeoChecks(res.blog),
                                                            linkSuggestions,
                                                            overlaps
                                                        );
                                                        setStatusMsg('Revision restored');
                                                        setDirty(true);
                                                    } catch (err) {
                                                        setError(err.message || 'Restore failed');
                                                    }
                                                }}
                                            >
                                                Restore
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}
