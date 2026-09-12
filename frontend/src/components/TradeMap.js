import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import landTopo from 'world-atlas/land-110m.json';
import countriesTopo from 'world-atlas/countries-110m.json';
import { REGIONS } from '../data/content';
import { EASE } from './Reveal';

const W = 1200;
const H = 620;
const IVORY_TEXT = 'rgba(243, 240, 232, 0.66)';
const IVORY_FAINT = 'rgba(243, 240, 232, 0.4)';

const projection = geoNaturalEarth1().fitExtent([[26, 26], [W - 26, H - 10]], { type: 'Sphere' });
const pathGen = geoPath(projection);
const landPath = pathGen(feature(landTopo, landTopo.objects.land));
const bordersPath = pathGen(feature(countriesTopo, countriesTopo.objects.countries));
const graticulePath = pathGen(geoGraticule10());
const spherePath = pathGen({ type: 'Sphere' });

export default function TradeMap() {
    const [active, setActive] = useState(null);
    const pts = useMemo(() => REGIONS.map((r) => ({ ...r, p: projection([r.lon, r.lat]) })), []);
    const asia = pts.find((r) => r.primary);
    const routes = pts.filter((r) => !r.primary);

    const arc = (r) => {
        const [x1, y1] = asia.p;
        const [x2, y2] = r.p;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        let nx = -dy / len;
        let ny = dx / len;
        if (ny > 0) {
            nx = -nx;
            ny = -ny;
        }
        const lift = Math.min(len * 0.22, 120);
        return `M ${x1} ${y1} Q ${mx + nx * lift} ${my + ny * lift} ${x2} ${y2}`;
    };

    return (
        <div className="relative w-full" onMouseLeave={() => setActive(null)} data-testid="trade-map">
            <svg viewBox="0 0 1200 620" className="w-full h-auto" role="img" aria-label="Cartographic drawing of AITH trade routes from Asia to the Middle East, Africa, Europe and North America">
                <path d={spherePath} fill="none" stroke="rgba(243,240,232,0.14)" strokeWidth="1" />
                <path d={graticulePath} fill="none" stroke="rgba(243,240,232,0.06)" strokeWidth="0.6" />
                <path d={landPath} fill="rgba(243,240,232,0.06)" stroke="rgba(243,240,232,0.3)" strokeWidth="0.8" />
                <path d={bordersPath} fill="none" stroke="rgba(243,240,232,0.08)" strokeWidth="0.5" />

                {[60, 110, 170].map((r) => (
                    <circle key={r} cx={asia.p[0]} cy={asia.p[1]} r={r} fill="none" stroke="rgba(182,90,50,0.16)" strokeWidth="0.8" strokeDasharray="2 6" />
                ))}

                {routes.map((r, i) => (
                    <motion.path
                        key={r.id}
                        d={arc(r)}
                        fill="none"
                        stroke="#B65A32"
                        strokeWidth="1.4"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true, margin: '-15% 0px' }}
                        transition={{ duration: 1.8, delay: 0.4 + i * 0.3, ease: EASE }}
                    />
                ))}

                {pts.map((r, i) => (
                    <motion.g
                        key={r.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + i * 0.15, duration: 0.8 }}
                        onMouseEnter={() => setActive(r)}
                        onClick={() => setActive(active?.id === r.id ? null : r)}
                        style={{ cursor: 'pointer' }}
                        data-testid={`map-region-${r.id}`}
                    >
                        <rect x={r.p[0] - 4.5} y={r.p[1] - 4.5} width="9" height="9" fill="#B65A32" />
                        <rect x={r.p[0] - 11} y={r.p[1] - 11} width="22" height="22" fill="none" stroke="rgba(182,90,50,0.45)" strokeWidth="0.8" />
                        <circle cx={r.p[0]} cy={r.p[1]} r="30" fill="transparent" />
                        <text x={r.p[0] + r.ldx} y={r.p[1] + r.ldy} textAnchor={r.la} fill={IVORY_TEXT} fontSize="11.5" fontFamily="'JetBrains Mono', monospace" letterSpacing="2.2">
                            {r.name}
                        </text>
                        <text x={r.p[0] + r.ldx} y={r.p[1] + r.ldy + 16} textAnchor={r.la} fill={IVORY_FAINT} fontSize="9.5" fontFamily="'JetBrains Mono', monospace" letterSpacing="1.4">
                            {r.coord}
                        </text>
                    </motion.g>
                ))}

                <text x="44" y="604" fill={IVORY_FAINT} fontSize="10" fontFamily="'JetBrains Mono', monospace" letterSpacing="2.5">
                    28°36'N 77°13'E — SOURCE ORIGIN
                </text>
                <text x="1170" y="34" textAnchor="end" fill={IVORY_FAINT} fontSize="10" fontFamily="'JetBrains Mono', monospace" letterSpacing="2.5">
                    TRADE LANES / 004
                </text>
            </svg>

            {active && (
                <div
                    className="absolute z-20 w-72 max-w-[78vw] bg-ivory text-graphite p-5 border border-graphite/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] pointer-events-none"
                    style={{
                        left: `${Math.min(Math.max((active.p[0] / W) * 100, 12), 78)}%`,
                        top: `${(active.p[1] / H) * 100}%`,
                        transform: active.p[1] / H < 0.38 ? 'translateY(14%)' : 'translateY(-108%)',
                    }}
                    data-testid="map-market-panel"
                >
                    <p className="font-mono text-[9px] tracking-[0.3em] text-copper mb-1.5">MARKET</p>
                    <p className="font-extrabold tracking-tight text-lg leading-tight">{active.name}</p>
                    <p className="font-mono text-[9px] tracking-[0.3em] text-copper mt-4 mb-1.5">PRODUCTS</p>
                    <p className="font-mono text-[10px] tracking-[0.12em] text-graphite/70">{active.products}</p>
                    <p className="font-mono text-[9px] tracking-[0.3em] text-copper mt-4 mb-1.5">OPPORTUNITIES</p>
                    <p className="text-sm text-mute leading-relaxed">{active.opp}</p>
                </div>
            )}
        </div>
    );
}
