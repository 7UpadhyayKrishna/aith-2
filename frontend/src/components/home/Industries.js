import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Line, Fade, Tag } from '../Reveal';
import { CATEGORIES, PARTNERSHIPS } from '../../data/content';

export default function Industries() {
    return (
        <>
            <section id="industries" className="bg-forest text-ivory py-28 lg:py-40" data-testid="industries-section">
                <div className="px-6 lg:px-12 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <Tag index="08" label="Industries" dark />
                        <h2 className="text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                            <Line>BUILT FOR</Line>
                            <Line delay={0.12}>ESSENTIAL INDUSTRIES<span className="text-copper">.</span></Line>
                        </h2>
                    </div>
                    <Fade delay={0.2}>
                        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-ivory/40 pb-3">Drag / Scroll →</p>
                    </Fade>
                </div>

                <Fade delay={0.15} className="mt-14 lg:mt-20">
                    <div className="flex gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 lg:px-12 pb-4" data-testid="industries-gallery">
                        {CATEGORIES.map((c, i) => (
                            <Link
                                key={c.id}
                                to={`/products#${c.id}`}
                                className="group relative flex-none w-[78vw] md:w-[55vw] lg:w-[42vw] h-[58vh] lg:h-[66vh] snap-start overflow-hidden"
                                data-testid={`industry-panel-${c.id}`}
                            >
                                <img
                                    src={c.image}
                                    alt={`${c.name} industry`}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-forest/40 group-hover:bg-forest/25 transition-colors duration-700" />
                                <span className="absolute top-5 left-5 font-mono text-[10px] tracking-[0.3em] text-ivory/70">0{i + 1} / INDUSTRY</span>
                                <span className="absolute top-5 right-5 font-mono text-[10px] tracking-[0.25em] uppercase text-ivory/0 group-hover:text-copper transition-colors duration-500">
                                    Explore →
                                </span>
                                <div className="absolute bottom-6 left-5 right-5">
                                    <h3 className="text-3xl lg:text-5xl font-extrabold tracking-tight uppercase">{c.name}</h3>
                                    <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ivory/60 mt-2">{c.products.slice(0, 3).join(' / ')}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Fade>
            </section>

            <section id="sourcing" className="bg-sage text-forest px-6 lg:px-12 py-28 lg:py-40" data-testid="sourcing-section">
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <Fade y={10}>
                            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-forest/60">09 / Global Sourcing</p>
                        </Fade>
                        <h2 className="text-[clamp(2.7rem,6vw,6rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-8">
                            <Line>CAN'T FIND</Line>
                            <Line delay={0.1}>WHAT YOU NEED?</Line>
                            <Line delay={0.2}>
                                <span className="font-serif italic font-normal">TELL US WHAT</span>
                            </Line>
                            <Line delay={0.3}>
                                <span className="font-serif italic font-normal">YOU'RE LOOKING FOR.</span>
                            </Line>
                        </h2>
                        <Fade delay={0.35}>
                            <p className="text-forest/75 text-sm lg:text-base leading-relaxed mt-8 max-w-lg">
                                Share your product, specification, quantity and destination. Our team can review the requirement and explore suitable sourcing options.
                            </p>
                            <Link
                                to="/request-quote?type=sourcing"
                                className="group inline-flex items-center gap-3 mt-10 bg-forest text-ivory px-8 py-4 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-olive transition-colors duration-300"
                                data-testid="sourcing-request-button"
                            >
                                Start a Sourcing Request
                                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                            </Link>
                        </Fade>
                    </div>
                    <div className="lg:col-span-3 lg:col-start-10 flex lg:justify-end">
                        <Fade delay={0.4}>
                            <div className="flex lg:flex-col items-center gap-4 lg:gap-0" data-testid="sourcing-flow">
                                {['Buyer', 'AITH', 'Supplier'].map((n, i) => (
                                    <div key={n} className="flex lg:flex-col items-center gap-4 lg:gap-0">
                                        {i > 0 && <span className="w-10 h-px lg:w-px lg:h-14 bg-forest/30" />}
                                        <div className="lg:py-2 text-center">
                                            <p className={`font-extrabold tracking-tight uppercase ${n === 'AITH' ? 'text-copper text-2xl lg:text-3xl' : 'text-forest/80 text-lg lg:text-xl'}`}>{n}</p>
                                            <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-forest/50 mt-1">
                                                {i === 0 ? 'Shares spec' : i === 1 ? 'Sources & verifies' : 'Delivers'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Fade>
                    </div>
                </div>
            </section>

            <section id="partners" className="bg-bone text-graphite px-6 lg:px-12 py-28 lg:py-40" data-testid="partnership-section">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <Tag index="10" label="Partnerships" />
                        <h2 className="text-[clamp(2.8rem,6vw,6rem)] leading-[0.95] tracking-[-0.03em] font-extrabold mt-10">
                            <Line>WHO WE</Line>
                            <Line delay={0.12}>WORK WITH<span className="text-copper">.</span></Line>
                        </h2>
                    </div>
                </div>

                <div className="mt-16 lg:mt-20 divide-y divide-graphite/15 border-y border-graphite/15">
                    {PARTNERSHIPS.map((p, i) => (
                        <Fade key={p.id} delay={i * 0.06} y={18}>
                            <Link
                                to={`/request-quote?type=partner&role=${p.id}`}
                                className="group relative grid lg:grid-cols-12 gap-3 lg:gap-6 items-center py-9 lg:py-12"
                                data-testid={`partnership-row-${p.id}`}
                            >
                                <span className="absolute bottom-0 left-0 h-[2px] bg-copper w-0 group-hover:w-full transition-all duration-700 ease-out" />
                                <span className="lg:col-span-1 font-mono text-xs tracking-[0.2em] text-mute group-hover:text-copper transition-colors duration-300">0{i + 1}</span>
                                <span className="lg:col-span-5 text-3xl lg:text-5xl font-extrabold tracking-tight uppercase group-hover:translate-x-2 transition-transform duration-500">
                                    {p.title}
                                </span>
                                <span className="lg:col-span-5 text-sm lg:text-base text-mute">{p.blurb}</span>
                                <ArrowUpRight size={26} className="lg:col-span-1 justify-self-start lg:justify-self-end text-mute group-hover:text-copper group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />
                            </Link>
                        </Fade>
                    ))}
                </div>
            </section>
        </>
    );
}
