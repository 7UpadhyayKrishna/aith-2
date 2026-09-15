import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Seo, { breadcrumbJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import FaqAccordion from '../components/FaqAccordion';
import { Fade, Line, Tag } from '../components/Reveal';
import { QUALITY_STEPS } from '../data/content';
import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';

const SECTIONS = [
    {
        index: '01',
        title: 'Quality approach',
        blurb: 'Quality is treated as a sequence, not a slogan. Specification, supplier capability, inspection and documentation are aligned before goods move.',
    },
    {
        index: '02',
        title: 'Supplier due diligence',
        blurb: 'Facilities, trade references and production capacity are reviewed before onboarding. Fit is judged against the requirement — not a generic vendor list.',
    },
    {
        index: '03',
        title: 'Inspection & documentation',
        blurb: 'Pre-shipment inspection can follow buyer-nominated agencies or origin partners. Commercial invoice, packing list, bill of lading or air waybill, and certificates of origin are coordinated as the lane requires.',
    },
    {
        index: '04',
        title: 'Packaging & product requirements',
        blurb: 'Packaging, labelling and packing lists are aligned to product type and destination rules. Private-label or OEM packing is evaluated when the brief supports it.',
    },
    {
        index: '05',
        title: 'Trade compliance',
        blurb: 'Applicable export formalities, sanctions screening and destination import constraints are considered early. If a request cannot proceed, we say so clearly.',
    },
    {
        index: '06',
        title: 'Shipment readiness',
        blurb: 'Loading, sealing and document sets are checked against the contracted specification so clearance at destination is not improvisation.',
    },
    {
        index: '07',
        title: 'Claims & issue resolution',
        blurb: 'If goods do not match the agreed specification, the path is documentation, inspection evidence and commercial resolution under the contracted terms — not silence.',
    },
];

export default function QualityCompliance() {
    return (
        <main id="main-content">
            <Seo
                title="Quality & Compliance"
                description="How Asian International Trade House approaches supplier due diligence, inspection, documentation, packaging and trade compliance — without invented certifications."
                path="/quality-compliance"
                jsonLd={breadcrumbJsonLd([
                    { name: 'Home', path: '/' },
                    { name: 'Quality & Compliance', path: '/quality-compliance' },
                ])}
            />
            <PageHero
                kicker="AITH / Quality & Compliance"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'Quality & Compliance' },
                ]}
                titleLines={['QUALITY', 'IS A PROCESS.']}
                lead="Requirements are assessed according to product, destination and buyer needs. We describe the working sequence honestly — without claiming certifications the company has not confirmed."
                primaryCta={{ to: '/request-quote', label: 'Discuss Specification', testId: 'quality-quote-cta' }}
                secondaryCta={{ to: '/services', label: 'View services', testId: 'quality-services-cta' }}
                testId="quality-hero"
            />

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="quality-sequence">
                <Tag index="00" label="Working Sequence" />
                <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                    <Line>How we work quality</Line>
                </h2>
                <div className="mt-16 lg:mt-20 divide-y divide-graphite/15 border-y border-graphite/15">
                    {SECTIONS.map((s, i) => (
                        <Fade key={s.index} delay={i * 0.04} y={16}>
                            <div className="grid lg:grid-cols-12 gap-3 lg:gap-6 py-8 lg:py-10 items-baseline">
                                <span className="lg:col-span-2 font-mono text-xs tracking-[0.25em] text-copper">{s.index}</span>
                                <h3 className="lg:col-span-4 text-xl lg:text-3xl font-extrabold tracking-tight uppercase">{s.title}</h3>
                                <p className="lg:col-span-6 text-sm text-mute leading-relaxed">{s.blurb}</p>
                            </div>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="px-6 lg:px-12 py-28 lg:py-36 text-graphite" style={{ backgroundColor: '#DFDACD' }} data-testid="quality-checkpoints">
                <Tag index="08" label="Shipment Checkpoints" />
                <h2 className="text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">
                    The same sequence every shipment
                </h2>
                <div className="mt-14 divide-y divide-graphite/15 border-y border-graphite/15">
                    {QUALITY_STEPS.map((q, i) => (
                        <Fade key={q.index} delay={i * 0.05} y={14}>
                            <div className="grid lg:grid-cols-12 gap-3 lg:gap-6 py-7 lg:py-9 items-baseline">
                                <span className="lg:col-span-2 font-mono text-xs tracking-[0.25em] text-copper">{q.index}</span>
                                <h3 className="lg:col-span-5 text-xl lg:text-3xl font-extrabold tracking-tight uppercase">{q.title}</h3>
                                <p className="lg:col-span-5 text-sm text-mute leading-relaxed">{q.blurb}</p>
                            </div>
                        </Fade>
                    ))}
                </div>
                <Fade delay={0.2}>
                    <div className="mt-14 flex flex-wrap gap-4">
                        <Link
                            to="/request-quote"
                            className="inline-flex items-center gap-2 bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors"
                        >
                            Discuss specification <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                        <Link
                            to="/faq#quality-compliance"
                            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase border-b border-graphite/35 pb-1 hover:text-copper hover:border-copper transition-colors"
                        >
                            Quality FAQs
                        </Link>
                    </div>
                </Fade>
            </section>

            <FaqAccordion
                items={getFaqsByIds(FAQ_BY_CONTEXT.quality || ['quality-process', 'third-party-inspection', 'certifications', 'documents', 'customs'])}
                index="09"
                label="Quality FAQ"
                title="Compliance questions"
                className="bg-ivory text-graphite"
                testId="quality-faq"
            />
        </main>
    );
}
