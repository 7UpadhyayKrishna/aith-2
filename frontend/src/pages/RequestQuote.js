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
const TIMELINES = ['Immediately', 'Within 30 days', '60–90 days', 'Flexible'];
const MODES = ['Air', 'Sea', 'Flexible'];
const ROLES = ['Buyer', 'Supplier', 'Distributor'];

const STEP_TITLES = [
    'WHAT DO YOU NEED?',
    'HOW MUCH?',
    'WHERE DO YOU NEED IT?',
    'WHEN?',
    'YOUR COMPANY.',
    'CONTACT DETAILS.',
];

const inputCls =
    'w-full bg-transparent border-b border-ivory/25 focus:border-copper outline-none py-4 text-xl lg:text-2xl placeholder:text-ivory/25 transition-colors duration-500';

const Choice = ({ label, selected, onClick, testid }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`px-5 py-3 font-mono text-[11px] tracking-[0.18em] uppercase border transition-colors duration-300 ${selected ? 'bg-copper border-copper text-ivory' : 'border-ivory/25 text-ivory/70 hover:border-ivory/60'
            }`}
        data-testid={testid}
    >
        {label}
    </button>
);

export default function RequestQuote() {
    const [params] = useSearchParams();
    const type = params.get('type');
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [mailtoNote, setMailtoNote] = useState(false);
    const [refCode] = useState(() => 'AITH-' + Math.random().toString(36).slice(2, 8).toUpperCase());
    const [data, setData] = useState({
        product: params.get('product') || '',
        category: params.get('category') || '',
        quantity: '',
        unit: 'MT',
        destination: '',
        origin: '',
        timeline: 'Flexible',
        mode: 'Flexible',
        incoterm: '',
        notes: '',
        company: '',
        country: '',
        role: params.get('role') ? params.get('role')[0].toUpperCase() + params.get('role').slice(1) : 'Buyer',
        name: '',
        email: '',
        phone: '',
        website: '',
    });

    const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    const valid = [
        data.product.trim().length > 1,
        data.quantity.trim().length > 0,
        data.destination.trim().length > 1,
        true,
        data.company.trim().length > 1,
        data.name.trim().length > 1 && emailOk,
    ][step];

    const submit = async () => {
        setSubmitting(true);
        try {
            const result = await submitQuote({ ...data, refCode });
            if (result.mode === 'mailto' && result.mailto) {
                window.open(result.mailto, '_blank');
                setMailtoNote(true);
            }
            setDone(true);
        } finally {
            setSubmitting(false);
        }
    };

    const next = () => (step === 5 ? submit() : setStep((s) => s + 1));

    const headline =
        type === 'partner' ? ['PARTNER', 'WITH AITH.'] : type === 'sourcing' ? ["CAN'T SOURCE IT?", 'WE CAN.'] : ['HAVE A', 'REQUIREMENT?'];

    return (
        <main id="main-content" className="bg-forest text-ivory min-h-screen relative overflow-hidden" data-testid="request-quote-page">
            <Seo
                title="Request a Quote"
                description="Start a trade requirement with Asian International Trade House — product, volume, destination and timeline."
                path="/request-quote"
            />
            <span className="absolute top-28 right-8 font-mono text-[10px] tracking-[0.3em] text-ivory/20 hidden lg:block">SOURCE / VERIFY / MOVE</span>
            <span className="absolute bottom-16 left-8 font-mono text-[10px] tracking-[0.3em] text-ivory/20 hidden lg:block">28°36'N 77°13'E</span>

            <div className="relative z-10 px-6 lg:px-12 pt-40 lg:pt-48 pb-24 max-w-6xl">
                {!started && !done && (
                    <>
                        <Fade y={10}>
                            <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-ivory/60">
                                AITH / {type === 'partner' ? 'Partnership' : type === 'sourcing' ? 'Sourcing Request' : 'Trade Request'}
                            </p>
                        </Fade>
                        <h1 className="text-[clamp(2.9rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] font-extrabold mt-8" data-testid="quote-intro-headline">
                            <Line delay={0.15}>{headline[0]}</Line>
                            <Line delay={0.3}>
                                <span className="font-serif italic font-normal text-copper">{headline[1]}</span>
                            </Line>
                        </h1>
                        {type !== 'partner' && type !== 'sourcing' && (
                            <Line delay={0.45}>
                                <span className="block text-[clamp(2.9rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] font-extrabold">LET'S SOURCE IT.</span>
                            </Line>
                        )}
                        <Fade delay={0.5}>
                            <p className="text-ivory/65 text-sm lg:text-base leading-relaxed mt-10 max-w-xl">
                                Tell us what you need, where you need it and how much. We review the requirement, explore sourcing options and coordinate the next steps.
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
                                <a href={`mailto:${CONTACT.email}`} className="font-mono text-[11px] tracking-[0.2em] uppercase text-ivory/60 hover:text-ivory border-b border-ivory/30 pb-1 transition-colors duration-300" data-testid="quote-email-link">
                                    Prefer email — {CONTACT.email}
                                </a>
                            </div>
                        </Fade>
                    </>
                )}

                {started && !done && (
                    <div data-testid="quote-form">
                        <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.3em] uppercase text-ivory/60 mb-4">
                            <span>{type === 'partner' ? 'Partnership Request' : 'Trade Request'}</span>
                            <span className="text-copper" data-testid="quote-progress-label">0{step + 1} / 06</span>
                        </div>
                        <div className="h-px bg-ivory/15 mb-14 lg:mb-20">
                            <motion.div
                                className="h-px bg-copper origin-left"
                                initial={false}
                                animate={{ scaleX: (step + 1) / 6 }}
                                transition={{ duration: 0.6, ease: EASE }}
                                data-testid="quote-progress-line"
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 60 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -60 }}
                                transition={{ duration: 0.55, ease: EASE }}
                            >
                                <h2 className="text-[clamp(2rem,4.5vw,4.2rem)] leading-[0.98] tracking-[-0.02em] font-extrabold" data-testid="quote-step-title">
                                    {STEP_TITLES[step]}
                                </h2>

                                <div className="mt-10 lg:mt-14 max-w-2xl space-y-10">
                                    {step === 0 && (
                                        <>
                                            <input
                                                value={data.product}
                                                onChange={(e) => set('product', e.target.value)}
                                                placeholder="Product, material or commodity — e.g. Basmati rice, 5% broken"
                                                className={inputCls}
                                                aria-label="Product or material"
                                                data-testid="quote-input-product"
                                            />
                                            <div className="flex flex-wrap gap-3">
                                                {CATEGORIES.map((c) => (
                                                    <Choice key={c.id} label={c.name} selected={data.category === c.id} onClick={() => set('category', c.id)} testid={`quote-category-${c.id}`} />
                                                ))}
                                                <Choice label="Other" selected={data.category === 'other'} onClick={() => set('category', 'other')} testid="quote-category-other" />
                                            </div>
                                        </>
                                    )}
                                    {step === 1 && (
                                        <>
                                            <input
                                                value={data.quantity}
                                                onChange={(e) => set('quantity', e.target.value)}
                                                placeholder="Quantity — e.g. 500"
                                                className={inputCls}
                                                aria-label="Quantity"
                                                data-testid="quote-input-quantity"
                                            />
                                            <div className="flex flex-wrap gap-3">
                                                {UNITS.map((u) => (
                                                    <Choice key={u} label={u} selected={data.unit === u} onClick={() => set('unit', u)} testid={`quote-unit-${u.toLowerCase()}`} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {step === 2 && (
                                        <>
                                            <input
                                                value={data.destination}
                                                onChange={(e) => set('destination', e.target.value)}
                                                placeholder="Destination country or port — e.g. Jebel Ali, UAE"
                                                className={inputCls}
                                                aria-label="Destination"
                                                data-testid="quote-input-destination"
                                            />
                                            <input
                                                value={data.origin}
                                                onChange={(e) => set('origin', e.target.value)}
                                                placeholder="Origin country or port (optional) — e.g. Mundra, India"
                                                className={inputCls}
                                                aria-label="Origin"
                                                data-testid="quote-input-origin"
                                            />
                                        </>
                                    )}
                                    {step === 3 && (
                                        <>
                                            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45">Timeline</p>
                                            <div className="flex flex-wrap gap-3">
                                                {TIMELINES.map((t) => (
                                                    <Choice key={t} label={t} selected={data.timeline === t} onClick={() => set('timeline', t)} testid={`quote-timeline-${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} />
                                                ))}
                                            </div>
                                            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45 pt-4">Preferred mode</p>
                                            <div className="flex flex-wrap gap-3">
                                                {MODES.map((m) => (
                                                    <Choice key={m} label={m} selected={data.mode === m} onClick={() => set('mode', m)} testid={`quote-mode-${m.toLowerCase()}`} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {step === 4 && (
                                        <>
                                            <input
                                                value={data.company}
                                                onChange={(e) => set('company', e.target.value)}
                                                placeholder="Company name"
                                                className={inputCls}
                                                aria-label="Company name"
                                                data-testid="quote-input-company"
                                            />
                                            <input
                                                value={data.country}
                                                onChange={(e) => set('country', e.target.value)}
                                                placeholder="Country (optional)"
                                                className={inputCls}
                                                aria-label="Country"
                                                data-testid="quote-input-country"
                                            />
                                            <div className="flex flex-wrap gap-3">
                                                {ROLES.map((r) => (
                                                    <Choice key={r} label={r} selected={data.role === r} onClick={() => set('role', r)} testid={`quote-role-${r.toLowerCase()}`} />
                                                ))}
                                            </div>
                                            <input
                                                value={data.incoterm}
                                                onChange={(e) => set('incoterm', e.target.value)}
                                                placeholder="Incoterm (optional) — e.g. CIF, FOB"
                                                className={inputCls}
                                                aria-label="Incoterm"
                                                data-testid="quote-input-incoterm"
                                            />
                                            <textarea
                                                value={data.notes}
                                                onChange={(e) => set('notes', e.target.value)}
                                                placeholder="Additional notes (optional) — specs, certifications, packaging"
                                                rows={3}
                                                className={`${inputCls} text-base lg:text-lg resize-y`}
                                                aria-label="Additional notes"
                                                data-testid="quote-input-notes"
                                            />
                                        </>
                                    )}
                                    {step === 5 && (
                                        <>
                                            <input
                                                value={data.name}
                                                onChange={(e) => set('name', e.target.value)}
                                                placeholder="Full name"
                                                className={inputCls}
                                                aria-label="Full name"
                                                data-testid="quote-input-name"
                                            />
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => set('email', e.target.value)}
                                                placeholder="Work email"
                                                className={inputCls}
                                                aria-label="Work email"
                                                data-testid="quote-input-email"
                                            />
                                            <input
                                                value={data.phone}
                                                onChange={(e) => set('phone', e.target.value)}
                                                placeholder="Phone (optional)"
                                                className={inputCls}
                                                aria-label="Phone"
                                                data-testid="quote-input-phone"
                                            />
                                            <input
                                                type="text"
                                                name="website"
                                                value={data.website}
                                                onChange={(e) => set('website', e.target.value)}
                                                tabIndex={-1}
                                                autoComplete="off"
                                                aria-hidden="true"
                                                className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
                                            />
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex items-center gap-8 mt-16 lg:mt-20">
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
                                className={`group inline-flex items-center gap-3 px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 ${valid && !submitting ? 'bg-copper text-ivory hover:bg-terra' : 'bg-ivory/10 text-ivory/35 cursor-not-allowed'}`}
                                data-testid={step === 5 ? 'quote-submit-button' : 'quote-next-button'}
                            >
                                {step === 5 ? (submitting ? 'Submitting…' : 'Submit Request') : 'Continue'}
                                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                            </button>
                        </div>
                    </div>
                )}

                {done && (
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} data-testid="quote-confirmation">
                        <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-copper">Request Received</p>
                        <h1 className="text-[clamp(2.9rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] font-extrabold mt-8">
                            WE'LL BE<br />
                            <span className="font-serif italic font-normal">IN TOUCH.</span>
                        </h1>
                        <div className="border border-ivory/20 p-6 lg:p-8 mt-12 max-w-xl">
                            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-ivory/50">Reference</p>
                            <p className="font-mono text-2xl tracking-[0.15em] text-copper mt-2" data-testid="quote-reference-code">{refCode}</p>
                            <div className="mt-6 space-y-2 font-mono text-[11px] tracking-[0.12em] text-ivory/65">
                                <p>PRODUCT — {data.product}</p>
                                <p>QUANTITY — {data.quantity} {data.unit.toUpperCase()}</p>
                                <p>DESTINATION — {data.destination}</p>
                                {data.origin && <p>ORIGIN — {data.origin}</p>}
                                <p>TIMELINE — {data.timeline.toUpperCase()}</p>
                                <p>MODE — {data.mode.toUpperCase()}</p>
                                {data.incoterm && <p>INCOTERM — {data.incoterm.toUpperCase()}</p>}
                            </div>
                        </div>
                        <p className="text-ivory/45 text-xs mt-6 max-w-md">
                            Our team reviews every requirement against the supplier network and responds with sourcing options and next steps.
                            {mailtoNote && ' Your email client may have opened with a copy of this request.'}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-12">
                            <Link to="/products" className="inline-flex items-center gap-3 border border-ivory/30 text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:border-ivory transition-colors duration-300" data-testid="confirmation-products-link">
                                Explore Products
                            </Link>
                            <Link to="/" className="inline-flex items-center gap-3 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300" data-testid="confirmation-home-link">
                                Back to Home
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
