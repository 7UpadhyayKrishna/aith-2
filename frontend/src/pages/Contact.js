import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import FaqAccordion from '../components/FaqAccordion';
import { Fade, Tag } from '../components/Reveal';
import { CONTACT, isConfigured } from '../data/contact';
import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';
import { submitContact } from '../services/forms';

const MAX = {
    name: 120,
    email: 200,
    company: 160,
    phone: 40,
    country: 80,
    subject: 160,
    message: 4000,
};

const INTENT_OPTIONS = [
    { value: 'general', label: 'General Enquiry' },
    { value: 'sourcing', label: 'Product Sourcing' },
    { value: 'export', label: 'Export Requirement' },
    { value: 'import', label: 'Import Requirement' },
    { value: 'partnership', label: 'Supplier Partnership' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'quality', label: 'Quality / Compliance' },
    { value: 'careers', label: 'Careers / Application' },
    { value: 'existing', label: 'Existing Enquiry' },
    { value: 'support', label: 'Support' },
    { value: 'other', label: 'Other' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldCls =
    'mt-2 w-full bg-transparent border-0 border-b border-graphite/25 rounded-none px-0 py-3 text-base focus:outline-none focus:border-copper transition-colors';

const emptyForm = (intent = 'general') => ({
    name: '',
    email: '',
    company: '',
    phone: '',
    country: '',
    intent,
    subject: '',
    message: '',
    website: '',
});

export default function Contact() {
    const [params] = useSearchParams();
    const initialIntent = INTENT_OPTIONS.some((o) => o.value === params.get('type'))
        ? params.get('type')
        : params.get('type') === 'partner'
            ? 'partnership'
            : 'general';

    const [form, setForm] = useState(() => emptyForm(initialIntent));
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null); // null | success-api | success-mailto | failed
    const [submitError, setSubmitError] = useState('');

    const set = (k, v) => {
        setForm((s) => ({ ...s, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = 'Name is required.';
        else if (form.name.length > MAX.name) next.name = `Name must be under ${MAX.name} characters.`;
        if (!form.email.trim()) next.email = 'Work email is required.';
        else if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.';
        else if (form.email.length > MAX.email) next.email = 'Email is too long.';
        if (!form.company.trim()) next.company = 'Company is required.';
        if (!form.message.trim()) next.message = 'Message is required.';
        else if (form.message.length > MAX.message) next.message = `Message must be under ${MAX.message} characters.`;
        if (form.phone.length > MAX.phone) next.phone = 'Phone is too long.';
        if (form.subject.length > MAX.subject) next.subject = 'Subject is too long.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const errorList = useMemo(
        () => Object.entries(errors).filter(([, v]) => v).map(([k, v]) => ({ id: k, message: v })),
        [errors]
    );

    const onSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setStatus(null);
        setSubmitError('');
        if (!validate()) return;
        setSubmitting(true);
        try {
            const result = await submitContact(form);
            if (result.mode === 'mailto' && result.mailto) {
                // Mailto is a client fallback - not equivalent to server persistence
                setStatus('success-mailto');
                window.location.href = result.mailto;
            } else if (result.ok && result.mode === 'api') {
                setStatus('success-api');
                setForm(emptyForm(form.intent));
            } else if (result.ok) {
                setStatus('success-api');
                setForm(emptyForm(form.intent));
            } else {
                setStatus('failed');
                setSubmitError('Submission did not complete. Please try again or email us directly.');
            }
        } catch {
            setStatus('failed');
            setSubmitError('Something went wrong. Please try again or email us directly.');
        } finally {
            setSubmitting(false);
        }
    };

    const channels = [
        { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}`, configured: true, testId: 'contact-email' },
        {
            label: 'Phone',
            value: CONTACT.phone,
            href: isConfigured(CONTACT.phone) ? `tel:${CONTACT.phoneTel || CONTACT.phone.replace(/\s/g, '')}` : null,
            configured: isConfigured(CONTACT.phone),
            testId: 'contact-phone',
        },
        { label: 'WhatsApp', value: CONTACT.whatsapp, href: null, configured: isConfigured(CONTACT.whatsapp), testId: 'contact-whatsapp' },
        { label: 'Hours', value: CONTACT.hours, href: null, configured: isConfigured(CONTACT.hours), testId: 'contact-hours' },
    ].filter((c) => c.configured);

    return (
        <main id="main-content" className="overflow-x-clip">
            <Seo
                title="Contact"
                description="Contact Asian International Trade House in New Delhi - trade enquiries, partnership requests and sourcing conversations."
                path="/contact"
            />
            <PageHero
                kicker="AITH / Contact"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Contact' },
                ]}
                titleLines={["LET'S TALK", 'TRADE.']}
                italicLast
                lead="Share a requirement, ask a compliance question or start a supplier partnership conversation."
                primaryCta={{ to: '/request-quote', label: 'Request a Quote', testId: 'contact-quote-cta' }}
                testId="contact-hero"
            />

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-24 sm:py-28 lg:py-36" data-testid="contact-details">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                    <div className="lg:col-span-5 min-w-0">
                        <Tag index="01" label="Channels" />
                        <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">
                            Reach the desk
                        </h2>
                        <Fade>
                            <ul className="mt-12 space-y-8">
                                {channels.map((c) => (
                                    <li key={c.label} data-testid={c.testId}>
                                        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper mb-2">{c.label}</p>
                                        {c.href ? (
                                            <a href={c.href} className="text-lg lg:text-xl font-extrabold tracking-tight hover:text-copper transition-colors duration-300 break-words">
                                                {c.value}
                                            </a>
                                        ) : (
                                            <p className="text-lg lg:text-xl font-extrabold tracking-tight text-graphite/80">{c.value}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </Fade>
                        <Fade delay={0.15}>
                            <div className="mt-14 pt-10 border-t border-graphite/15">
                                <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper mb-3">Head Office</p>
                                {isConfigured(CONTACT.addressLine1) ? (
                                    <p className="text-base leading-relaxed">{CONTACT.addressLine1}</p>
                                ) : null}
                                <p className="text-base leading-relaxed">{CONTACT.addressLine2}</p>
                                {CONTACT.corporateOffice ? (
                                    <>
                                        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper mt-8 mb-3">Corporate Office</p>
                                        <p className="text-base leading-relaxed">{CONTACT.corporateOffice}</p>
                                    </>
                                ) : null}
                                {CONTACT.branches?.length ? (
                                    <>
                                        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper mt-8 mb-3">International Branches</p>
                                        <p className="text-sm leading-relaxed text-mute">{CONTACT.branches.join(' · ')}</p>
                                    </>
                                ) : null}
                                {CONTACT.gstin ? (
                                    <p className="font-mono text-[11px] tracking-[0.18em] text-mute mt-6">GSTIN {CONTACT.gstin}</p>
                                ) : null}
                                <p className="font-mono text-[11px] tracking-[0.22em] text-mute mt-4">{CONTACT.coordinates}</p>
                                {isConfigured(CONTACT.responseSla) ? (
                                    <p className="text-sm text-mute mt-6">Response target: {CONTACT.responseSla}</p>
                                ) : null}
                            </div>
                        </Fade>
                    </div>

                    <div className="lg:col-span-6 lg:col-start-7 min-w-0">
                        <Tag index="02" label="Message" />
                        <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">
                            Write to us
                        </h2>

                        {status === 'success-api' && (
                            <div className="mt-8 border border-copper/40 bg-bone px-5 py-4" role="status" data-testid="contact-success">
                                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper">Message received</p>
                                <p className="text-sm mt-2 text-graphite/80">Your enquiry has been received. We will follow up through the email you provided.</p>
                            </div>
                        )}
                        {status === 'success-mailto' && (
                            <div className="mt-8 border border-graphite/20 bg-bone px-5 py-4" role="status" data-testid="contact-mailto-note">
                                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper">Email client opened</p>
                                <p className="text-sm mt-2 text-graphite/80">
                                    Complete and send the message in your mail app to reach us at {CONTACT.email}. If nothing opened, email us directly.
                                </p>
                            </div>
                        )}
                        {status === 'failed' && (
                            <div className="mt-8 border border-terra/50 bg-bone px-5 py-4" role="alert" data-testid="contact-error">
                                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terra">Submission failed</p>
                                <p className="text-sm mt-2 text-graphite/80">{submitError}</p>
                                <button
                                    type="button"
                                    className="mt-3 font-mono text-[11px] tracking-[0.18em] uppercase text-copper underline-offset-4 hover:underline"
                                    onClick={() => setStatus(null)}
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {errorList.length > 0 && (
                            <div className="mt-8 border border-terra/40 px-5 py-4" role="alert" aria-live="polite">
                                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-terra mb-2">Please fix the following</p>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    {errorList.map((err) => (
                                        <li key={err.id}>
                                            <a href={`#contact-${err.id}`} className="text-graphite hover:text-copper">
                                                {err.message}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="mt-10 space-y-7" data-testid="contact-form" noValidate>
                            {[
                                { id: 'name', label: 'Name', type: 'text', required: true, max: MAX.name },
                                { id: 'company', label: 'Company', type: 'text', required: true, max: MAX.company },
                                { id: 'email', label: 'Work Email', type: 'email', required: true, max: MAX.email },
                                { id: 'phone', label: 'Phone / WhatsApp (optional)', type: 'tel', required: false, max: MAX.phone },
                                { id: 'country', label: 'Country (optional)', type: 'text', required: false, max: MAX.country },
                                { id: 'subject', label: 'Subject (optional)', type: 'text', required: false, max: MAX.subject },
                            ].map((f) => (
                                <label key={f.id} className="block" htmlFor={`contact-${f.id}`}>
                                    <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">{f.label}</span>
                                    <input
                                        id={`contact-${f.id}`}
                                        type={f.type}
                                        required={f.required}
                                        maxLength={f.max}
                                        value={form[f.id]}
                                        onChange={(e) => set(f.id, e.target.value)}
                                        aria-invalid={errors[f.id] ? 'true' : undefined}
                                        aria-describedby={errors[f.id] ? `contact-${f.id}-error` : undefined}
                                        className={fieldCls}
                                        data-testid={`contact-input-${f.id}`}
                                    />
                                    {errors[f.id] && (
                                        <span id={`contact-${f.id}-error`} className="block mt-1 text-xs text-terra">
                                            {errors[f.id]}
                                        </span>
                                    )}
                                </label>
                            ))}

                            <label className="block" htmlFor="contact-intent">
                                <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">Enquiry Type</span>
                                <select
                                    id="contact-intent"
                                    value={form.intent}
                                    onChange={(e) => set('intent', e.target.value)}
                                    className={fieldCls}
                                    data-testid="contact-input-intent"
                                >
                                    {INTENT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block" htmlFor="contact-message">
                                <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">Message</span>
                                <textarea
                                    id="contact-message"
                                    required
                                    rows={4}
                                    maxLength={MAX.message}
                                    value={form.message}
                                    onChange={(e) => set('message', e.target.value)}
                                    aria-invalid={errors.message ? 'true' : undefined}
                                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                                    className={`${fieldCls} resize-y`}
                                    data-testid="contact-input-message"
                                />
                                {errors.message && (
                                    <span id="contact-message-error" className="block mt-1 text-xs text-terra">
                                        {errors.message}
                                    </span>
                                )}
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
                                className="inline-flex items-center gap-2 bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                                data-testid="contact-submit"
                            >
                                {submitting ? 'Sending…' : 'Send message'} <ArrowUpRight size={14} aria-hidden="true" />
                            </button>

                            <p className="text-xs text-mute">
                                Prefer a structured trade brief?{' '}
                                <Link to="/request-quote" className="text-copper underline-offset-4 hover:underline">
                                    Use Request a Quote
                                </Link>
                                .
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            <FaqAccordion
                items={getFaqsByIds(FAQ_BY_CONTEXT.contact)}
                index="03"
                label="Contact FAQ"
                title="Before you write"
                className="bg-bone text-graphite"
                testId="contact-faq"
            />
        </main>
    );
}
