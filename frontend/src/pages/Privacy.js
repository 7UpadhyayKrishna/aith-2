import Seo, { breadcrumbJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import { Fade, Tag } from '../components/Reveal';
import { CONTACT } from '../data/contact';
import { SITE_NAME, SITE_EMAIL, SITE_ORIGIN } from '../config/site';

export default function Privacy() {
    return (
        <main id="main-content">
            <Seo
                title="Privacy Policy"
                description="Privacy policy shell for Asian International Trade House. Legal review required before treating this as final counsel."
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
                lead="This page establishes the information architecture for AITH’s privacy notice. Sections marked [TBD — LEGAL REVIEW] require counsel sign-off before public launch as binding policy."
                dark={false}
                testId="privacy-hero"
            />

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-20 lg:py-28 max-w-3xl" data-testid="privacy-body">
                <Tag index="01" label="Notice" />
                <Fade>
                    <p className="mt-8 text-sm leading-relaxed text-mute">
                        Last updated: [TBD — LEGAL REVIEW]. Controller: {SITE_NAME} ({SITE_ORIGIN}). Contact: {SITE_EMAIL}.
                    </p>
                </Fade>

                {[
                    {
                        h: 'Information we collect',
                        p: 'When you use Contact or Request Quote forms, we collect the details you submit (such as name, email, company, phone and trade requirement). Server logs and analytics tools may collect technical data such as IP address, browser type and pages viewed. [TBD — LEGAL REVIEW: full inventory of processors].',
                    },
                    {
                        h: 'How we use information',
                        p: 'We use enquiry data to respond to trade requests, partnership discussions and support questions; to improve the website; and to meet legal obligations where applicable. We do not sell personal information. [TBD — LEGAL REVIEW: lawful bases and retention periods].',
                    },
                    {
                        h: 'Sharing',
                        p: 'Information may be shared with service providers who host email, CRM or analytics on our behalf, under contractual controls. [TBD — LEGAL REVIEW: named processors and international transfer language].',
                    },
                    {
                        h: 'Cookies and analytics',
                        p: 'The site may use cookies or similar technologies for essential operation and analytics (including third-party tools configured in production). [TBD — LEGAL REVIEW: cookie table and consent mechanism if required].',
                    },
                    {
                        h: 'Your rights',
                        p: 'Depending on your jurisdiction, you may have rights to access, correct, delete or restrict processing of personal data. Contact us at the email above to exercise rights. [TBD — LEGAL REVIEW: jurisdiction-specific rights language].',
                    },
                    {
                        h: 'Contact',
                        p: `Privacy enquiries: ${SITE_EMAIL}. Office locality: ${CONTACT.addressLine2}. Full postal address: ${CONTACT.addressLine1}.`,
                    },
                ].map((block, i) => (
                    <Fade key={block.h} delay={0.05 * i}>
                        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-14 mb-4">{block.h}</h2>
                        <p className="text-sm leading-relaxed text-mute">{block.p}</p>
                    </Fade>
                ))}
            </section>
        </main>
    );
}
