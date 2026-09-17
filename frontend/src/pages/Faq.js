import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo, { faqPageJsonLd } from '../components/Seo';
import PageHero from '../components/PageHero';
import { Fade, Tag } from '../components/Reveal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FAQ_CATEGORIES, allFaqItems } from '../data/faqs';

export default function Faq() {
    const all = allFaqItems();

    return (
        <main id="main-content">
            <Seo
                title="FAQ"
                description="Answers on sourcing, quotes, Incoterms, shipping, quality, payments and markets from Asian International Trade House."
                path="/faq"
                jsonLd={faqPageJsonLd(all)}
            />
            <PageHero
                kicker="AITH / FAQ"
                breadcrumb={[
                    { label: 'Home', to: '/' },
                    { label: 'FAQ' },
                ]}
                titleLines={['QUESTIONS.', 'ANSWERED.']}
                italicLast
                lead="Practical answers for buyers and suppliers — from first enquiry to documentation and delivery."
                primaryCta={{ to: '/request-quote', label: 'Request a Quote', testId: 'faq-quote-cta' }}
                secondaryCta={{ to: '/contact', label: 'Contact us', testId: 'faq-contact-cta' }}
                testId="faq-hero"
            />

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-20 lg:py-28" data-testid="faq-categories">
                <div className="flex flex-wrap gap-3 mb-16 lg:mb-20" role="navigation" aria-label="FAQ categories">
                    {FAQ_CATEGORIES.map((c) => (
                        <a
                            key={c.id}
                            href={`#${c.id}`}
                            className="font-mono text-[10px] tracking-[0.22em] uppercase px-4 py-2 border border-graphite/20 text-graphite/70 hover:border-copper hover:text-copper transition-colors duration-300"
                            data-testid={`faq-cat-nav-${c.id}`}
                        >
                            {c.label}
                        </a>
                    ))}
                </div>

                <div className="space-y-20 lg:space-y-28">
                    {FAQ_CATEGORIES.map((cat, ci) => (
                        <div key={cat.id} id={cat.id} className="scroll-mt-28" data-testid={`faq-category-${cat.id}`}>
                            <Tag index={String(ci + 1).padStart(2, '0')} label={cat.label} />
                            <h2 className="text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold tracking-tight mt-6 mb-8">{cat.label}</h2>
                            <Accordion type="single" collapsible className="border-y border-graphite/15 divide-y divide-graphite/15">
                                {cat.items.map((item) => (
                                    <AccordionItem key={item.id} value={item.id} className="border-0" data-testid={`faq-full-${item.id}`}>
                                        <AccordionTrigger className="py-6 text-left text-base lg:text-xl font-extrabold tracking-tight hover:no-underline hover:text-copper [&[data-state=open]]:text-copper">
                                            {item.q}
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-6 text-sm lg:text-base text-mute leading-relaxed max-w-3xl">
                                            {item.a}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-forest text-ivory px-6 lg:px-12 py-24 lg:py-32" data-testid="faq-cta">
                <Fade>
                    <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-copper mb-6">Still unsure?</p>
                    <h2 className="text-[clamp(2.2rem,4.5vw,4rem)] font-extrabold tracking-tight max-w-2xl leading-[0.95]">
                        Send the requirement. We will map the next step.
                    </h2>
                    <div className="flex flex-wrap gap-4 mt-10">
                        <Link
                            to="/request-quote"
                            className="inline-flex items-center gap-2 bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                            data-testid="faq-bottom-quote"
                        >
                            Request a Quote <ArrowRight size={14} />
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase border-b border-ivory/35 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                            data-testid="faq-bottom-contact"
                        >
                            Contact
                        </Link>
                    </div>
                </Fade>
            </section>
        </main>
    );
}
