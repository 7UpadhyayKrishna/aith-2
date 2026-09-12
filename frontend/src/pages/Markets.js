import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Line, Fade, Tag } from '../components/Reveal';
import TradeMap from '../components/TradeMap';
import { REGIONS, LANES, IMG } from '../data/content';

export default function Markets() {
    return (
        <main>
            <section className="relative bg-forest text-ivory overflow-hidden" data-testid="markets-hero">
                <img src={IMG.vessel} alt="Cargo vessel at sea during sunset" className="absolute inset-0 w-full h-full object-cover opacity-30" loading="eager" />
                <div className="absolute inset-0 bg-forest/45" />
                <div className="relative z-10 px-6 lg:px-12 pt-44 pb-24 lg:pt-56 lg:pb-32">
                    <Fade y={10}>
                        <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-ivory/60">AITH / Markets</p>
                    </Fade>
                    <h1 className="text-[clamp(2.9rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em] font-extrabold mt-8">
                        <Line delay={0.15}>ONE SOURCE.</Line>
                        <Line delay={0.3}>
                            <span className="font-serif italic font-normal">MANY MARKETS.</span>
                        </Line>
                    </h1>
                    <Fade delay={0.45}>
                        <p className="text-ivory/65 text-sm lg:text-base leading-relaxed mt-10 max-w-xl">
                            Asian supply, international demand. We coordinate products from origin networks in Asia into four primary market regions — with routes, documentation and inspection managed end to end.
                        </p>
                    </Fade>
                </div>
            </section>

            <section className="bg-forest text-ivory px-6 lg:px-12 pb-28 lg:pb-36" data-testid="markets-map-section">
                <Fade>
                    <TradeMap />
                </Fade>
            </section>

            <section className="bg-ivory text-graphite px-6 lg:px-12 py-28 lg:py-36" data-testid="markets-regions-section">
                <Tag index="01" label="Market Regions" />
                <div className="mt-14 lg:mt-20 divide-y divide-graphite/15 border-y border-graphite/15">
                    {REGIONS.map((r, i) => (
                        <Fade key={r.id} delay={i * 0.05} y={18}>
                            <div className="grid lg:grid-cols-12 gap-4 lg:gap-6 py-9 lg:py-12 items-baseline" data-testid={`market-row-${r.id}`}>
                                <div className="lg:col-span-4">
                                    <span className="font-mono text-[10px] tracking-[0.25em] text-copper block mb-2">{r.coord}</span>
                                    <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight uppercase">{r.name}</h2>
                                </div>
                                <div className="lg:col-span-3">
                                    <p className="font-mono text-[9px] tracking-[0.3em] text-mute mb-2">Products</p>
                                    <p className="font-mono text-[11px] tracking-[0.12em] text-graphite/75">{r.products}</p>
                                </div>
                                <div className="lg:col-span-3">
                                    <p className="font-mono text-[9px] tracking-[0.3em] text-mute mb-2">Opportunities</p>
                                    <p className="text-sm text-mute leading-relaxed">{r.opp}</p>
                                </div>
                                <div className="lg:col-span-2">
                                    <p className="font-mono text-[9px] tracking-[0.3em] text-mute mb-2">Routes</p>
                                    <p className="font-mono text-[11px] tracking-[0.12em] text-copper">{r.routes}</p>
                                </div>
                            </div>
                        </Fade>
                    ))}
                </div>
            </section>

            <section className="bg-forest text-ivory px-6 lg:px-12 py-24 lg:py-32" data-testid="markets-lanes-section">
                <Tag index="02" label="Active Trade Lanes" dark />
                <div className="mt-12 divide-y divide-ivory/10 border-y border-ivory/10">
                    {LANES.map((l, i) => (
                        <Fade key={i} delay={i * 0.05} y={12}>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-6" data-testid={`lane-row-${i}`}>
                                <span className="font-mono text-[10px] tracking-[0.25em] text-ivory/40 w-10">L/0{i + 1}</span>
                                <span className="font-mono text-sm lg:text-lg tracking-[0.12em]">{l.from}</span>
                                <span className="text-copper font-mono text-lg">→</span>
                                <span className="font-mono text-sm lg:text-lg tracking-[0.12em]">{l.to}</span>
                            </div>
                        </Fade>
                    ))}
                </div>
                <Fade delay={0.2}>
                    <Link
                        to="/request-quote"
                        className="group inline-flex items-center gap-3 mt-14 bg-copper text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                        data-testid="markets-quote-button"
                    >
                        Trade Into These Markets
                        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                    </Link>
                </Fade>
            </section>
        </main>
    );
}
