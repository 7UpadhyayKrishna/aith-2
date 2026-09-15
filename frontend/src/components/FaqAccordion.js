import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Fade, Tag } from './Reveal';

export default function FaqAccordion({
    items,
    title = 'Questions buyers ask',
    index = 'FAQ',
    label = 'Frequently Asked',
    showAllLink = true,
    className = 'bg-ivory text-graphite',
    testId = 'faq-section',
}) {
    if (!items?.length) return null;

    return (
        <section className={`px-6 lg:px-12 py-24 lg:py-32 ${className}`} data-testid={testId}>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12 lg:mb-16">
                <div>
                    <Tag index={index} label={label} />
                    <h2 className="text-[clamp(2.2rem,4.5vw,4.2rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8 max-w-2xl">
                        {title}
                    </h2>
                </div>
                {showAllLink && (
                    <Fade delay={0.15}>
                        <Link
                            to="/faq"
                            className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-graphite border-b border-graphite/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                            data-testid="faq-view-all-link"
                        >
                            View all FAQs
                            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </Fade>
                )}
            </div>

            <Accordion type="single" collapsible className="border-y border-graphite/15 divide-y divide-graphite/15" data-testid="faq-accordion">
                {items.map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border-0" data-testid={`faq-item-${item.id}`}>
                        <AccordionTrigger className="py-6 lg:py-7 text-left text-base lg:text-xl font-extrabold tracking-tight hover:no-underline hover:text-copper transition-colors duration-300 [&[data-state=open]]:text-copper">
                            {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 lg:pb-8 text-sm lg:text-base text-mute leading-relaxed max-w-3xl">
                            {item.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}
