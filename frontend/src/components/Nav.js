import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { EASE } from './Reveal';
import BrandLogo from './BrandLogo';

const LINKS = [
    { label: 'About', to: '/about' },
    { label: 'Products', to: '/products' },
    { label: 'Services', to: '/services' },
    { label: 'Markets', to: '/markets' },
    { label: 'Insights', to: '/insights' },
];

const MOBILE_LINKS = [
    ...LINKS,
    { label: 'Partner', to: '/partner' },
    { label: 'Quality', to: '/quality-compliance' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Contact', to: '/contact' },
];

const LIGHT_HERO_PATHS = new Set(['/privacy', '/terms']);

export default function Nav() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const scrolledRef = useRef(false);
    const closeRef = useRef(null);
    const { pathname } = useLocation();
    const { scrollY } = useScroll();
    const lightHero = LIGHT_HERO_PATHS.has(pathname);
    const logoTone = scrolled || lightHero ? 'color' : 'light';

    useMotionValueEvent(scrollY, 'change', (v) => {
        const next = v > 64;
        if (next === scrolledRef.current) return;
        scrolledRef.current = next;
        setScrolled(next);
    });

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.__lenis?.stop?.();
        window.addEventListener('keydown', onKey);
        closeRef.current?.focus?.();
        return () => {
            document.body.style.overflow = prev;
            window.__lenis?.start?.();
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const linkCls = (isActive) =>
        `relative font-mono text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 pb-1 ` +
        (isActive
            ? 'text-copper'
            : scrolled
                ? 'text-graphite/70 hover:text-graphite'
                : 'text-ivory/75 hover:text-ivory');

    const actionMuted = scrolled
        ? 'text-graphite/70 hover:text-copper'
        : 'text-ivory/75 hover:text-ivory';

    return (
        <>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-copper focus:text-ivory focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:tracking-[0.2em] focus:uppercase"
            >
                Skip to content
            </a>
            <motion.header
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
                className="fixed inset-x-0 top-0 z-50"
                data-testid="main-navigation"
            >
                <div
                    className={`relative transition-all duration-500 ${
                        scrolled
                            ? 'mx-3 lg:mx-auto lg:max-w-7xl xl:max-w-[90rem] mt-2 bg-ivory border border-graphite/10 shadow-[0_8px_28px_rgba(23,35,29,0.12)] overflow-hidden'
                            : 'bg-transparent border border-transparent'
                    }`}
                >
                    <div
                        className={`flex items-center justify-between gap-5 transition-all duration-500 ${
                            scrolled
                                ? 'pl-3 sm:pl-4 lg:pl-5 pr-3 sm:pr-4 lg:pr-5 py-1 sm:py-1.5'
                                : 'pl-3 sm:pl-5 lg:pl-7 pr-3 sm:pr-5 lg:pr-8 py-2 sm:py-2.5'
                        }`}
                    >
                        <Link
                            to="/"
                            className="relative flex items-center shrink-0"
                            data-testid="nav-logo"
                            aria-label="Asian International Trade House — home"
                        >
                            <BrandLogo
                                variant="full"
                                tone={logoTone}
                                priority
                                className={
                                    scrolled
                                        ? 'relative h-6 sm:h-7 lg:h-7 w-auto max-w-[min(50vw,12.5rem)] sm:max-w-[14.5rem] lg:max-w-[16rem]'
                                        : 'relative h-9 sm:h-11 lg:h-12 w-auto max-w-[min(60vw,16rem)] sm:max-w-[19rem] lg:max-w-[21rem]'
                                }
                            />
                        </Link>

                        <div className="flex items-center justify-end gap-5 xl:gap-8 min-w-0 shrink-0">
                            <nav className="hidden lg:flex items-center gap-7 xl:gap-9" aria-label="Primary">
                                {LINKS.map((l) => (
                                    <NavLink
                                        key={l.label}
                                        to={l.to}
                                        className={({ isActive }) => linkCls(isActive)}
                                        data-testid={`nav-link-${l.label.toLowerCase()}`}
                                    >
                                        {l.label}
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="flex items-center gap-3 sm:gap-4 xl:gap-5 shrink-0">
                                <Link
                                    to="/contact"
                                    className={`hidden md:block font-mono text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 ${actionMuted}`}
                                    data-testid="nav-contact-link"
                                >
                                    Contact
                                </Link>
                                <Link
                                    to="/partner"
                                    className={`hidden xl:block font-mono text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 ${actionMuted}`}
                                    data-testid="nav-partner-link"
                                >
                                    Partner
                                </Link>
                                <Link
                                    to="/request-quote"
                                    className="hidden sm:inline-flex items-center gap-2 bg-copper text-ivory px-4 sm:px-5 py-2 font-mono text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300 min-h-[40px]"
                                    data-testid="nav-request-quote-button"
                                >
                                    Request Quote
                                    <ArrowUpRight size={13} aria-hidden="true" />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setOpen(true)}
                                    className={`lg:hidden p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center transition-colors ${
                                        scrolled ? 'text-graphite' : 'text-ivory'
                                    }`}
                                    aria-label="Open menu"
                                    aria-expanded={open}
                                    aria-controls="mobile-navigation"
                                    data-testid="nav-menu-button"
                                >
                                    <Menu size={22} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <AnimatePresence>
                {open && (
                    <motion.div
                        id="mobile-navigation"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="fixed inset-0 z-[60] bg-forest text-ivory flex flex-col"
                        data-testid="mobile-menu"
                    >
                        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4">
                            <Link
                                to="/"
                                className="relative inline-flex items-center overflow-hidden"
                                onClick={() => setOpen(false)}
                                aria-label="Asian International Trade House — home"
                            >
                                <BrandLogo variant="full" tone="light" className="relative h-10 w-auto max-w-[13rem]" priority />
                            </Link>
                            <button
                                ref={closeRef}
                                type="button"
                                onClick={() => setOpen(false)}
                                className="p-2.5 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                                aria-label="Close menu"
                                data-testid="mobile-menu-close"
                            >
                                <X size={24} aria-hidden="true" />
                            </button>
                        </div>
                        <nav className="flex-1 flex flex-col justify-center px-7 sm:px-8 gap-1 overflow-y-auto pb-8" aria-label="Mobile">
                            {MOBILE_LINKS.map((l, i) => (
                                <motion.div
                                    key={l.label}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * i + 0.08, duration: 0.55, ease: EASE }}
                                >
                                    <Link
                                        to={l.to}
                                        onClick={() => setOpen(false)}
                                        className="flex items-baseline gap-4 py-3 border-b border-ivory/10 group min-h-[48px]"
                                        data-testid={`mobile-nav-link-${l.label.toLowerCase()}`}
                                    >
                                        <span className="font-mono text-[10px] tracking-[0.3em] text-copper">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight group-hover:text-copper transition-colors duration-300">
                                            {l.label}
                                        </span>
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>
                        <div className="px-7 sm:px-8 pb-10">
                            <Link
                                to="/request-quote"
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-center gap-3 bg-copper text-ivory py-4 font-mono text-xs tracking-[0.25em] uppercase min-h-[52px]"
                                data-testid="mobile-nav-quote-button"
                            >
                                Request Quote <ArrowUpRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
