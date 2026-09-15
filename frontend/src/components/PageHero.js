import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Line, Fade } from './Reveal';

/**
 * Shared editorial page hero for inner routes.
 */
export default function PageHero({
    kicker = 'AITH',
    breadcrumb,
    titleLines,
    italicLast = false,
    lead,
    dark = true,
    primaryCta,
    secondaryCta,
    testId = 'page-hero',
    children,
}) {
    const shell = dark ? 'bg-forest text-ivory' : 'bg-ivory text-graphite';
    const mute = dark ? 'text-ivory/65' : 'text-mute';
    const crumb = dark ? 'text-ivory/45' : 'text-mute';

    return (
        <section className={`relative overflow-hidden ${shell}`} data-testid={testId}>
            {children}
            <div className="relative z-10 px-6 lg:px-12 pt-44 pb-24 lg:pt-56 lg:pb-32">
                <Fade y={10}>
                    <p className={`font-mono text-[11px] tracking-[0.35em] uppercase ${dark ? 'text-ivory/60' : 'text-mute'}`}>
                        {kicker}
                    </p>
                    {breadcrumb?.length > 0 && (
                        <nav aria-label="Breadcrumb" className={`mt-4 font-mono text-[10px] tracking-[0.28em] uppercase ${crumb}`}>
                            <ol className="flex flex-wrap items-center gap-2">
                                {breadcrumb.map((b, i) => (
                                    <li key={b.label} className="flex items-center gap-2">
                                        {i > 0 && <span aria-hidden="true">/</span>}
                                        {b.to ? (
                                            <Link to={b.to} className="hover:text-copper transition-colors duration-300">
                                                {b.label}
                                            </Link>
                                        ) : (
                                            <span aria-current="page">{b.label}</span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    )}
                </Fade>

                <h1 className="text-[clamp(2.9rem,7.5vw,7.5rem)] leading-[0.94] tracking-[-0.03em] font-extrabold mt-8 max-w-5xl">
                    {titleLines.map((line, i) => {
                        const last = i === titleLines.length - 1;
                        return (
                            <Line key={line} delay={0.12 + i * 0.12}>
                                {last && italicLast ? (
                                    <span className="font-serif italic font-normal">{line}</span>
                                ) : (
                                    line
                                )}
                            </Line>
                        );
                    })}
                </h1>

                {lead && (
                    <Fade delay={0.4}>
                        <p className={`${mute} text-sm lg:text-base leading-relaxed mt-10 max-w-xl`}>{lead}</p>
                    </Fade>
                )}

                {(primaryCta || secondaryCta) && (
                    <Fade delay={0.5}>
                        <div className="flex flex-wrap gap-4 mt-10">
                            {primaryCta && (
                                <Link
                                    to={primaryCta.to}
                                    className="group inline-flex items-center gap-2 bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                                    data-testid={primaryCta.testId || 'page-hero-primary-cta'}
                                >
                                    {primaryCta.label}
                                    <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </Link>
                            )}
                            {secondaryCta && (
                                <Link
                                    to={secondaryCta.to}
                                    className={`group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase border-b pb-1 transition-colors duration-300 ${
                                        dark
                                            ? 'text-ivory/80 border-ivory/35 hover:text-copper hover:border-copper'
                                            : 'text-graphite border-graphite/40 hover:text-copper hover:border-copper'
                                    }`}
                                    data-testid={secondaryCta.testId || 'page-hero-secondary-cta'}
                                >
                                    {secondaryCta.label}
                                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            )}
                        </div>
                    </Fade>
                )}
            </div>
        </section>
    );
}
