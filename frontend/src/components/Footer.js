import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Fade, Line } from './Reveal';
import { CONTACT, isConfigured } from '../data/contact';
import { SOCIAL } from '../config/site';

const NAV = [
    { label: 'About', to: '/about' },
    { label: 'Products', to: '/products' },
    { label: 'Services', to: '/services' },
    { label: 'Markets', to: '/markets' },
    { label: 'Insights', to: '/insights' },
    { label: 'Partner', to: '/partner' },
    { label: 'Quality', to: '/quality-compliance' },
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

export default function Footer() {
    const configuredSocial = SOCIAL_LINKS.filter((s) => s.href);

    return (
        <footer className="bg-forest text-ivory pb-mobile-cta" data-testid="site-footer">
            <div className="px-6 lg:px-12 pt-24 lg:pt-32 pb-28 lg:pb-10">
                <div aria-hidden="true">
                    <p className="text-[clamp(2.5rem,8vw,7.5rem)] leading-[0.92] tracking-[-0.03em] font-extrabold">
                        <Line>ASIAN</Line>
                        <Line delay={0.08} className="text-outline-ivory">INTERNATIONAL</Line>
                        <Line delay={0.16}>TRADE HOUSE</Line>
                    </p>
                </div>

                <div className="grid md:grid-cols-12 gap-10 mt-20 lg:mt-28 border-t border-ivory/15 pt-12">
                    <Fade className="md:col-span-4">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Contact</p>
                        <a href={`mailto:${CONTACT.email}`} className="block text-lg hover:text-copper transition-colors duration-300" data-testid="footer-email-link">
                            {CONTACT.email}
                        </a>
                        {isConfigured(CONTACT.phone) && (
                            <a
                                href={`tel:${CONTACT.phoneTel || CONTACT.phone.replace(/\s/g, '')}`}
                                className="block text-sm text-ivory/70 mt-3 hover:text-ivory transition-colors"
                            >
                                {CONTACT.phone}
                            </a>
                        )}
                        <p className="text-sm text-ivory/70 mt-3 leading-relaxed">
                            {CONTACT.addressLine1}
                            <br />
                            {CONTACT.addressLine2}
                        </p>
                        <p className="font-mono text-[11px] tracking-[0.2em] text-ivory/50 mt-4">
                            {CONTACT.coordinates} — NEW DELHI
                        </p>
                        <Link to="/contact" className="inline-flex items-center gap-1.5 mt-5 text-sm text-ivory/70 hover:text-ivory transition-colors" data-testid="footer-contact-page">
                            Contact page <ArrowUpRight size={12} aria-hidden="true" />
                        </Link>
                    </Fade>

                    <Fade delay={0.08} className="md:col-span-3">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Navigate</p>
                        <ul className="space-y-2.5">
                            {NAV.map((n) => (
                                <li key={n.label}>
                                    <Link to={n.to} className="text-ivory/70 hover:text-ivory transition-colors duration-300 text-sm" data-testid={`footer-nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {n.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Fade>

                    <Fade delay={0.16} className="md:col-span-2">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Social</p>
                        {configuredSocial.length > 0 ? (
                            <ul className="space-y-2.5">
                                {configuredSocial.map((s) => (
                                    <li key={s.label}>
                                        <a
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-ivory/70 hover:text-ivory transition-colors duration-300 text-sm"
                                            data-testid={`footer-social-${s.label.toLowerCase()}`}
                                        >
                                            {s.label} <ArrowUpRight size={12} className="opacity-50" aria-hidden="true" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-ivory/45" data-testid="footer-social-tbd">
                                Profiles [TBD]
                            </p>
                        )}
                    </Fade>

                    <Fade delay={0.24} className="md:col-span-3">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Legal</p>
                        <ul className="space-y-2.5">
                            {LEGAL.map((l) => (
                                <li key={l.label}>
                                    <Link
                                        to={l.to}
                                        className="text-ivory/70 hover:text-ivory transition-colors duration-300 text-sm"
                                        data-testid={`footer-legal-${l.label.toLowerCase().replace(/\s+/g, '-')}`}
                                    >
                                        {l.label}
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
                        © 2026 AITH — Trade is connection
                    </p>
                </div>
            </div>
        </footer>
    );
}
