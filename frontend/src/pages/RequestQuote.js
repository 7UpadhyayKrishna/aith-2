import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Seo from '../components/Seo';
import { Line, Fade, EASE } from '../components/Reveal';
import { CATEGORIES } from '../data/content';
import { CONTACT } from '../data/contact';
import { submitQuote } from '../services/forms';

const UNITS = ['MT', 'KG', 'CBM', 'Containers', 'Units'];
const TIMELINES = ['Immediately', 'Within 30 days', '60-90 days', 'Flexible'];
const MODES = ['Air', 'Sea', 'Road', 'Flexible'];
const REQUIREMENT_TYPES = ['Import', 'Export', 'Product Sourcing', 'Procurement', 'Distribution', 'Other'];
const YES_NO = ['Yes', 'No'];
const INCOTERMS = ['FOB', 'CIF', 'CFR', 'EXW', 'DAP', 'Other'];

const STEP_TITLES = [
    'YOUR CONTACT.',
    'REQUIREMENT TYPE.',
    'PRODUCT DETAILS.',
    'SHIPMENT.',
    'COMMERCIAL & QUALITY.',
    'REVIEW & SUBMIT.',
];

const inputCls =
    'w-full bg-transparent border-b border-ivory/25 focus:border-copper outline-none py-4 text-xl lg:text-2xl placeholder:text-ivory/25 transition-colors duration-500';

const Choice = ({ label, selected, onClick, testid }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`px-4 sm:px-5 py-3 font-mono text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.18em] uppercase border transition-colors duration-300 ${
            selected ? 'bg-copper border-copper text-ivory' : 'border-ivory/25 text-ivory/70 hover:border-ivory/60'
        }`}
        data-testid={testid}
    >
        {label}
    </button>
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapTypeParam(type) {
    if (type === 'partner') return 'Distribution';
    if (type === 'sourcing') return 'Product Sourcing';
    return '';
}

