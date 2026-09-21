import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    createJob,
    deleteJob,
    getJob,
    publishJob,
    unpublishJob,
    updateJob,
} from '@/services/adminApi';
import { JOB_STATUSES } from '@/data/blogCategories';
import {
    ErrorBanner,
    LoadingBlock,
    btn,
    btnPrimary,
    field,
    label,
} from './adminUi';
import { BackLink, RecordHeader, RecordSection } from './AdminRecordPage';

const EMPTY = {
    title: '',
    slug: '',
    team: '',
    location: '',
    type: 'Full-time',
    experienceLevel: '',
    blurb: '',
    descriptionMarkdown: '',
    responsibilitiesText: '',
    requirementsText: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: '',
    salaryPeriod: '',
    applicationDeadline: '',
    coverUrl: '',
    coverAlt: '',
    status: 'draft',
    postedAt: '',
};

function linesToList(text) {
    return String(text || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
}

function listToLines(arr) {
    return (arr || []).join('\n');
}

export default function AdminJobEditor() {
    const { id } = useParams();
    const isNew = !id || id === 'new';
    const navigate = useNavigate();
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setPageTitle(isNew ? 'Post job' : 'Edit job');
        setHeaderActions(null);
    }, [isNew, setPageTitle, setHeaderActions]);

    useEffect(() => {
        if (isNew) return undefined;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const j = await getJob(id);
                if (cancelled) return;
                const cover = j.coverImage && typeof j.coverImage === 'object' ? j.coverImage : {};
                setForm({
                    title: j.title || '',
                    slug: j.slug || '',
                    team: j.team || '',
                    location: j.location || '',
                    type: j.type || 'Full-time',
                    experienceLevel: j.experienceLevel || '',
                    blurb: j.blurb || '',
                    descriptionMarkdown: j.descriptionMarkdown || '',
                    responsibilitiesText: listToLines(j.responsibilities),
                    requirementsText: listToLines(j.requirements),
                    salaryMin: j.salaryMin != null ? String(j.salaryMin) : '',
                    salaryMax: j.salaryMax != null ? String(j.salaryMax) : '',
                    salaryCurrency: j.salaryCurrency || '',
                    salaryPeriod: j.salaryPeriod || '',
                    applicationDeadline: (j.applicationDeadline || '').slice(0, 10),
                    coverUrl: cover.url || '',
                    coverAlt: cover.alt || '',
                    status: j.status || 'draft',
                    postedAt: j.postedAt || '',
                });
                setPageTitle(j.title || 'Edit job');
            } catch (err) {
                if (!cancelled) setError(err.message || 'Failed to load job');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, isNew, setPageTitle]);

    function setField(key, value) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    function payloadFromForm() {
        const salaryMin = form.salaryMin === '' ? null : Number(form.salaryMin);
        const salaryMax = form.salaryMax === '' ? null : Number(form.salaryMax);
        return {
            title: form.title.trim(),
            slug: form.slug.trim().toLowerCase() || undefined,
            team: form.team.trim(),
            location: form.location.trim(),
            type: form.type.trim() || 'Full-time',
            experienceLevel: form.experienceLevel.trim(),
            blurb: form.blurb.trim(),
            descriptionMarkdown: form.descriptionMarkdown.trim(),
            responsibilities: linesToList(form.responsibilitiesText),
            requirements: linesToList(form.requirementsText),
            salaryMin: Number.isFinite(salaryMin) ? salaryMin : null,
            salaryMax: Number.isFinite(salaryMax) ? salaryMax : null,
            salaryCurrency: form.salaryCurrency.trim(),
            salaryPeriod: form.salaryPeriod.trim(),
            applicationDeadline: form.applicationDeadline || null,
            coverImage: {
                url: form.coverUrl.trim(),
                alt: form.coverAlt.trim(),
            },
            status: form.status,
            postedAt: form.postedAt || null,
        };
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const body = payloadFromForm();
            if (!body.title) {
                setError('Title is required.');
                return;
            }
            if (isNew) {
                const created = await createJob(body);
                toast.success('Created');
                navigate(`/admin/careers/jobs/${created.id}`, { replace: true });
            } else {
                await updateJob(id, body);
                toast.success('Saved');
            }
        } catch (err) {
            setError(err.message || 'Save failed');
            toast.error(err.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    async function handlePublish() {
        setSaving(true);
        setError('');
        try {
            await publishJob(id);
            const j = await getJob(id);
            setForm((f) => ({ ...f, status: j.status, postedAt: j.postedAt || f.postedAt }));
            toast.success('Published');
        } catch (err) {
            setError(err.message || 'Publish failed');
            toast.error(err.message || 'Publish failed');
        } finally {
            setSaving(false);
        }
    }

    async function handleUnpublish() {
        setSaving(true);
        setError('');
        try {
            await unpublishJob(id);
            setForm((f) => ({ ...f, status: 'draft' }));
            toast.success('Unpublished');
        } catch (err) {
            setError(err.message || 'Unpublish failed');
            toast.error(err.message || 'Unpublish failed');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm('Delete this job opening permanently?')) return;
        setSaving(true);
        setError('');
        try {
            await deleteJob(id);
            navigate('/admin/careers/jobs', { replace: true });
        } catch (err) {
            setError(err.message || 'Delete failed');
            toast.error(err.message || 'Delete failed');
            setSaving(false);
        }
    }

    if (loading) return <LoadingBlock label="Loading job…" />;

    const viewHref = form.slug ? `/careers/${form.slug}` : '/careers';

    return (
        <div className="space-y-5 animate-admin-enter" data-testid="admin-job-editor">
            <BackLink to="/admin/careers/jobs">All job openings</BackLink>
            <RecordHeader
                eyebrow={isNew ? 'New opening' : 'Edit opening'}
                title={form.title || (isNew ? 'Post a job' : 'Job')}
                subtitle="Live on /careers only when status is published."
                actions={
                    !isNew ? (
                        <div className="flex flex-wrap gap-2">
                            {form.status === 'published' ? (
                                <button type="button" className={btn} disabled={saving} onClick={handleUnpublish}>
                                    Unpublish
                                </button>
                            ) : (
                                <button type="button" className={btnPrimary} disabled={saving} onClick={handlePublish}>
                                    Publish
                                </button>
                            )}
                            <a href={viewHref} target="_blank" rel="noreferrer" className={btn}>
                                View site
                            </a>
                            <button type="button" className={btn} disabled={saving} onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    ) : null
                }
            />

            {error ? <ErrorBanner>{error}</ErrorBanner> : null}

            <form onSubmit={handleSave} className="space-y-4 max-w-3xl">
                <RecordSection title="Basics">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className={label} htmlFor="job-title">
                                Title
                            </label>
                            <input
                                id="job-title"
                                className={field}
                                value={form.title}
                                onChange={(e) => setField('title', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-slug">
                                Slug
                            </label>
                            <input
                                id="job-slug"
                                className={field}
                                value={form.slug}
                                onChange={(e) => setField('slug', e.target.value)}
                                placeholder="auto from title"
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-team">
                                Team
                            </label>
                            <input
                                id="job-team"
                                className={field}
                                value={form.team}
                                onChange={(e) => setField('team', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-location">
                                Location
                            </label>
                            <input
                                id="job-location"
                                className={field}
                                value={form.location}
                                onChange={(e) => setField('location', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-type">
                                Type
                            </label>
                            <input
                                id="job-type"
                                className={field}
                                value={form.type}
                                onChange={(e) => setField('type', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-exp">
                                Experience level
                            </label>
                            <input
                                id="job-exp"
                                className={field}
                                value={form.experienceLevel}
                                onChange={(e) => setField('experienceLevel', e.target.value)}
                            />
                        </div>
                    </div>
                </RecordSection>

                <RecordSection title="Intro">
                    <div className="space-y-4">
                        <div>
                            <label className={label} htmlFor="job-blurb">
                                Short blurb
                            </label>
                            <textarea
                                id="job-blurb"
                                rows={3}
                                className={field}
                                value={form.blurb}
                                onChange={(e) => setField('blurb', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-desc">
                                Description (markdown)
                            </label>
                            <textarea
                                id="job-desc"
                                rows={8}
                                className={field}
                                value={form.descriptionMarkdown}
                                onChange={(e) => setField('descriptionMarkdown', e.target.value)}
                            />
                        </div>
                    </div>
                </RecordSection>

                <RecordSection title="Role">
                    <div className="space-y-4">
                        <div>
                            <label className={label} htmlFor="job-resp">
                                Responsibilities (one per line)
                            </label>
                            <textarea
                                id="job-resp"
                                rows={6}
                                className={field}
                                value={form.responsibilitiesText}
                                onChange={(e) => setField('responsibilitiesText', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-req">
                                Requirements (one per line)
                            </label>
                            <textarea
                                id="job-req"
                                rows={6}
                                className={field}
                                value={form.requirementsText}
                                onChange={(e) => setField('requirementsText', e.target.value)}
                            />
                        </div>
                    </div>
                </RecordSection>

                <RecordSection title="Compensation">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className={label} htmlFor="job-sal-min">
                                Salary min (optional)
                            </label>
                            <input
                                id="job-sal-min"
                                type="number"
                                className={field}
                                value={form.salaryMin}
                                onChange={(e) => setField('salaryMin', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-sal-max">
                                Salary max (optional)
                            </label>
                            <input
                                id="job-sal-max"
                                type="number"
                                className={field}
                                value={form.salaryMax}
                                onChange={(e) => setField('salaryMax', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-sal-cur">
                                Currency
                            </label>
                            <input
                                id="job-sal-cur"
                                className={field}
                                value={form.salaryCurrency}
                                onChange={(e) => setField('salaryCurrency', e.target.value)}
                                placeholder="INR / USD"
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="job-sal-period">
                                Period
                            </label>
                            <input
                                id="job-sal-period"
                                className={field}
                                value={form.salaryPeriod}
                                onChange={(e) => setField('salaryPeriod', e.target.value)}
                                placeholder="year / month"
                            />
                        </div>
                    </div>
                </RecordSection>

                <RecordSection title="Application">
                    <div>
                        <label className={label} htmlFor="job-deadline">
                            Application deadline
                        </label>
                        <input
                            id="job-deadline"
                            type="date"
                            className={field}
                            value={form.applicationDeadline}
                            onChange={(e) => setField('applicationDeadline', e.target.value)}
                        />
                    </div>
                </RecordSection>

                <RecordSection title="Media">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className={label} htmlFor="job-cover-url">
                                Cover image URL
                            </label>
                            <input
                                id="job-cover-url"
                                className={field}
                                value={form.coverUrl}
                                onChange={(e) => setField('coverUrl', e.target.value)}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={label} htmlFor="job-cover-alt">
                                Cover alt text
                            </label>
                            <input
                                id="job-cover-alt"
                                className={field}
                                value={form.coverAlt}
                                onChange={(e) => setField('coverAlt', e.target.value)}
                            />
                        </div>
                    </div>
                </RecordSection>

                <RecordSection title="Publishing">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className={label} htmlFor="job-status">
                                Status
                            </label>
                            <select
                                id="job-status"
                                className={field}
                                value={form.status}
                                onChange={(e) => setField('status', e.target.value)}
                            >
                                {JOB_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={label} htmlFor="job-posted">
                                Posted date
                            </label>
                            <input
                                id="job-posted"
                                type="date"
                                className={field}
                                value={(form.postedAt || '').slice(0, 10)}
                                onChange={(e) => setField('postedAt', e.target.value)}
                            />
                        </div>
                    </div>
                </RecordSection>

                <div className="flex flex-wrap gap-2 pt-2">
                    <button type="submit" className={btnPrimary} disabled={saving}>
                        {saving ? 'Saving…' : isNew ? 'Create job' : 'Save changes'}
                    </button>
                    <Link to="/admin/careers/jobs" className={btn}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
