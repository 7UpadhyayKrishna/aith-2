import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Line, Fade, Tag } from '../Reveal';
import TradeMap from '../TradeMap';

export default function GlobalTrade() {
    return (
        <section className="bg-forest text-ivory px-6 lg:px-12 py-28 lg:py-40" data-testid="global-trade-section">
            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                    <Tag index="05" label="Global Trade" dark />
                    <h2 className="text-[clamp(2.9rem,7vw,7rem)] leading-[0.94] tracking-[-0.03em] font-extrabold mt-10">
                        <Line>ONE SOURCE.</Line>
                        <Line delay={0.12}>
                            <span className="font-serif italic font-normal">MANY MARKETS.</span>
                        </Line>
                    </h2>
                </div>
                <div className="lg:col-span-4 self-end">
                    <Fade delay={0.3}>
                        <p className="text-ivory/60 text-sm lg:text-base leading-relaxed max-w-sm">
                            From origin networks across Asia, we move products into the Middle East, Africa, Europe and North America — with documentation and quality managed at every step.
                        </p>
                        <Link
                            to="/markets"
                            className="group inline-flex items-center gap-2 mt-7 font-mono text-[11px] tracking-[0.22em] uppercase text-ivory border-b border-ivory/40 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                            data-testid="global-trade-markets-link"
                        >
                            Explore Markets
                            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </Fade>
                </div>
            </div>

            <Fade delay={0.2} className="mt-16 lg:mt-24">
                <TradeMap />
            </Fade>

            <Fade delay={0.1}>
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-ivory/35 mt-8">
                    Hover a market to view products and opportunities — Asia is the source origin.
                </p>
            </Fade>
        </section>
    );
}
