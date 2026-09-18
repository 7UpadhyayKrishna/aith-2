import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Seo, { breadcrumbJsonLd, orgJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import FaqAccordion from '../components/FaqAccordion';
import { Fade, Line, Tag } from '../components/Reveal';
import { WORK_LOCATIONS } from '../data/company';
import { CAREER_VALUES, HIRE_STEPS, ROLE_FAMILIES, getPublishedRoles } from '../data/careers';
import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';
import { CONTACT } from '../data/contact';
import { submitCareerApplication } from '../services/forms';

const fieldCls =
    'mt-2 w-full bg-transparent border-0 border-b border-graphite/25 rounded-none px-0 py-3 text-base focus:outline-none focus:border-copper transition-colors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Careers() {
    const roles = getPublishedRoles();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        roleInterest: '',
        locationPreference: '',
        linkedinOrCv: '',
        message: '',
        website: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

    const set = (k, v) => {
        setForm((s) => ({ ...s, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
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
        if (!validate()) return;
        setSubmitting(true);
        try {
            const result = await submitCareerApplication(form);
            if (result.mode === 'mailto' && result.mailto) {
                setStatus('mailto');
                window.location.href = result.mailto;
            } else if (result.ok) {
                setStatus('api');
                setForm({
                    name: '',
                    email: '',
                    phone: '',
                    roleInterest: '',
                    locationPreference: '',
                    linkedinOrCv: '',
                    message: '',
                    website: '',
                });
            } else {
                setStatus('failed');
            }
        } catch {
            setStatus('failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main id="main-content" className="overflow-x-clip">
            <Seo
                title="Careers"
                description="Careers at Asian International Trade House — work across international trade, sourcing and supply chain with a precise commercial culture."
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
                titleLines={['WORK WITH', 'TRADE.']}
                italicLast
                lead="Build a career in international sourcing, documentation and commercial coordination — with clear expectations and real market exposure."
                primaryCta={{ to: '/careers#apply', label: 'Apply / Express Interest', testId: 'careers-apply-cta' }}
                secondaryCta={{ to: '/about', label: 'About AITH', testId: 'careers-about-cta' }}
                testId="careers-hero"
            />

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-36" data-testid="careers-why">
                <Tag index="01" label="Why AITH" />
                <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10 max-w-4xl">
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
                <Tag index="02" label="Role Families" />
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8 max-w-3xl">
                    Where people contribute
                </h2>
                <p className="text-forest/70 text-sm leading-relaxed mt-4 max-w-xl">
                    These describe the kinds of work we hire for — not current openings. Published vacancies appear in the section below when roles are active.
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

            <section className="bg-bone text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-32" data-testid="careers-locations">
                <Tag index="03" label="Where We Work" />
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8 max-w-3xl">
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

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-36" id="open-roles" data-testid="careers-roles">
                <Tag index="04" label="Open Roles" />
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">
                    Current openings
                </h2>
                {roles.length === 0 ? (
                    <Fade>
                        <div className="mt-12 max-w-2xl border border-graphite/15 px-6 py-8" data-testid="careers-empty">
                            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-copper">No open roles right now</p>
                            <p className="text-base text-mute leading-relaxed mt-4">
                                We are not listing active vacancies at this moment. If you believe your experience fits international trade operations, sourcing or commercial coordination, you may still send a general application below.
                            </p>
                            <a href="#apply" className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-copper hover:text-terra transition-colors">
                                Express interest <ArrowRight size={14} aria-hidden="true" />
                            </a>
                        </div>
                    </Fade>
                ) : (
                    <ul className="mt-12 divide-y divide-graphite/15 border-t border-graphite/15">
                        {roles.map((role) => (
                            <li key={role.id} className="py-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6" data-testid={`career-role-${role.id}`}>
                                <div className="min-w-0">
                                    <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper">
                                        {role.team} · {role.type} · {role.location}
                                    </p>
                                    <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-2">{role.title}</h3>
                                    <p className="text-sm text-mute leading-relaxed mt-3 max-w-xl">{role.blurb}</p>
                                </div>
                                <a
                                    href={`#apply`}
                                    onClick={() => set('roleInterest', role.title)}
                                    className="inline-flex items-center gap-2 bg-copper text-ivory px-6 py-3 font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-terra transition-colors shrink-0 min-h-[44px]"
                                >
                                    Apply <ArrowUpRight size={14} aria-hidden="true" />
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="bg-forest text-ivory px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-32" data-testid="careers-process">
                <Tag index="05" label="How We Hire" dark />
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8 max-w-3xl">
                    <Line>A clear path.</Line>
                    <Line delay={0.1} className="font-serif italic font-normal text-copper">
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

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-36" id="apply" data-testid="careers-apply">
                <Tag index="06" label="Apply" />
                <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">
                    Express interest
                </h2>
                <p className="text-mute max-w-xl mt-4 leading-relaxed">
                    Share a concise note. Attach a LinkedIn profile or CV link if useful. Applications go to {CONTACT.email}.
                </p>

                {status === 'api' && (
                    <div className="mt-8 border border-copper/40 bg-bone px-5 py-4 max-w-xl" role="status">
                        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper">Application received</p>
                        <p className="text-sm mt-2 text-graphite/80">Thank you. We will review and respond if there is a fit.</p>
                    </div>
                )}
                {status === 'mailto' && (
                    <div className="mt-8 border border-graphite/20 bg-bone px-5 py-4 max-w-xl" role="status">
                        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper">Email client opened</p>
                        <p className="text-sm mt-2 text-graphite/80">Complete the message in your mail app to finish the application.</p>
                    </div>
                )}
                {status === 'failed' && (
                    <div className="mt-8 border border-terra/50 bg-bone px-5 py-4 max-w-xl" role="alert">
                        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terra">Could not submit</p>
                        <p className="text-sm mt-2">Please retry or email {CONTACT.email} directly.</p>
                    </div>
                )}

                <form onSubmit={onSubmit} className="mt-10 max-w-xl space-y-6" noValidate data-testid="careers-form">
                    {[
                        { id: 'name', label: 'Name', required: true },
                        { id: 'email', label: 'Email', required: true, type: 'email' },
                        { id: 'phone', label: 'Phone (optional)', required: false, type: 'tel' },
                        { id: 'roleInterest', label: 'Role of interest', required: false },
                        { id: 'locationPreference', label: 'Location preference', required: false },
                        { id: 'linkedinOrCv', label: 'LinkedIn or CV link (optional)', required: false },
                    ].map((f) => (
                        <label key={f.id} className="block" htmlFor={`career-${f.id}`}>
                            <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">{f.label}</span>
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
                            {errors[f.id] && <span className="block mt-1 text-xs text-terra">{errors[f.id]}</span>}
                        </label>
                    ))}
                    <label className="block" htmlFor="career-message">
                        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">Message</span>
                        <textarea
                            id="career-message"
                            required
                            rows={4}
                            value={form.message}
                            onChange={(e) => set('message', e.target.value)}
                            className={`${fieldCls} resize-y`}
                            data-testid="career-input-message"
                        />
                        {errors.message && <span className="block mt-1 text-xs text-terra">{errors.message}</span>}
                    </label>
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
                        {submitting ? 'Sending…' : 'Submit application'} <ArrowUpRight size={14} aria-hidden="true" />
                    </button>
                    <p className="text-xs text-mute">
                        Prefer email?{' '}
                        <a href={`mailto:${CONTACT.email}?subject=Careers%20application`} className="text-copper underline-offset-4 hover:underline">
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
                className="bg-bone text-graphite"
                testId="careers-faq"
            />

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-16 border-t border-graphite/10">
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
