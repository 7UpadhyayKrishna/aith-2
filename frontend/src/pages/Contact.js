import { useState } from 'react';

import { Link } from 'react-router-dom';

import { ArrowUpRight } from 'lucide-react';

import { toast } from 'sonner';

import Seo from '../components/Seo';

import PageHero from '../components/PageHero';

import FaqAccordion from '../components/FaqAccordion';

import { Fade, Tag } from '../components/Reveal';

import { CONTACT, isConfigured } from '../data/contact';

import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';

import { submitContact } from '../services/forms';



const toastStyle = {

    style: { background: '#17231D', color: '#F3F0E8', border: '1px solid rgba(243,240,232,0.15)', borderRadius: '2px' },

};



export default function Contact() {

    const [form, setForm] = useState({

        name: '',

        email: '',

        company: '',

        message: '',

        intent: 'general',

        website: '',

    });

    const [submitting, setSubmitting] = useState(false);



    const onSubmit = async (e) => {

        e.preventDefault();

        setSubmitting(true);

        try {

            const result = await submitContact(form);

            if (result.mode === 'mailto' && result.mailto) {
                toast('Opening your email client to complete the message…', toastStyle);
                window.location.href = result.mailto;
            } else {
                toast('Message received — we will respond shortly.', toastStyle);
            }

            setForm({ name: '', email: '', company: '', message: '', intent: 'general', website: '' });

        } catch {

            toast.error('Something went wrong. Please try again or email us directly.', toastStyle);

        } finally {

            setSubmitting(false);

        }

    };



    const channels = [
        { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}`, configured: true, testId: 'contact-email' },
        { label: 'Phone', value: CONTACT.phone, href: isConfigured(CONTACT.phone) ? `tel:${CONTACT.phoneTel || CONTACT.phone.replace(/\s/g, '')}` : null, configured: isConfigured(CONTACT.phone), testId: 'contact-phone' },
        { label: 'WhatsApp', value: CONTACT.whatsapp, href: null, configured: isConfigured(CONTACT.whatsapp), testId: 'contact-whatsapp' },
        { label: 'Hours', value: CONTACT.hours, href: null, configured: isConfigured(CONTACT.hours), testId: 'contact-hours' },
    ].filter((c) => c.configured);


    return (

        <main id="main-content">

            <Seo

                title="Contact"

                description="Contact Asian International Trade House in New Delhi — trade enquiries, partnership requests and sourcing conversations."

                path="/contact"

            />

            <PageHero

                kicker="AITH / Contact"

                breadcrumb={[

                    { label: 'Home', to: '/' },

                    { label: 'Contact' },

                ]}

                titleLines={['LET\'S TALK', 'TRADE.']}

                italicLast

                lead="Share a requirement, ask a compliance question or start a supplier partnership conversation. We respond to every trade enquiry."

                primaryCta={{ to: '/request-quote', label: 'Request a Quote', testId: 'contact-quote-cta' }}

                testId="contact-hero"

            />



            <section className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="contact-details">

                <div className="grid lg:grid-cols-12 gap-14 lg:gap-16">

                    <div className="lg:col-span-5">

                        <Tag index="01" label="Channels" />

                        <h2 className="text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">

                            Reach the desk

                        </h2>

                        <Fade>

                            <ul className="mt-12 space-y-8">

                                {channels.map((c) => (
                                    <li key={c.label} data-testid={c.testId}>
                                        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-copper mb-2">{c.label}</p>
                                        {c.href ? (
                                            <a href={c.href} className="text-lg lg:text-xl font-extrabold tracking-tight hover:text-copper transition-colors duration-300">
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
                                        <p className="text-sm leading-relaxed text-mute">
                                            {CONTACT.branches.join(' · ')}
                                        </p>
                                    </>
                                ) : null}

                                {CONTACT.gstin ? (
                                    <p className="font-mono text-[11px] tracking-[0.18em] text-mute mt-6">GSTIN {CONTACT.gstin}</p>
                                ) : null}

                                <p className="font-mono text-[11px] tracking-[0.22em] text-mute mt-4">{CONTACT.coordinates}</p>

                                {isConfigured(CONTACT.responseSla) ? (
                                    <p className="text-sm text-mute mt-6">
                                        Response target: {CONTACT.responseSla}
                                    </p>
                                ) : null}
                            </div>

                        </Fade>

                    </div>



                    <div className="lg:col-span-6 lg:col-start-7">

                        <Tag index="02" label="Message" />

                        <h2 className="text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">

                            Write to us

                        </h2>

                        <form onSubmit={onSubmit} className="mt-12 space-y-8" data-testid="contact-form">

                            {[

                                { id: 'name', label: 'Name', type: 'text' },

                                { id: 'email', label: 'Email', type: 'email' },

                                { id: 'company', label: 'Company', type: 'text' },

                            ].map((f) => (

                                <label key={f.id} className="block" htmlFor={`contact-${f.id}`}>

                                    <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">{f.label}</span>

                                    <input

                                        id={`contact-${f.id}`}

                                        type={f.type}

                                        required={f.id !== 'company'}

                                        value={form[f.id]}

                                        onChange={(e) => setForm((s) => ({ ...s, [f.id]: e.target.value }))}

                                        className="mt-2 w-full bg-transparent border-0 border-b border-graphite/25 rounded-none px-0 py-3 text-base focus:outline-none focus:border-copper transition-colors"

                                        data-testid={`contact-input-${f.id}`}

                                    />

                                </label>

                            ))}

                            <label className="block" htmlFor="contact-intent">

                                <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">Intent</span>

                                <select

                                    id="contact-intent"

                                    value={form.intent}

                                    onChange={(e) => setForm((s) => ({ ...s, intent: e.target.value }))}

                                    className="mt-2 w-full bg-transparent border-0 border-b border-graphite/25 rounded-none px-0 py-3 text-base focus:outline-none focus:border-copper transition-colors"

                                    data-testid="contact-input-intent"

                                >

                                    <option value="general">General enquiry</option>

                                    <option value="supplier">Supplier / sourcing</option>

                                    <option value="partnership">Partnership</option>

                                    <option value="support">Support</option>

                                </select>

                            </label>

                            <label className="block" htmlFor="contact-message">

                                <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute">Message</span>

                                <textarea

                                    id="contact-message"

                                    required

                                    rows={4}

                                    value={form.message}

                                    onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}

                                    className="mt-2 w-full bg-transparent border-0 border-b border-graphite/25 rounded-none px-0 py-3 text-base focus:outline-none focus:border-copper transition-colors resize-y"

                                    data-testid="contact-input-message"

                                />

                            </label>

                            <input

                                type="text"

                                name="website"

                                value={form.website}

                                onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}

                                tabIndex={-1}

                                autoComplete="off"

                                aria-hidden="true"

                                className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"

                            />

                            <button

                                type="submit"

                                disabled={submitting}

                                className="inline-flex items-center gap-2 bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"

                                data-testid="contact-submit"

                            >

                                {submitting ? 'Sending…' : 'Send message'} <ArrowUpRight size={14} />

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


