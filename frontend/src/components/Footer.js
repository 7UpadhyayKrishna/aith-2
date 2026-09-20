import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Fade, Line } from './Reveal';
import BrandLogo from './BrandLogo';
import { CONTACT, isConfigured } from '../data/contact';
import { SOCIAL, SITE_NAME, SITE_SHORT } from '../config/site';

/**
 * Footer nav is grouped (not one long stack) and keeps extras the top bar
 * doesn't show - so we don't just repeat the header links.
 */
const LINK_GROUPS = [
    {
        title: 'Trade',
        links: [
            { label: 'Products', to: '/products' },
            { label: 'Minerals', to: '/minerals' },
            { label: 'Services', to: '/services' },
            { label: 'Industries', to: '/industries' },
            { label: 'Markets', to: '/markets' },
            { label: 'Global Sourcing', to: '/global-sourcing-services' },
            { label: 'Import & Export', to: '/import-export-services' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', to: '/about' },
            { label: 'Partner', to: '/partner' },
            { label: 'Quality', to: '/quality-compliance' },
            { label: 'Careers', to: '/careers' },
            { label: 'FAQ', to: '/faq' },
            { label: 'Contact', to: '/contact' },
            { label: 'Request Quote', to: '/request-quote' },
        ],
    },
    {
        title: 'Insights',
        links: [
            { label: 'Insights', to: '/insights' },
            { label: 'Blogs', to: '/blogs' },
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Trade', to: '/terms' },
        ],
    },
];

const SOCIAL_LINKS = [
    { label: 'LinkedIn', href: SOCIAL.linkedin },
    { label: 'X', href: SOCIAL.x },
    { label: 'Instagram', href: SOCIAL.instagram },
];

const linkCls =
    'group inline-flex items-center gap-1.5 text-sm font-sans text-ivory/70 hover:text-ivory transition-colors duration-300';

function FooterLink({ to, label, testId }) {
    return (
        <Link to={to} className={linkCls} data-testid={testId}>
            <span className="border-b border-transparent group-hover:border-ivory/40 transition-colors duration-300">
                {label}
            </span>
        </Link>
    );
}

export default function Footer() {
    const configuredSocial = SOCIAL_LINKS.filter((s) => s.href);
    const year = new Date().getFullYear();

    return (
        <footer className="bg-forest text-ivory pb-mobile-cta overflow-x-hidden" data-testid="site-footer">
            <div className="px-5 sm:px-6 lg:px-12 pt-24 lg:pt-32 pb-28 lg:pb-10">
                {/* Brand + tagline */}
                <div className="flex flex-col gap-10">
                    <Link
                        to="/"
                        className="inline-flex items-center w-fit max-w-full"
                        aria-label={`${SITE_NAME} - home`}
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

                <div className="grid lg:grid-cols-12 gap-10 mt-16 lg:mt-24 border-t border-ivory/15 pt-12">
                    {/* Contact block - address text comes from CONTACT data as-is */}
                    <Fade className="lg:col-span-4 min-w-0">
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
                            {CONTACT.coordinates} - NEW DELHI
                        </p>
                        <Link to="/contact" className={`${linkCls} mt-5`} data-testid="footer-contact-page">
                            Contact page
                            <ArrowRight
                                size={12}
                                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-rotate-45"
                                aria-hidden="true"
                            />
                        </Link>

                        {configuredSocial.length > 0 && (
                            <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-8">
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
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Fade>

                    {/* Multi-column link groups - spreads options instead of one tall list */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-6">
                        {LINK_GROUPS.map((group, i) => (
                            <Fade key={group.title} delay={0.06 * (i + 1)} className="min-w-0">
                                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">
                                    {group.title}
                                </p>
                                <ul className="space-y-2.5">
                                    {group.links.map((n) => (
                                        <li key={n.to}>
                                            <FooterLink
                                                to={n.to}
                                                label={n.label}
                                                testId={`footer-nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </Fade>
                        ))}
                    </div>
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
