import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { EASE } from './Reveal';
import BrandLogo from './BrandLogo';

const LINKS = [
    { label: 'About', to: '/about' },
    { label: 'Products', to: '/products' },
    { label: 'Minerals', to: '/minerals' },
    { label: 'Services', to: '/services' },
    { label: 'Markets', to: '/markets' },
    { label: 'Insights', to: '/insights' },
    { label: 'Blogs', to: '/blogs' },
];

const MOBILE_GROUPS = [
    {
        label: 'Explore',
        links: [
            { label: 'About', to: '/about' },
            { label: 'Products', to: '/products' },
            { label: 'Minerals', to: '/minerals' },
            { label: 'Services', to: '/services' },
            { label: 'Industries', to: '/industries' },
            { label: 'Markets', to: '/markets' },
            { label: 'Insights', to: '/insights' },
            { label: 'Blogs', to: '/blogs' },
        ],
    },
    {
        label: 'Company',
        links: [
            { label: 'Partner', to: '/partner' },
            { label: 'Quality', to: '/quality-compliance' },
            { label: 'Careers', to: '/careers' },
            { label: 'FAQ', to: '/faq' },
            { label: 'Contact', to: '/contact' },
        ],
    },
];

const LIGHT_HERO_PATHS = new Set(['/privacy', '/terms']);

