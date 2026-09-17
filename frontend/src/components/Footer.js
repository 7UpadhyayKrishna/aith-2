import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Fade, Line } from './Reveal';
import BrandLogo from './BrandLogo';
import { CONTACT, isConfigured } from '../data/contact';
import { SOCIAL, SITE_NAME, SITE_SHORT } from '../config/site';

const NAV = [
    { label: 'About', to: '/about' },
    { label: 'Services', to: '/services' },
    { label: 'Global Sourcing', to: '/global-sourcing-services' },
    { label: 'Import & Export', to: '/import-export-services' },
    { label: 'Products', to: '/products' },
    { label: 'Industries', to: '/industries' },
    { label: 'Markets', to: '/markets' },
    { label: 'Insights', to: '/insights' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Partner', to: '/partner' },
    { label: 'Quality', to: '/quality-compliance' },
    { label: 'Careers', to: '/careers' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Contact', to: '/contact' },
    { label: 'Request Quote', to: '/request-quote' },
];

const LEGAL = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Trade', to: '/terms' },
];

const SOCIAL_LINKS = [
    { label: 'LinkedIn', href: SOCIAL.linkedin },
    { label: 'X', href: SOCIAL.x },
    { label: 'Instagram', href: SOCIAL.instagram },
];

const linkCls =
    'group inline-flex items-center gap-1.5 text-sm font-sans text-ivory/70 hover:text-ivory transition-colors duration-300';

export default function Footer() {
    const configuredSocial = SOCIAL_LINKS.filter((s) => s.href);
    const showSocial = configuredSocial.length > 0;
    const year = new Date().getFullYear();
    const navSpan = showSocial ? 'md:col-span-3' : 'md:col-span-4';
    const legalSpan = showSocial ? 'md:col-span-3' : 'md:col-span-4';

    return (
        <footer className="bg-forest text-ivory pb-mobile-cta overflow-x-hidden" data-testid="site-footer">
            <div className="px-5 sm:px-6 lg:px-12 pt-24 lg:pt-32 pb-28 lg:pb-10">
                <div className="flex flex-col gap-10">
                    <Link
                        to="/"
                        className="inline-flex items-center w-fit max-w-full"
                        aria-label={`${SITE_NAME} — home`}
                        data-testid="footer-logo"
                    >
                        <BrandLogo
                            variant="full"
                            tone="light"
                            className="h-12 sm:h-14 lg:h-16 w-auto max-w-[min(90vw,22rem)]"
                        />
                    </Link>
                    <p className="sr-only">{SITE_NAME}</p>
                    <p className="font-serif italic text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.05] text-ivory/55 max-w-3xl">
                        <Line>Trade is connection.</Line>
                    </p>
                </div>

                <div className="grid md:grid-cols-12 gap-10 mt-16 lg:mt-24 border-t border-ivory/15 pt-12">
                    <Fade className="md:col-span-4 min-w-0">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Contact</p>
                        <a
                            href={`mailto:${CONTACT.email}`}
                            className="block text-lg font-sans hover:text-copper transition-colors duration-300 break-all"
                            data-testid="footer-email-link"
                        >
                            {CONTACT.email}
                        </a>
                        {isConfigured(CONTACT.phone) && (
                            <a
                                href={`tel:${CONTACT.phoneTel || CONTACT.phone.replace(/\s/g, '')}`}
                                className="block text-sm font-sans text-ivory/70 mt-3 hover:text-ivory transition-colors"
                            >
                                {CONTACT.phone}
                            </a>
                        )}
                        <p className="text-sm font-sans text-ivory/70 mt-3 leading-relaxed">
                            {CONTACT.addressLine1}
                            <br />
                            {CONTACT.addressLine2}
                        </p>
                        <p className="font-mono text-[11px] tracking-[0.2em] text-ivory/45 mt-4">
                            {CONTACT.coordinates} — NEW DELHI
                        </p>
                        <Link to="/contact" className={`${linkCls} mt-5`} data-testid="footer-contact-page">
                            Contact page
                            <ArrowRight
                                size={12}
                                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-rotate-45"
                                aria-hidden="true"
                            />
                        </Link>
                    </Fade>

                    <Fade delay={0.08} className={`${navSpan} min-w-0`}>
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Navigate</p>
                        <ul className="space-y-2.5 columns-1 sm:columns-2 md:columns-1 gap-x-8">
                            {NAV.map((n) => (
                                <li key={n.label} className="break-inside-avoid">
                                    <Link
                                        to={n.to}
                                        className={linkCls}
                                        data-testid={`footer-nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
                                    >
                                        <span className="border-b border-transparent group-hover:border-ivory/40 transition-colors duration-300">
                                            {n.label}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Fade>

                    {showSocial && (
                        <Fade delay={0.16} className="md:col-span-2 min-w-0">
                            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Social</p>
                            <ul className="space-y-2.5">
                                {configuredSocial.map((s) => (
                                    <li key={s.label}>
                                        <a
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={linkCls}
                                            data-testid={`footer-social-${s.label.toLowerCase()}`}
                                        >
                                            {s.label}
                                            <ArrowRight
                                                size={12}
                                                className="opacity-50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-rotate-45"
                                                aria-hidden="true"
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </Fade>
                    )}

                    <Fade delay={0.24} className={`${legalSpan} min-w-0`}>
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Legal</p>
                        <ul className="space-y-2.5">
                            {LEGAL.map((l) => (
                                <li key={l.label}>
                                    <Link
                                        to={l.to}
                                        className={linkCls}
                                        data-testid={`footer-legal-${l.label.toLowerCase().replace(/\s+/g, '-')}`}
                                    >
                                        <span className="border-b border-transparent group-hover:border-ivory/40 transition-colors duration-300">
                                            {l.label}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Fade>
                </div>

                <div className="flex flex-col lg:flex-row justify-between gap-4 mt-16 pt-8 border-t border-ivory/10">
                    <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45">
                        International Trading • Global Sourcing • Procurement • Supply Chain
                    </p>
                    <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-ivory/45">
                        © {year} {SITE_NAME} ({SITE_SHORT})
                    </p>
                </div>
            </div>
        </footer>
    );
}
