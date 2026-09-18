import { Link } from 'react-router-dom';
import Seo, { breadcrumbJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import { Fade, Tag } from '../components/Reveal';
import { SITE_NAME, SITE_EMAIL, SHOW_LEGAL_DRAFT_BANNER } from '../config/site';
import { CONTACT } from '../data/contact';

/**
 * LEGAL_STATUS = "draft"
 * Counsel-ready structure. No invented governing law, liability caps, or Incoterm defaults.
 */
const LEGAL_STATUS = 'draft';
const LAST_UPDATED = '2026-03-17';

const SECTIONS = [
    {
        id: 'website',
        h: 'Website use',
        p: 'Content on this website is informational. It does not constitute an offer capable of immediate acceptance unless expressly stated in a formal written quotation or contract issued by AITH.',
    },
    {
        id: 'quotations',
        h: 'Quotations',
        p: 'Quotations are invitations to treat unless the written offer states otherwise. Validity, currency, Incoterms, quantity tolerances and payment terms are those stated on the written offer. Market and freight conditions can change; revised quotes may be issued when material inputs move.',
    },
    {
        id: 'orders',
        h: 'Orders and contracts',
        p: 'A binding contract arises only when AITH issues written confirmation or both parties execute an agreed contract document. Informal email threads alone should not be assumed to create a contract unless counsel confirms otherwise for a specific matter.',
    },
    {
        id: 'specs',
        h: 'Specifications and inspection',
        p: 'Goods are supplied against the specification referenced in the contract. Inspection rights, sampling standards and rejection procedures are those agreed in writing between the parties.',
    },
    {
        id: 'delivery',
        h: 'Delivery and risk',
        p: 'Delivery, risk and cost allocation follow the Incoterm stated in the contract (for example FOB, CFR, CIF or another agreed term). No default Incoterm is asserted by this page alone.',
    },
    {
        id: 'limitation',
        h: 'Limitation',
        p: 'To the extent permitted by applicable law, liability for website content and pre-contract discussions is limited. Contractual liability caps and exclusions belong in the signed commercial documents for each transaction.',
    },
    {
        id: 'governing',
        h: 'Governing law',
        p: 'Governing law and dispute forum will be stated in the applicable written contract or confirmed by counsel. Until then, this page does not designate a governing jurisdiction.',
    },
];

export default function Terms() {
    return (
        <main id="main-content" className="overflow-x-clip">
            <Seo
                title="Terms of Trade"
                description={`Website and trade discussion framework for ${SITE_NAME}. Binding terms appear in written offers and contracts.`}
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
                lead="Commercial framework for website use and trade discussions. Binding sale, purchase and Incoterm terms are confirmed in written offers and contracts — not solely by this page."
                dark={false}
                testId="terms-hero"
            />

            <section className="bg-ivory text-graphite px-5 sm:px-6 lg:px-12 py-16 lg:py-24 print:py-8" data-testid="terms-body">
                <div className="max-w-3xl print:max-w-none">
                    {SHOW_LEGAL_DRAFT_BANNER && LEGAL_STATUS === 'draft' && (
                        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-mute mb-4" data-legal-status="draft">
                            Draft — for review
                        </p>
                    )}
                    <Tag index="01" label="Framework" />
                    <Fade>
                        <p className="mt-8 text-sm leading-relaxed text-mute">
                            Last updated: {LAST_UPDATED}. Issued by {SITE_NAME}. Enquiries: {SITE_EMAIL}. Locality:{' '}
                            {CONTACT.addressLine2}.
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
                        Need a commercial conversation?{' '}
                        <Link to="/request-quote" className="text-copper underline-offset-4 hover:underline">
                            Request a Quote
                        </Link>
                        .
                    </p>
                </div>
            </section>
        </main>
    );
}