export default function RequestQuote() {
    const [params] = useSearchParams();
    const type = params.get('type');
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [failed, setFailed] = useState(false);
    const [submitMode, setSubmitMode] = useState(null);
    const [refCode] = useState(() => 'AITH-' + Math.random().toString(36).slice(2, 8).toUpperCase());
    const [knowIncoterm, setKnowIncoterm] = useState(false);
    const [data, setData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        country: '',
        requirementType: mapTypeParam(type),
        product: params.get('product') || '',
        category: params.get('category') || '',
        specification: '',
        quantity: '',
        unit: 'MT',
        origin: '',
        supplierKnown: '',
        destination: '',
        mode: 'Flexible',
        timeline: 'Flexible',
        incoterm: '',
        budget: '',
        packaging: '',
        oem: '',
        qualityRequirements: '',
        certifications: '',
        inspection: '',
        documentation: '',
        notes: '',
        role: params.get('role')
            ? params.get('role')[0].toUpperCase() + params.get('role').slice(1)
            : 'Buyer',
        website: '',
    });

    const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
    const emailOk = EMAIL_RE.test(data.email);

    const valid = [
        data.name.trim().length > 1 && data.company.trim().length > 1 && emailOk,
        data.requirementType.length > 0,
        data.product.trim().length > 1 && data.quantity.trim().length > 0,
        data.destination.trim().length > 1,
        true,
        true,
    ][step];

    const submit = async () => {
        if (submitting) return;
        setSubmitting(true);
        setFailed(false);
        try {
            const result = await submitQuote({ ...data, refCode });
            setSubmitMode(result.mode);
            if (result.mode === 'mailto' && result.mailto) {
                // Mailto opened ≠ Mongo persistence - UI distinguishes via submitMode
                window.open(result.mailto, '_blank');
            }
            if (result.ok) setDone(true);
            else setFailed(true);
        } catch {
            setFailed(true);
        } finally {
            setSubmitting(false);
        }
    };

    const next = () => (step === 5 ? submit() : setStep((s) => s + 1));
    const goToStep = (i) => setStep(i);

    const headline =
        type === 'partner'
            ? ['PARTNER', 'WITH AITH.']
            : type === 'sourcing'
                ? ["CAN'T SOURCE IT?", 'WE CAN.']
                : ['HAVE A', 'REQUIREMENT?'];

    const SummaryRow = ({ label, value, editStep }) =>
        value ? (
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 py-3 border-b border-ivory/10">
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ivory/45">{label}</p>
                <div className="flex items-center gap-3 min-w-0">
                    <p className="text-sm sm:text-base text-ivory/85 break-words text-right sm:text-left">{value}</p>
                    <button
                        type="button"
                        onClick={() => goToStep(editStep)}
                        className="font-mono text-[10px] tracking-[0.16em] uppercase text-copper shrink-0 hover:underline"
                    >
                        Edit
                    </button>
                </div>
            </div>
        ) : null;

    return (
        <main id="main-content" className="bg-forest text-ivory min-h-screen relative overflow-x-clip" data-testid="request-quote-page">
            <Seo
                title="Request a Quote"
                description="Start a trade requirement with Asian International Trade House - product, volume, destination and timeline."
                path="/request-quote"
            />
            <span className="absolute top-28 right-8 font-mono text-[10px] tracking-[0.3em] text-ivory/20 hidden lg:block">
                SOURCE / VERIFY / MOVE
            </span>
            <span className="absolute bottom-16 left-8 font-mono text-[10px] tracking-[0.3em] text-ivory/20 hidden lg:block">
                {CONTACT.coordinates}
            </span>

            <div className="relative z-10 px-5 sm:px-6 lg:px-12 pt-36 sm:pt-40 lg:pt-48 pb-24 max-w-6xl">
                {!started && !done && (
                    <>
                        <Fade y={10}>
                            <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-ivory/60">
                                AITH / {type === 'partner' ? 'Partnership' : type === 'sourcing' ? 'Sourcing Request' : 'Trade Request'}
                            </p>
                        </Fade>
                        <h1
                            className="text-[clamp(2.4rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] font-extrabold mt-8"
                            data-testid="quote-intro-headline"
                        >
                            <Line delay={0.15}>{headline[0]}</Line>
                            <Line delay={0.3}>
                                <span className="font-serif italic font-normal text-copper">{headline[1]}</span>
                            </Line>
                        </h1>
                        {type !== 'partner' && type !== 'sourcing' && (
                            <Line delay={0.45}>
                                <span className="block text-[clamp(2.4rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] font-extrabold">
                                    LET&apos;S SOURCE IT.
                                </span>
                            </Line>
                        )}
                        <Fade delay={0.5}>
                            <p className="text-ivory/65 text-sm lg:text-base leading-relaxed mt-10 max-w-xl">
                                A structured trade brief - contact, requirement type, product, shipment and commercial notes - so we can respond with a clear commercial path.
                            </p>
                            <div className="flex flex-wrap items-center gap-6 mt-12">
                                <button
                                    onClick={() => setStarted(true)}
                                    className="group inline-flex items-center gap-3 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                                    data-testid="quote-start-button"
                                >
                                    {type === 'partner' ? 'Start a Partnership Request' : 'Start a Trade Request'}
                                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                                </button>
                                <a
                                    href={`mailto:${CONTACT.email}`}
                                    className="font-mono text-[11px] tracking-[0.2em] uppercase text-ivory/60 hover:text-ivory border-b border-ivory/30 pb-1 transition-colors duration-300 break-all"
                                    data-testid="quote-email-link"
                                >
                                    Prefer email - {CONTACT.email}
                                </a>
                            </div>
                        </Fade>
                    </>
                )}

                {started && !done && (
                    <div data-testid="quote-form">
                        <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.3em] uppercase text-ivory/60 mb-4 gap-3">
                            <span>{type === 'partner' ? 'Partnership Request' : 'Trade Request'}</span>
                            <span className="text-copper shrink-0" data-testid="quote-progress-label">
                                0{step + 1} / 06
                            </span>
                        </div>
                        <div className="h-px bg-ivory/15 mb-12 lg:mb-20">
                            <motion.div
                                className="h-px bg-copper origin-left"
                                initial={false}
                                animate={{ scaleX: (step + 1) / 6 }}
                                transition={{ duration: 0.6, ease: EASE }}
                                data-testid="quote-progress-line"
                            />
                        </div>

                        {failed && (
                            <div className="mb-8 border border-terra/50 px-5 py-4" role="alert" data-testid="quote-submit-error">
                                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-copper">Submission failed</p>
                                <p className="text-sm text-ivory/70 mt-2">Please retry, or email {CONTACT.email} with your brief.</p>
                                <button
                                    type="button"
                                    onClick={submit}
                                    className="mt-3 font-mono text-[11px] tracking-[0.18em] uppercase text-copper underline-offset-4 hover:underline"
                                >
                                    Retry submit
                                </button>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.45, ease: EASE }}
                            >
                                <h2
                                    className="text-[clamp(1.75rem,4.5vw,4.2rem)] leading-[0.98] tracking-[-0.02em] font-extrabold"
                                    data-testid="quote-step-title"
                                >
                                    {STEP_TITLES[step]}
                                </h2>

                                <div className="mt-10 lg:mt-14 max-w-2xl space-y-8 sm:space-y-10">
                                    {step === 0 && (
                                        <>
                                            <input value={data.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" className={inputCls} aria-label="Full name" data-testid="quote-input-name" />
                                            <input value={data.company} onChange={(e) => set('company', e.target.value)} placeholder="Company" className={inputCls} aria-label="Company" data-testid="quote-input-company" />
                                            <input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} placeholder="Work email" className={inputCls} aria-label="Work email" data-testid="quote-input-email" />
                                            <input value={data.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone (optional)" className={inputCls} aria-label="Phone" data-testid="quote-input-phone" />
                                            <input value={data.country} onChange={(e) => set('country', e.target.value)} placeholder="Country" className={inputCls} aria-label="Country" data-testid="quote-input-country" />
                                            <input type="text" name="website" value={data.website} onChange={(e) => set('website', e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" />
                                        </>
                                    )}

                                    {step === 1 && (
                                        <div className="flex flex-wrap gap-3">
                                            {REQUIREMENT_TYPES.map((r) => (
                                                <Choice key={r} label={r} selected={data.requirementType === r} onClick={() => set('requirementType', r)} testid={`quote-req-${r.toLowerCase().replace(/\s+/g, '-')}`} />
                                            ))}
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <>
                                            <div className="flex flex-wrap gap-3">
                                                {CATEGORIES.map((c) => (
                                                    <Choice key={c.id} label={c.name} selected={data.category === c.id} onClick={() => set('category', c.id)} testid={`quote-category-${c.id}`} />
                                                ))}
                                                <Choice label="Other" selected={data.category === 'other'} onClick={() => set('category', 'other')} testid="quote-category-other" />
                                            </div>
                                            <input value={data.product} onChange={(e) => set('product', e.target.value)} placeholder="Product name - e.g. Basmati rice, 5% broken" className={inputCls} aria-label="Product" data-testid="quote-input-product" />
                                            <textarea value={data.specification} onChange={(e) => set('specification', e.target.value)} placeholder="Specification (optional)" rows={2} className={`${inputCls} text-base lg:text-lg resize-y`} aria-label="Specification" data-testid="quote-input-spec" />
                                            <input value={data.quantity} onChange={(e) => set('quantity', e.target.value)} placeholder="Quantity - e.g. 500" className={inputCls} aria-label="Quantity" data-testid="quote-input-quantity" />
                                            <div className="flex flex-wrap gap-3">
                                                {UNITS.map((u) => (
                                                    <Choice key={u} label={u} selected={data.unit === u} onClick={() => set('unit', u)} testid={`quote-unit-${u.toLowerCase()}`} />
                                                ))}
                                            </div>
                                            <input value={data.origin} onChange={(e) => set('origin', e.target.value)} placeholder="Preferred origin (optional)" className={inputCls} aria-label="Origin" data-testid="quote-input-origin" />
                                            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45">Supplier known?</p>
                                            <div className="flex flex-wrap gap-3">
                                                {YES_NO.map((y) => (
                                                    <Choice key={y} label={y} selected={data.supplierKnown === y} onClick={() => set('supplierKnown', y)} testid={`quote-supplier-${y.toLowerCase()}`} />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {step === 3 && (
                                        <>
                                            <input value={data.destination} onChange={(e) => set('destination', e.target.value)} placeholder="Destination country or port" className={inputCls} aria-label="Destination" data-testid="quote-input-destination" />
                                            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45">Shipping preference</p>
                                            <div className="flex flex-wrap gap-3">
                                                {MODES.map((m) => (
                                                    <Choice key={m} label={m} selected={data.mode === m} onClick={() => set('mode', m)} testid={`quote-mode-${m.toLowerCase()}`} />
                                                ))}
                                            </div>
                                            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45 pt-2">Target delivery</p>
                                            <div className="flex flex-wrap gap-3">
                                                {TIMELINES.map((t) => (
                                                    <Choice key={t} label={t} selected={data.timeline === t} onClick={() => set('timeline', t)} testid={`quote-timeline-${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} />
                                                ))}
                                            </div>
                                            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45 pt-2">Do you know the Incoterm?</p>
                                            <div className="flex flex-wrap gap-3">
                                                <Choice label="Yes" selected={knowIncoterm} onClick={() => setKnowIncoterm(true)} testid="quote-incoterm-yes" />
                                                <Choice
                                                    label="No / unsure"
                                                    selected={!knowIncoterm}
                                                    onClick={() => {
                                                        setKnowIncoterm(false);
                                                        set('incoterm', '');
                                                    }}
                                                    testid="quote-incoterm-no"
                                                />
                                            </div>
                                            {knowIncoterm && (
                                                <div className="flex flex-wrap gap-3">
                                                    {INCOTERMS.map((i) => (
                                                        <Choice key={i} label={i} selected={data.incoterm === i} onClick={() => set('incoterm', i)} testid={`quote-incoterm-${i.toLowerCase()}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {step === 4 && (
                                        <>
                                            <input value={data.budget} onChange={(e) => set('budget', e.target.value)} placeholder="Target budget (optional)" className={inputCls} aria-label="Budget" data-testid="quote-input-budget" />
                                            <input value={data.packaging} onChange={(e) => set('packaging', e.target.value)} placeholder="Packaging requirements (optional)" className={inputCls} aria-label="Packaging" data-testid="quote-input-packaging" />
                                            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45">Private label / OEM?</p>
                                            <div className="flex flex-wrap gap-3">
                                                {YES_NO.map((y) => (
                                                    <Choice key={y} label={y} selected={data.oem === y} onClick={() => set('oem', y)} testid={`quote-oem-${y.toLowerCase()}`} />
                                                ))}
                                            </div>
                                            <textarea value={data.qualityRequirements} onChange={(e) => set('qualityRequirements', e.target.value)} placeholder="Quality requirements (optional)" rows={2} className={`${inputCls} text-base lg:text-lg resize-y`} aria-label="Quality" data-testid="quote-input-quality" />
                                            <textarea value={data.certifications} onChange={(e) => set('certifications', e.target.value)} placeholder="Certification / compliance (optional)" rows={2} className={`${inputCls} text-base lg:text-lg resize-y`} aria-label="Certifications" data-testid="quote-input-certs" />
                                            <textarea value={data.inspection} onChange={(e) => set('inspection', e.target.value)} placeholder="Inspection requirements (optional)" rows={2} className={`${inputCls} text-base lg:text-lg resize-y`} aria-label="Inspection" data-testid="quote-input-inspection" />
                                            <textarea value={data.documentation} onChange={(e) => set('documentation', e.target.value)} placeholder="Additional documentation (optional)" rows={2} className={`${inputCls} text-base lg:text-lg resize-y`} aria-label="Documentation" data-testid="quote-input-docs" />
                                            <textarea value={data.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything else we should know (optional)" rows={2} className={`${inputCls} text-base lg:text-lg resize-y`} aria-label="Notes" data-testid="quote-input-notes" />
                                        </>
                                    )}

                                    {step === 5 && (
                                        <div className="space-y-1" data-testid="quote-review">
                                            <SummaryRow label="Contact" value={`${data.name} · ${data.email}`} editStep={0} />
                                            <SummaryRow label="Company" value={`${data.company}${data.country ? ` · ${data.country}` : ''}`} editStep={0} />
                                            <SummaryRow label="Requirement" value={data.requirementType} editStep={1} />
                                            <SummaryRow label="Product" value={`${data.product}${data.category ? ` (${data.category})` : ''}`} editStep={2} />
                                            <SummaryRow label="Quantity" value={`${data.quantity} ${data.unit}`} editStep={2} />
                                            <SummaryRow label="Origin" value={data.origin} editStep={2} />
                                            <SummaryRow label="Destination" value={data.destination} editStep={3} />
                                            <SummaryRow label="Mode / timing" value={`${data.mode} · ${data.timeline}`} editStep={3} />
                                            <SummaryRow label="Incoterm" value={data.incoterm} editStep={3} />
                                            <SummaryRow label="Budget" value={data.budget} editStep={4} />
                                            <SummaryRow label="Quality" value={data.qualityRequirements} editStep={4} />
                                            <SummaryRow label="Certifications" value={data.certifications} editStep={4} />
                                            <p className="text-xs text-ivory/45 pt-6">
                                                Submitting stores your brief with AITH or opens your email client if the API is unavailable. We do not show a false success state.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex flex-wrap items-center gap-6 sm:gap-8 mt-14 lg:mt-20">
                            {step > 0 && (
                                <button
                                    onClick={() => setStep((s) => s - 1)}
                                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-ivory/60 hover:text-ivory transition-colors duration-300"
                                    data-testid="quote-back-button"
                                >
                                    <ArrowLeft size={14} /> Back
                                </button>
                            )}
                            <button
                                onClick={next}
                                disabled={!valid || submitting}
                                className={`group inline-flex items-center gap-3 px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 min-h-[48px] ${
                                    valid && !submitting
                                        ? 'bg-copper text-ivory hover:bg-terra'
                                        : 'bg-ivory/10 text-ivory/35 cursor-not-allowed'
                                }`}
                                data-testid={step === 5 ? 'quote-submit-button' : 'quote-next-button'}
                            >
                                {step === 5 ? (submitting ? 'Submitting…' : 'Submit Request') : 'Continue'}
                                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                            </button>
                        </div>
                    </div>
                )}

                {done && (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EASE }}
                        data-testid="quote-confirmation"
                    >
                        <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-copper">
                            {submitMode === 'api' ? 'Request Received' : 'Request Prepared'}
                        </p>
                        <h1 className="text-[clamp(2.4rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] font-extrabold mt-8">
                            WE&apos;LL BE
                            <br />
                            <span className="font-serif italic font-normal">IN TOUCH.</span>
                        </h1>
                        <div className="border border-ivory/20 p-6 lg:p-8 mt-12 max-w-xl">
                            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-ivory/50">Reference</p>
                            <p className="font-mono text-2xl tracking-[0.15em] text-copper mt-2" data-testid="quote-reference-code">
                                {refCode}
                            </p>
                            <div className="mt-6 space-y-2 font-mono text-[11px] tracking-[0.12em] text-ivory/65">
                                <p>TYPE - {data.requirementType.toUpperCase()}</p>
                                <p>PRODUCT - {data.product}</p>
                                <p>
                                    QUANTITY - {data.quantity} {data.unit.toUpperCase()}
                                </p>
                                <p>DESTINATION - {data.destination}</p>
                                {data.origin && <p>ORIGIN - {data.origin}</p>}
                                <p>TIMELINE - {data.timeline.toUpperCase()}</p>
                                <p>MODE - {data.mode.toUpperCase()}</p>
                                {data.incoterm && <p>INCOTERM - {data.incoterm.toUpperCase()}</p>}
                            </div>
                        </div>
                        <p className="text-ivory/45 text-xs mt-6 max-w-md">
                            {submitMode === 'api'
                                ? 'Your requirement has been submitted. Our team will review it and follow up with next steps.'
                                : 'Your email client may have opened with a prepared copy of this request. That is a fallback - it is not the same as a confirmed server submission. If the client did not open, please email the brief to us directly.'}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-12">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-3 border border-ivory/30 text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:border-ivory transition-colors duration-300"
                                data-testid="confirmation-products-link"
                            >
                                Explore Products
                            </Link>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-3 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                                data-testid="confirmation-home-link"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
