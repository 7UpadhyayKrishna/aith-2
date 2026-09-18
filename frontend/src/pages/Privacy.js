import { Link } from 'react-router-dom';
import Seo, { breadcrumbJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import { Fade, Tag } from '../components/Reveal';
import { CONTACT } from '../data/contact';
import { SITE_NAME, SITE_EMAIL, SITE_ORIGIN, SHOW_LEGAL_DRAFT_BANNER } from '../config/site';

/**
 * LEGAL_STATUS = "draft"
 * Structure is counsel-ready. Content is informational until legal approval.
 * Do not invent jurisdictional commitments, retention periods, or processor lists.
 */
const LEGAL_STATUS = 'draft';
const LAST_UPDATED = '2026-03-17';

const SECTIONS = [
    {
        id: 'collect',
        h: 'Information we collect',
        p: `When you use Contact, Careers or Request Quote forms, we collect the details you submit — such as name, email, company, phone, country and trade requirement text. Server infrastructure may generate technical logs (for example IP address, request time and user agent). Analytics tools configured in production may collect page-view and device information. A full processor inventory will be confirmed by counsel before this notice is treated as final.`,
    },
    {
        id: 'use',
        h: 'How we use information',
        p: 'We use enquiry data to respond to trade requests, partnership discussions, career applications and support questions; to operate and improve the website; and to meet legal obligations where applicable. We do not sell personal information. Lawful bases, retention schedules and secondary uses require legal confirmation before this section is treated as binding.',
    },
    {
        id: 'sharing',
        h: 'Sharing',
        p: 'Information may be shared with service providers who host email, databases, CRM or analytics on our behalf, under contractual controls. Named processors and international transfer wording will be supplied by counsel. We do not list unverified third parties on this page.',
    },
    {
        id: 'cookies',
        h: 'Cookies and analytics',
        p: 'The site may use cookies or similar technologies for essential operation and analytics (including third-party tools configured in production). Whether a consent banner is required, and the precise cookie table, are decisions for counsel and the deployment environment.',
    },
    {
        id: 'rights',
        h: 'Your rights',
        p: `Depending on your jurisdiction, you may have rights to access, correct, delete or restrict processing of personal data. Contact ${SITE_EMAIL} to raise a privacy enquiry. Jurisdiction-specific rights language will be added after legal review.`,
    },
    {
        id: 'contact',
        h: 'Contact',
        p: `Privacy enquiries: ${SITE_EMAIL}. Office locality: ${CONTACT.addressLine2}. Postal address: ${CONTACT.addressLine1}.`,
    },
];

export default function Privacy() {
    return (
        <main id="main-content" className="overflow-x-clip">
            <Seo
                title="Privacy Policy"
                description={`How ${SITE_NAME} handles enquiry and website data. Contact ${SITE_EMAIL} for privacy questions.`}
                path="/privacy"
                jsonLd={breadcrumbJsonLd([
                    { name: 'Home', path: '/' },
                    { name: 'Privacy Policy', path: '/privacy' },
                ])}
            />
            <PageHero
                kicker="AITH / Legal"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Privacy Policy' },
                ]}
                titleLines={['PRIVACY', 'POLICY.']}
                lead="How we handle information submitted through this website and related enquiry channels. Binding policy language is confirmed after legal review."
                dark={false}
                testId="privacy-hero"
            />

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-16 lg:py-24 print:py-8">
                <div className="max-w-3xl print:max-w-none">
                    {SHOW_LEGAL_DRAFT_BANNER && LEGAL_STATUS === 'draft' && (
                        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-mute mb-4" data-legal-status="draft">
                            Draft — for review
                        </p>
                    )}
                    <Tag index="01" label="Notice" />
                    <Fade>
                        <p className="mt-8 text-sm leading-relaxed text-mute">
                            Last updated: {LAST_UPDATED}. Controller: {SITE_NAME} ({SITE_ORIGIN}). Contact: {SITE_EMAIL}.
                        </p>
                    </Fade>

                    <nav aria-label="On this page" className="mt-10 border border-graphite/15 p-5 print:border-graphite/40">
                        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-mute mb-3">Contents</p>
                        <ol className="space-y-2">
                            {SECTIONS.map((s, i) => (
                                <li key={s.id}>
                                    <a
                                        href={`#${s.id}`}
                                        className="text-sm text-graphite/80 hover:text-copper transition-colors duration-300 ease-editorial"
                                    >
                                        {String(i + 1).padStart(2, '0')} — {s.h}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    {SECTIONS.map((block, i) => (
                        <Fade key={block.id} delay={0.05 * i}>
                            <h2 id={block.id} className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-14 mb-4 scroll-mt-28">
                                {block.h}
                            </h2>
                            <p className="text-sm leading-relaxed text-mute max-w-prose">{block.p}</p>
                        </Fade>
                    ))}

                    <p className="mt-16 text-xs text-mute">
                        Questions?{' '}
                        <Link to="/contact" className="text-copper underline-offset-4 hover:underline">
                            Contact us
                        </Link>
                        .
                    </p>
                </div>
            </section>
        </main>
    );
}
