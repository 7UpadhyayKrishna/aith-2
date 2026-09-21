import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, ChevronDown } from 'lucide-react';
import Seo, { breadcrumbJsonLd, orgJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import FaqAccordion from '../components/FaqAccordion';
import { Fade, Line, Tag } from '../components/Reveal';
import { WORK_LOCATIONS } from '../data/company';
import {
    CAREER_VALUES,
    HIRE_STEPS,
    ROLE_FAMILIES,
    getPublishedRoles,
    getRoleById,
} from '../data/careers';
import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';
import { CONTACT } from '../data/contact';
import { getSeoPage } from '../data/seoPages';
import { submitCareerApplication } from '../services/forms';
import { fetchPublicJobs } from '../services/adminApi';

const fieldCls =
    'mt-2 w-full bg-transparent border-0 border-b border-graphite/25 rounded-none px-0 py-3 text-base focus:outline-none focus:border-copper transition-colors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM = {
    name: '',
    email: '',
    phone: '',
    roleInterest: '',
    locationPreference: '',
    linkedinOrCv: '',
    message: '',
    website: '',
    jobId: '',
    jobSlug: '',
    jobTitle: '',
};

function RoleCard({ role, onApply, expanded, onToggle }) {
    const slug = role.slug || role.id;
    return (
        <li
            className="border border-graphite/12 bg-ivory"
            data-testid={`career-role-${role.id}`}
            id={`role-${slug}`}
        >
            <div className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper">
                        {role.team} · {role.type} · {role.location}
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-2">
                        <Link to={`/careers/${slug}`} className="hover:text-copper transition-colors">
                            {role.title}
                        </Link>
                    </h3>
                    <p className="text-sm text-mute leading-relaxed mt-3 max-w-2xl">{role.blurb}</p>

                    {(role.responsibilities?.length > 0 || role.requirements?.length > 0) && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/30 pb-1 hover:text-copper hover:border-copper transition-colors"
                            aria-expanded={expanded}
                            data-testid={`career-role-toggle-${role.id}`}
                        >
                            {expanded ? 'Hide details' : 'Role details'}
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                            />
                        </button>
                    )}

                    {expanded && (
                        <div className="mt-6 grid sm:grid-cols-2 gap-8 max-w-3xl">
                            {role.responsibilities?.length > 0 && (
                                <div>
                                    <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper mb-3">
                                        What you will do
                                    </p>
                                    <ul className="space-y-2">
                                        {role.responsibilities.map((item) => (
                                            <li key={item} className="flex gap-2 text-sm text-mute leading-relaxed">
                                                <span className="mt-1.5 w-1 h-1 shrink-0 bg-copper" aria-hidden="true" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {role.requirements?.length > 0 && (
                                <div>
                                    <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper mb-3">
                                        What we look for
                                    </p>
                                    <ul className="space-y-2">
                                        {role.requirements.map((item) => (
                                            <li key={item} className="flex gap-2 text-sm text-mute leading-relaxed">
                                                <span className="mt-1.5 w-1 h-1 shrink-0 bg-stone" aria-hidden="true" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    <Link
                        to={`/careers/${slug}`}
                        className="mt-4 inline-flex font-mono text-[10px] tracking-[0.2em] uppercase text-mute hover:text-copper"
                    >
                        View role →
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => onApply(role)}
                    className="inline-flex items-center gap-2 bg-copper text-ivory px-6 py-3 font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-terra transition-colors shrink-0 min-h-[44px] self-start"
                    data-testid={`career-apply-${role.id}`}
                >
                    Apply <ArrowUpRight size={14} aria-hidden="true" />
                </button>
            </div>
        </li>
    );
}

/** Careers board: openings + general interest application. */
export default function Careers() {
    const seo = getSeoPage('/careers');
    const [roles, setRoles] = useState([]);
    const [rolesSource, setRolesSource] = useState('loading');
    const teams = useMemo(() => [...new Set(roles.map((r) => r.team).filter(Boolean))], [roles]);

    const [searchParams, setSearchParams] = useSearchParams();
    const [teamFilter, setTeamFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await fetchPublicJobs();
                const items = (data.items || []).map((j) => ({
                    ...j,
                    id: j.id || j.slug,
                    published: true,
                }));
                if (!cancelled) {
                    setRoles(items);
                    setRolesSource('api');
                }
            } catch {
                if (!cancelled) {
                    /* Network/API failure only — keep static fallback */
                    setRoles(getPublishedRoles());
                    setRolesSource('static');
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredRoles =
        teamFilter === 'all' ? roles : roles.filter((r) => r.team === teamFilter);

    // Prefill from ?role=id when landing from a deep link
    useEffect(() => {
        const roleId = searchParams.get('role');
        let bind = null;
        try {
            const raw = sessionStorage.getItem('aith_career_apply');
            if (raw) {
                bind = JSON.parse(raw);
                sessionStorage.removeItem('aith_career_apply');
            }
        } catch {
            /* ignore */
        }

        if (!roleId && !bind) return;

        const role =
            roles.find(
                (r) =>
                    r.id === roleId ||
                    r.slug === roleId ||
                    (bind && (r.id === bind.jobId || r.slug === bind.jobSlug))
            ) ||
            (rolesSource === 'static' && roleId ? getRoleById(roleId) : null);

        if (role || bind) {
            setForm((s) => ({
                ...s,
                roleInterest: (role && role.title) || bind?.jobTitle || s.roleInterest,
                jobId: (role && role.id) || bind?.jobId || s.jobId,
                jobSlug: (role && role.slug) || bind?.jobSlug || s.jobSlug,
                jobTitle: (role && role.title) || bind?.jobTitle || s.jobTitle,
            }));
            if (role) setExpandedId(role.id || role.slug);
        }
    }, [searchParams, roles, rolesSource]);

    const set = (k, v) => {
        setForm((s) => ({ ...s, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    };

    const goApply = (role) => {
        if (role) {
            setForm((s) => ({
                ...s,
                roleInterest: role.title,
                jobId: role.id || '',
                jobSlug: role.slug || '',
                jobTitle: role.title || '',
            }));
            setSearchParams({ role: role.slug || role.id }, { replace: true });
        } else {
            setForm((s) => ({ ...s, jobId: '', jobSlug: '', jobTitle: '' }));
            setSearchParams({}, { replace: true });
        }
        const el = document.getElementById('apply');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = 'Name is required.';
        if (!form.email.trim() || !EMAIL_RE.test(form.email)) next.email = 'Valid email is required.';
        if (!form.message.trim()) next.message = 'Please tell us briefly about your interest.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setStatus(null);
        setSubmitError('');
        if (!validate()) return;
        setSubmitting(true);
        try {
            const result = await submitCareerApplication({
                ...form,
                jobId: form.jobId || undefined,
                jobSlug: form.jobSlug || undefined,
                jobTitle: form.jobTitle || form.roleInterest || undefined,
            });
            if (result.ok && (result.mode === 'api' || result.mode === 'stub')) {
                setStatus('api');
                setForm(EMPTY_FORM);
                setSearchParams({}, { replace: true });
            } else {
                setStatus('failed');
                setSubmitError(result.message || "We couldn't submit your application right now. Please try again.");
            }
        } catch {
            setStatus('failed');
            setSubmitError("We couldn't submit your application right now. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const roleOptions = [
        ...roles.map((r) => r.title),
        'General interest - Operations',
        'General interest - Sourcing',
        'General interest - Commercial',
        'General interest - Other',
    ];

    return (
        <main id="main-content" className="overflow-x-clip">
            <Seo
                title={seo?.title || 'Careers | Work in Trade Operations & Sourcing'}
                description={
                    seo?.description ||
                    'Careers at Asian International Trade House - work across international trade, sourcing and supply chain with a precise commercial culture.'
                }
                path="/careers"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        orgJsonLd,
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Careers', path: '/careers' },
                        ]),
                    ],
                }}
            />

            <PageHero
                kicker="AITH / Careers"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Careers' },
                ]}
                titleLines={seo?.h1Lines || ['WORK WITH', 'TRADE.']}
                italicLast={seo?.italicLast !== false}
                lead="Build a career in international sourcing, documentation and commercial coordination - with clear expectations and real market exposure."
                primaryCta={{
                    to: '/careers#open-roles',
                    label: roles.length ? 'View open roles' : 'Express interest',
                    testId: 'careers-openings-cta',
                }}
                secondaryCta={{
                    to: roles.length ? '/careers#apply' : '/about',
                    label: roles.length ? 'Apply / Express Interest' : 'About AITH',
                    testId: 'careers-apply-cta',
                }}
                testId="careers-hero"
            />

            {/* Job board first - what candidates come for */}
            <section
                className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-32 scroll-mt-24"
                id="open-roles"
                data-testid="careers-roles"
            >
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <Tag index="01" label="Open Roles" />
                        <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.03em] font-extrabold mt-8">
                            <Line>Current openings.</Line>
                        </h2>
                        <p className="text-mute text-sm leading-relaxed mt-4 max-w-lg">
                            {roles.length
                                ? `${roles.length} published role${roles.length === 1 ? '' : 's'}. Select a posting to apply with the form below.`
                                : 'No active vacancies listed right now - general applications are still welcome.'}
                        </p>
                    </div>
                    {teams.length > 1 && (
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by team">
                            <button
                                type="button"
                                onClick={() => setTeamFilter('all')}
                                className={`font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border transition-colors ${
                                    teamFilter === 'all'
                                        ? 'border-copper text-copper'
                                        : 'border-graphite/20 text-mute hover:border-graphite/40'
                                }`}
                            >
                                All
                            </button>
                            {teams.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTeamFilter(t)}
                                    className={`font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border transition-colors ${
                                        teamFilter === t
                                            ? 'border-copper text-copper'
                                            : 'border-graphite/20 text-mute hover:border-graphite/40'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {rolesSource === 'loading' ? (
                    <p className="mt-12 font-mono text-[11px] tracking-[0.22em] uppercase text-mute">Loading roles…</p>
                ) : filteredRoles.length === 0 ? (
                    <Fade>
                        <div className="mt-12 max-w-2xl border border-graphite/15 px-6 py-8" data-testid="careers-empty">
                            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-copper">
                                No open roles right now
                            </p>
                            <p className="text-base text-mute leading-relaxed mt-4">
                                We are not listing active vacancies at this moment. If your experience fits
                                international trade operations, sourcing or commercial coordination, send a
                                general application below.
                            </p>
                            <button
                                type="button"
                                onClick={() => goApply(null)}
                                className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-copper hover:text-terra transition-colors"
                            >
                                Express interest <ArrowRight size={14} aria-hidden="true" />
                            </button>
                        </div>
                    </Fade>
                ) : (
                    <ul className="mt-12 space-y-4" data-testid="careers-role-list">
                        {filteredRoles.map((role, i) => (
                            <Fade key={role.id} delay={Math.min(i * 0.05, 0.25)}>
                                <RoleCard
                                    role={role}
                                    expanded={expandedId === role.id}
                                    onToggle={() =>
                                        setExpandedId((id) => (id === role.id ? null : role.id))
                                    }
                                    onApply={goApply}
                                />
                            </Fade>
                        ))}
                    </ul>
                )}
            </section>

            <section className="bg-bone text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-32" data-testid="careers-why">
                <Tag index="02" label="Why AITH" />
                <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] leading-[1.05] tracking-[-0.03em] font-extrabold mt-10 max-w-4xl">
                    <Line>Markets. Documentation.</Line>
                    <Line delay={0.1}>Commercial discipline.</Line>
                </h2>
                <div className="grid sm:grid-cols-2 gap-10 lg:gap-14 mt-16 lg:mt-20">
                    {CAREER_VALUES.map((v, i) => (
                        <Fade key={v.index} delay={i * 0.06}>
                            <p className="font-mono text-[10px] tracking-[0.3em] text-copper mb-3">{v.index}</p>
                            <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight">{v.title}</h3>
                            <p className="text-sm lg:text-base text-mute leading-relaxed mt-3 max-w-md">{v.blurb}</p>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="bg-sage text-forest px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-32" data-testid="careers-role-families">
                <Tag index="03" label="Role Families" />
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.03em] font-extrabold mt-8 max-w-3xl">
                    Where people contribute
                </h2>
                <p className="text-forest/70 text-sm leading-relaxed mt-4 max-w-xl">
                    Broader work areas we hire into over time - separate from the published openings above.
                </p>
                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {ROLE_FAMILIES.map((r, i) => (
                        <Fade key={r.id} delay={i * 0.05}>
                            <p className="font-mono text-[10px] tracking-[0.3em] text-copper mb-3">0{i + 1}</p>
                            <h3 className="text-xl font-extrabold tracking-tight">{r.title}</h3>
                            <p className="text-sm text-forest/70 leading-relaxed mt-3">{r.blurb}</p>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-32" data-testid="careers-locations">
                <Tag index="04" label="Where We Work" />
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.03em] font-extrabold mt-8 max-w-3xl">
                    Offices and branches
                </h2>
                <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {WORK_LOCATIONS.map((loc) => (
                        <li key={loc.id} className="border-t border-graphite/15 pt-5">
                            <p className="font-extrabold tracking-tight text-lg">{loc.label}</p>
                            <p className="text-sm text-mute mt-2 leading-relaxed">{loc.detail}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="bg-forest text-ivory px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-32" data-testid="careers-process">
                <Tag index="05" label="How We Hire" dark />
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.03em] font-extrabold mt-8 max-w-3xl">
                    <Line>A clear path.</Line>
                    <Line delay={0.1} className="text-copper">
                        No theatre.
                    </Line>
                </h2>
                <ol className="mt-14 grid md:grid-cols-3 gap-10">
                    {HIRE_STEPS.map((s) => (
                        <li key={s.index}>
                            <p className="font-mono text-[10px] tracking-[0.3em] text-copper">{s.index}</p>
                            <h3 className="text-xl font-extrabold mt-3">{s.title}</h3>
                            <p className="text-sm text-ivory/65 leading-relaxed mt-3">{s.blurb}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section
                className="bg-bone text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-36 scroll-mt-24"
                id="apply"
                data-testid="careers-apply"
            >
                <Tag index="06" label="Apply" />
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.03em] font-extrabold mt-8">
                    Express interest
                </h2>
                <p className="text-mute max-w-xl mt-4 leading-relaxed">
                    Share a concise note. Attach a LinkedIn profile or CV link if useful. Applications go to{' '}
                    {CONTACT.email}.
                </p>

                {status === 'api' && (
                    <div className="mt-8 border border-copper/40 bg-ivory px-5 py-4 max-w-xl" role="status">
                        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper">
                            Application received
                        </p>
                        <p className="text-sm mt-2 text-graphite/80">
                            Thank you. We will review and respond if there is a fit.
                        </p>
                    </div>
                )}
                {status === 'failed' && (
                    <div className="mt-8 border border-terra/50 bg-ivory px-5 py-4 max-w-xl" role="alert">
                        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terra">
                            Could not submit
                        </p>
                        <p className="text-sm mt-2">{submitError || "We couldn't submit your application right now. Please try again."}</p>
                        <p className="text-sm mt-2 text-mute">
                            You can retry, or email {CONTACT.email} directly.
                        </p>
                    </div>
                )}

                <form onSubmit={onSubmit} className="mt-10 max-w-xl space-y-6" noValidate data-testid="careers-form">
                    {[
                        { id: 'name', label: 'Name', required: true },
                        { id: 'email', label: 'Email', required: true, type: 'email' },
                        { id: 'phone', label: 'Phone (optional)', required: false, type: 'tel' },
                    ].map((f) => (
                        <label key={f.id} className="block" htmlFor={`career-${f.id}`}>
                            <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">
                                {f.label}
                            </span>
                            <input
                                id={`career-${f.id}`}
                                type={f.type || 'text'}
                                required={f.required}
                                value={form[f.id]}
                                onChange={(e) => set(f.id, e.target.value)}
                                aria-invalid={errors[f.id] ? 'true' : undefined}
                                className={fieldCls}
                                data-testid={`career-input-${f.id}`}
                            />
                            {errors[f.id] && (
                                <span className="block mt-1 text-xs text-terra">{errors[f.id]}</span>
                            )}
                        </label>
                    ))}

                    <label className="block" htmlFor="career-roleInterest">
                        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">
                            Role of interest
                        </span>
                        <select
                            id="career-roleInterest"
                            value={form.roleInterest}
                            onChange={(e) => {
                                const title = e.target.value;
                                const matched = roles.find((r) => r.title === title);
                                setForm((s) => ({
                                    ...s,
                                    roleInterest: title,
                                    jobId: matched ? matched.id || '' : '',
                                    jobSlug: matched ? matched.slug || '' : '',
                                    jobTitle: matched ? matched.title || '' : '',
                                }));
                                if (errors.roleInterest) {
                                    setErrors((er) => ({ ...er, roleInterest: undefined }));
                                }
                            }}
                            className={`${fieldCls} appearance-none cursor-pointer`}
                            data-testid="career-input-roleInterest"
                        >
                            <option value="">Select a role or general interest</option>
                            {roleOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block" htmlFor="career-locationPreference">
                        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">
                            Location preference
                        </span>
                        <select
                            id="career-locationPreference"
                            value={form.locationPreference}
                            onChange={(e) => set('locationPreference', e.target.value)}
                            className={`${fieldCls} appearance-none cursor-pointer`}
                            data-testid="career-input-locationPreference"
                        >
                            <option value="">Select a location</option>
                            {WORK_LOCATIONS.map((loc) => (
                                <option key={loc.id} value={loc.label}>
                                    {loc.label}
                                </option>
                            ))}
                            <option value="Remote / flexible">Remote / flexible</option>
                            <option value="Open to discussion">Open to discussion</option>
                        </select>
                    </label>

                    <label className="block" htmlFor="career-linkedinOrCv">
                        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">
                            LinkedIn or CV link (optional)
                        </span>
                        <input
                            id="career-linkedinOrCv"
                            type="url"
                            value={form.linkedinOrCv}
                            onChange={(e) => set('linkedinOrCv', e.target.value)}
                            placeholder="https://"
                            className={fieldCls}
                            data-testid="career-input-linkedinOrCv"
                        />
                    </label>

                    <label className="block" htmlFor="career-message">
                        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">
                            Message
                        </span>
                        <textarea
                            id="career-message"
                            required
                            rows={4}
                            value={form.message}
                            onChange={(e) => set('message', e.target.value)}
                            className={`${fieldCls} resize-y`}
                            data-testid="career-input-message"
                        />
                        {errors.message && (
                            <span className="block mt-1 text-xs text-terra">{errors.message}</span>
                        )}
                    </label>

                    {/* Honeypot - leave empty */}
                    <input
                        type="text"
                        name="website"
                        value={form.website}
                        onChange={(e) => set('website', e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors disabled:opacity-50 min-h-[48px]"
                        data-testid="career-submit"
                    >
                        {submitting ? 'Sending…' : 'Submit application'}{' '}
                        <ArrowUpRight size={14} aria-hidden="true" />
                    </button>
                    <p className="text-xs text-mute">
                        Prefer email?{' '}
                        <a
                            href={`mailto:${CONTACT.email}?subject=Careers%20application`}
                            className="text-copper underline-offset-4 hover:underline"
                        >
                            {CONTACT.email}
                        </a>
                    </p>
                </form>
            </section>

            <FaqAccordion
                items={getFaqsByIds(FAQ_BY_CONTEXT.careers || [])}
                index="07"
                label="Careers FAQ"
                title="Before you apply"
                className="bg-ivory text-graphite"
                testId="careers-faq"
            />

            <section className="bg-bone text-graphite px-5 sm:px-6 lg:px-12 py-16 border-t border-graphite/10">
                <div className="flex flex-wrap gap-4">
                    <Link
                        to="/partner"
                        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-copper hover:text-terra"
                    >
                        Become a trade partner <ArrowRight size={14} />
                    </Link>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-mute hover:text-graphite"
                    >
                        Talk to us <ArrowRight size={14} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
