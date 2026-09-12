import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { EASE } from './Reveal';

const LINKS = [
    { label: 'About', to: '/#about' },
    { label: 'Products', to: '/products', page: true },
    { label: 'Solutions', to: '/#what-we-do' },
    { label: 'Markets', to: '/markets', page: true },
    { label: 'Insights', to: '/insights', page: true },
];

export default function Nav() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { scrollY } = useScroll();
    const location = useLocation();
    useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 80));

    const linkCls = (isActive) =>
        `relative font-mono text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 pb-1 ` +
        (isActive
            ? 'text-copper'
            : scrolled
                ? 'text-graphite/70 hover:text-graphite'
                : 'text-ivory/70 hover:text-ivory');

    return (
        <>
            <motion.header
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
                className="fixed inset-x-0 top-0 z-50"
                data-testid="main-navigation"
            >
                <div
                    className={`transition-all duration-500 ${scrolled
                            ? 'mx-3 lg:mx-auto lg:max-w-6xl mt-3 bg-ivory/90 backdrop-blur-md border border-graphite/10 shadow-[0_12px_40px_rgba(23,35,29,0.14)]'
                            : 'bg-transparent border border-transparent'
                        }`}
                >
                    <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'px-5 lg:px-8 py-3' : 'px-6 lg:px-12 py-6'}`}>
                        <Link to="/" className="flex items-center gap-3 group" data-testid="nav-logo">
                            <span className="w-2 h-2 bg-copper group-hover:rotate-45 transition-transform duration-500" />
                            <span className={`font-extrabold tracking-tight text-lg leading-none transition-colors duration-500 ${scrolled ? 'text-graphite' : 'text-ivory'}`}>
                                AITH
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-9" aria-label="Primary">
                            {LINKS.map((l) =>
                                l.page ? (
                                    <NavLink key={l.label} to={l.to} className={({ isActive }) => linkCls(isActive)} data-testid={`nav-link-${l.label.toLowerCase()}`}>
                                        {l.label}
                                    </NavLink>
                                ) : (
                                    <Link key={l.label} to={l.to} className={linkCls(false)} data-testid={`nav-link-${l.label.toLowerCase()}`}>
                                        {l.label}
                                    </Link>
                                )
                            )}
                        </nav>

                        <div className="flex items-center gap-6">
                            <Link
                                to="/request-quote?type=partner"
                                className={`hidden md:block font-mono text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 ${scrolled ? 'text-graphite/70 hover:text-copper' : 'text-ivory/70 hover:text-ivory'}`}
                                data-testid="nav-partner-link"
                            >
                                Partner
                            </Link>
                            <Link
                                to="/request-quote"
                                className="hidden sm:inline-flex items-center gap-2 bg-copper text-ivory px-5 py-2.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                                data-testid="nav-request-quote-button"
                            >
                                Request Quote
                                <ArrowUpRight size={13} />
                            </Link>
                            <button
                                onClick={() => setOpen(true)}
                                className={`lg:hidden p-2 transition-colors ${scrolled ? 'text-graphite' : 'text-ivory'}`}
                                aria-label="Open menu"
                                data-testid="nav-menu-button"
                            >
                                <Menu size={22} />
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
                        transition={{ duration: 0.4, ease: EASE }}
                        className="fixed inset-0 z-[60] bg-forest text-ivory flex flex-col"
                        data-testid="mobile-menu"
                    >
                        <div className="flex items-center justify-between px-6 py-6">
                            <span className="font-extrabold tracking-tight text-lg">AITH</span>
                            <button onClick={() => setOpen(false)} className="p-2" aria-label="Close menu" data-testid="mobile-menu-close">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="flex-1 flex flex-col justify-center px-8 gap-2" aria-label="Mobile">
                            {LINKS.map((l, i) => (
                                <motion.div
                                    key={l.label}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08 * i + 0.1, duration: 0.6, ease: EASE }}
                                >
                                    <Link
                                        to={l.to}
                                        onClick={() => setOpen(false)}
                                        className="flex items-baseline gap-4 py-3 border-b border-ivory/10 group"
                                        data-testid={`mobile-nav-link-${l.label.toLowerCase()}`}
                                    >
                                        <span className="font-mono text-[10px] tracking-[0.3em] text-copper">0{i + 1}</span>
                                        <span className="text-4xl font-extrabold tracking-tight group-hover:text-copper transition-colors duration-300">{l.label}</span>
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>
                        <div className="px-8 pb-10">
                            <Link
                                to="/request-quote"
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-center gap-3 bg-copper text-ivory py-4 font-mono text-xs tracking-[0.25em] uppercase"
                                data-testid="mobile-nav-quote-button"
                            >
                                Request Quote <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
