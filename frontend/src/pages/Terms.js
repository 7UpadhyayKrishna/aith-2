import Seo, { breadcrumbJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import { Fade, Tag } from '../components/Reveal';
import { SITE_NAME, SITE_EMAIL } from '../config/site';
import { CONTACT } from '../data/contact';

export default function Terms() {
    return (
        <main id="main-content">
            <Seo
                title="Terms of Trade"
                description="Terms of Trade shell for Asian International Trade House. Legal review required — not final commercial counsel."
                path="/terms"
                jsonLd={breadcrumbJsonLd([
                    { name: 'Home', path: '/' },
                    { name: 'Terms of Trade', path: '/terms' },
                ])}
            />
            <PageHero
                kicker="AITH / Legal"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Terms of Trade' },
                ]}
                titleLines={['TERMS OF', 'TRADE.']}
                lead="This page frames the commercial terms structure for website use and trade discussions. Binding sale, purchase and Incoterm terms are confirmed in written offers and contracts — not solely by this page."
                dark={false}
                testId="terms-hero"
            />

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-20 lg:py-28 max-w-3xl" data-testid="terms-body">
                <Tag index="01" label="Framework" />
                <Fade>
                    <p className="mt-8 text-sm leading-relaxed text-mute">
                        Last updated: [TBD — LEGAL REVIEW]. Issued by {SITE_NAME}. Enquiries: {SITE_EMAIL}. Locality: {CONTACT.addressLine2}.
                    </p>
                </Fade>

                {[
                    {
                        h: 'Website use',
                        p: 'Content on this website is informational. It does not constitute an offer capable of immediate acceptance unless expressly stated in a formal quotation. [TBD — LEGAL REVIEW].',
                    },
                    {
                        h: 'Quotations',
                        p: 'Quotations are invitations to treat unless stated otherwise. Validity, currency, Incoterms, quantity tolerances and payment terms are those stated on the written offer. Market and freight conditions can change; [TBD — LEGAL REVIEW: standard validity and revision clauses].',
                    },
                    {
                        h: 'Orders and contracts',
                        p: 'A binding contract arises only when AITH issues written confirmation or both parties execute an agreed contract document. Email threads alone may not create a contract unless counsel confirms otherwise. [TBD — LEGAL REVIEW].',
                    },
                    {
                        h: 'Specifications and inspection',
                        p: 'Goods are supplied against the specification referenced in the contract. Inspection rights, sampling standards and rejection procedures are those agreed in writing. [TBD — LEGAL REVIEW].',
                    },
                    {
                        h: 'Delivery and risk',
                        p: 'Delivery, risk and cost allocation follow the Incoterm stated in the contract (for example FOB, CFR, CIF or other agreed term). [TBD — LEGAL REVIEW: default Incoterm policy].',
                    },
                    {
                        h: 'Limitation',
                        p: 'To the extent permitted by law, liability for website content and pre-contract discussions is limited. Contractual liability caps and exclusions belong in the signed commercial documents. [TBD — LEGAL REVIEW].',
                    },
                    {
                        h: 'Governing law',
                        p: '[TBD — LEGAL REVIEW: governing law and dispute forum]. Until confirmed, do not treat any jurisdiction statement on this page as final.',
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