export default function Nav() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const scrolledRef = useRef(false);
    const closeRef = useRef(null);
    const menuButtonRef = useRef(null);
    const menuPanelRef = useRef(null);
    const { pathname } = useLocation();
    const { scrollY } = useScroll();
    const lightHero = LIGHT_HERO_PATHS.has(pathname);
    const logoTone = scrolled || lightHero ? 'color' : 'light';
    const reduceMotion =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    useMotionValueEvent(scrollY, 'change', (v) => {
        const next = v > 48;
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
            if (e.key !== 'Tab' || !menuPanelRef.current) return;
            const focusables = menuPanelRef.current.querySelectorAll(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        const prev = document.body.style.overflow;
        const menuButton = menuButtonRef.current;
        document.body.style.overflow = 'hidden';
        window.__lenis?.stop?.();
        window.addEventListener('keydown', onKey);
        closeRef.current?.focus?.();
        return () => {
            document.body.style.overflow = prev;
            window.__lenis?.start?.();
            window.removeEventListener('keydown', onKey);
            menuButton?.focus?.();
        };
    }, [open]);

    const linkTone = scrolled
        ? 'text-graphite/65 hover:text-graphite'
        : 'text-ivory/70 hover:text-ivory';

    const linkCls = (isActive) =>
        [
            'relative inline-flex items-center h-9 font-mono text-[10.5px] xl:text-[11px]',
            'tracking-[0.16em] xl:tracking-[0.18em] uppercase whitespace-nowrap',
            'transition-colors duration-200',
            'after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px after:origin-left',
            'after:transition-transform after:duration-200 after:ease-out',
            isActive
                ? 'text-copper after:scale-x-100 after:bg-copper'
                : `${linkTone} after:scale-x-0 after:bg-current hover:after:scale-x-100`,
        ].join(' ');

    const actionMuted = scrolled
        ? 'text-graphite/65 hover:text-copper'
        : 'text-ivory/70 hover:text-ivory';

    const dividerCls = scrolled ? 'bg-graphite/15' : 'bg-ivory/20';

    const logoClass = scrolled
        ? 'relative h-[clamp(2.1rem,3.6vw,2.55rem)] w-auto max-w-[min(46vw,14rem)] sm:max-w-[15rem] lg:max-w-[16.5rem] min-w-0'
        : 'relative h-[clamp(2.5rem,4.6vw,3.15rem)] w-auto max-w-[min(50vw,16rem)] sm:max-w-[18rem] lg:max-w-[20rem] min-w-0';

    return (
        <>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-copper focus:text-ivory focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:tracking-[0.2em] focus:uppercase"
            >
                Skip to content
            </a>
            <motion.header
                initial={reduceMotion ? false : { y: -28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE, delay: reduceMotion ? 0 : 0.08 }}
                className="fixed inset-x-0 top-0 z-50"
                data-testid="main-navigation"
            >
                <div
                    className={`relative transition-[background-color,box-shadow,margin,border-color] duration-300 ease-out ${
                        scrolled
                            ? 'mx-2 sm:mx-3 lg:mx-4 xl:mx-auto xl:max-w-[92rem] mt-2 bg-ivory border border-graphite/10 shadow-[0_6px_20px_rgba(23,35,29,0.08)]'
                            : 'bg-transparent border border-transparent'
                    }`}
                >
                    <div
                        className={`grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] items-center gap-x-4 sm:gap-x-6 lg:gap-x-8 min-w-0 transition-[padding] duration-300 ${
                            scrolled
                                ? 'pl-3 sm:pl-4 lg:pl-5 pr-2 sm:pr-3 lg:pr-4 py-2'
                                : 'pl-4 sm:pl-6 lg:pl-8 pr-3 sm:pr-5 lg:pr-7 py-3'
                        }`}
                    >
                        <Link
                            to="/"
                            className="relative flex items-center shrink-0 min-w-0 justify-self-start"
                            data-testid="nav-logo"
                            aria-label="Asian International Trade House — home"
                        >
                            <span
                                className={`relative block ${logoClass}`}
                                style={{ aspectRatio: '1100 / 222' }}
                            >
                                <BrandLogo
                                    variant="full"
                                    tone="light"
                                    priority
                                    className={`absolute inset-y-0 left-0 h-full w-auto max-w-full transition-opacity duration-200 ${
                                        logoTone === 'light' ? 'opacity-100' : 'opacity-0'
                                    }`}
                                />
                                <BrandLogo
                                    variant="full"
                                    tone="color"
                                    priority
                                    className={`absolute inset-y-0 left-0 h-full w-auto max-w-full transition-opacity duration-200 ${
                                        logoTone === 'color' ? 'opacity-100' : 'opacity-0'
                                    }`}
                                />
                            </span>
                        </Link>

                        <nav
                            className="hidden lg:flex items-center justify-end xl:justify-center gap-x-5 xl:gap-x-7 2xl:gap-x-8 min-w-0"
                            aria-label="Primary"
                        >
                            {LINKS.map((l) => (
                                <NavLink
                                    key={l.label}
                                    to={l.to}
                                    className={({ isActive }) =>
                                        `${linkCls(isActive)}${l.label === 'Blogs' ? ' hidden xl:inline-flex' : ''}`
                                    }
                                    data-testid={`nav-link-${l.label.toLowerCase()}`}
                                >
                                    {l.label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="flex items-center justify-end gap-x-3 sm:gap-x-4 lg:gap-x-5 min-w-0 shrink-0 col-start-2 lg:col-start-3 justify-self-end">
                            <div className="hidden md:flex items-center gap-x-4 lg:gap-x-5">
                                <span className={`hidden lg:block w-px h-4 ${dividerCls}`} aria-hidden="true" />
                                <Link
                                    to="/contact"
                                    className={`inline-flex items-center h-9 font-mono text-[10.5px] xl:text-[11px] tracking-[0.16em] xl:tracking-[0.18em] uppercase whitespace-nowrap transition-colors duration-200 ${actionMuted}`}
                                    data-testid="nav-contact-link"
                                >
                                    Contact
                                </Link>
                                <Link
                                    to="/partner"
                                    className={`hidden 2xl:inline-flex items-center h-9 font-mono text-[10.5px] xl:text-[11px] tracking-[0.16em] xl:tracking-[0.18em] uppercase whitespace-nowrap transition-colors duration-200 ${actionMuted}`}
                                    data-testid="nav-partner-link"
                                >
                                    Partner
                                </Link>
                            </div>

                            <Link
                                to="/request-quote"
                                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-copper text-ivory px-3 sm:px-4 lg:px-5 h-9 sm:h-10 font-mono text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.18em] uppercase hover:bg-terra transition-colors duration-200 shrink-0"
                                data-testid="nav-request-quote-button"
                            >
                                <span className="sm:hidden">Quote</span>
                                <span className="hidden sm:inline">Request Quote</span>
                                <ArrowUpRight size={13} aria-hidden="true" className="hidden sm:block shrink-0" />
                            </Link>

                            <button
                                ref={menuButtonRef}
                                type="button"
                                onClick={() => setOpen(true)}
                                className={`lg:hidden p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center transition-colors duration-200 ${
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
            </motion.header>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE }}
                        className="fixed inset-0 z-[60] bg-forest text-ivory flex flex-col overflow-x-hidden"
                        data-testid="mobile-menu"
                    >
                        <div
                            ref={menuPanelRef}
                            id="mobile-navigation"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Site menu"
                            className="flex flex-col flex-1 min-h-0"
                        >
                            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 min-w-0 border-b border-ivory/10">
                                <Link
                                    to="/"
                                    className="relative inline-flex items-center min-w-0"
                                    onClick={() => setOpen(false)}
                                    aria-label="Asian International Trade House — home"
                                >
                                    <BrandLogo
                                        variant="full"
                                        tone="light"
                                        className="relative h-10 sm:h-11 w-auto max-w-[min(70vw,14rem)]"
                                        priority
                                    />
                                </Link>
                                <button
                                    ref={closeRef}
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="p-2.5 min-w-[44px] min-h-[44px] inline-flex items-center justify-center shrink-0"
                                    aria-label="Close menu"
                                    data-testid="mobile-menu-close"
                                >
                                    <X size={24} aria-hidden="true" />
                                </button>
                            </div>
                            <nav
                                className="flex-1 flex flex-col justify-center px-5 sm:px-8 gap-8 overflow-y-auto overflow-x-hidden pb-8"
                                aria-label="Mobile"
                            >
                                {MOBILE_GROUPS.map((group) => (
                                    <div key={group.label}>
                                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper/80 mb-1">
                                            {group.label}
                                        </p>
                                        {group.links.map((l, i) => (
                                            <motion.div
                                                key={l.label}
                                                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: reduceMotion ? 0 : 0.03 * i + 0.04,
                                                    duration: reduceMotion ? 0 : 0.4,
                                                    ease: EASE,
                                                }}
                                            >
                                                <Link
                                                    to={l.to}
                                                    onClick={() => setOpen(false)}
                                                    className="flex items-baseline gap-3 sm:gap-4 py-3 border-b border-ivory/10 group min-h-[48px]"
                                                    data-testid={`mobile-nav-link-${l.label.toLowerCase()}`}
                                                >
                                                    <span className="font-mono text-[10px] tracking-[0.3em] text-copper shrink-0">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span className="text-2xl sm:text-4xl font-extrabold tracking-tight group-hover:text-copper transition-colors duration-200 break-words">
                                                        {l.label}
                                                    </span>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                ))}
                            </nav>
                            <div className="px-5 sm:px-8 pb-10 pt-2 border-t border-ivory/10">
                                <Link
                                    to="/request-quote"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-center gap-3 bg-copper text-ivory py-4 font-mono text-xs tracking-[0.25em] uppercase min-h-[52px]"
                                    data-testid="mobile-nav-quote-button"
                                >
                                    Request Quote <ArrowUpRight size={14} aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
