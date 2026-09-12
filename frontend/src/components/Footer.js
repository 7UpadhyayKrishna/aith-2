import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Fade, Line } from './Reveal';

const NAV = [
    { label: 'Products', to: '/products' },
    { label: 'Solutions', to: '/#what-we-do' },
    { label: 'Markets', to: '/markets' },
    { label: 'Quality', to: '/#quality' },
    { label: 'Insights', to: '/insights' },
];

export default function Footer() {
    return (
        <footer className="bg-forest text-ivory" data-testid="site-footer">
            <div className="px-6 lg:px-12 pt-24 lg:pt-32 pb-10">
                <Link to="/" aria-label="Asian International Trade House — home" data-testid="footer-logo">
                    <h2 className="text-[clamp(3rem,10vw,9.5rem)] leading-[0.92] tracking-[-0.03em] font-extrabold">
                        <Line>ASIAN</Line>
                        <Line delay={0.08} className="text-outline-ivory">INTERNATIONAL</Line>
                        <Line delay={0.16}>TRADE HOUSE</Line>
                    </h2>
                </Link>

                <div className="grid md:grid-cols-12 gap-10 mt-20 lg:mt-28 border-t border-ivory/15 pt-12">
                    <Fade className="md:col-span-4">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Contact</p>
                        <a href="mailto:trade@aithinternational.com" className="block text-lg hover:text-copper transition-colors duration-300" data-testid="footer-email-link">
                            trade@aithinternational.com
                        </a>
                        <p className="font-mono text-[11px] tracking-[0.2em] text-ivory/50 mt-4">28°36'N 77°13'E — NEW DELHI, INDIA</p>
                    </Fade>

                    <Fade delay={0.08} className="md:col-span-3">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Navigate</p>
                        <ul className="space-y-2.5">
                            {NAV.map((n) => (
                                <li key={n.label}>
                                    <Link to={n.to} className="text-ivory/70 hover:text-ivory transition-colors duration-300 text-sm" data-testid={`footer-nav-${n.label.toLowerCase()}`}>
                                        {n.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Fade>

                    <Fade delay={0.16} className="md:col-span-2">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Social</p>
                        <ul className="space-y-2.5">
                            {['LinkedIn', 'X', 'Instagram'].map((s) => (
                                <li key={s}>
                                    <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1.5 text-ivory/70 hover:text-ivory transition-colors duration-300 text-sm" data-testid={`footer-social-${s.toLowerCase()}`}>
                                        {s} <ArrowUpRight size={12} className="opacity-50" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Fade>

                    <Fade delay={0.24} className="md:col-span-3">
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper mb-5">Legal</p>
                        <ul className="space-y-2.5">
                            {['Privacy Policy', 'Terms of Trade'].map((l) => (
                                <li key={l}>
                                    <a href="#" onClick={(e) => e.preventDefault()} className="text-ivory/70 hover:text-ivory transition-colors duration-300 text-sm" data-testid={`footer-legal-${l.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {l}
                                    </a>
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
