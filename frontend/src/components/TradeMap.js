import { useState } from 'react';
import { motion } from 'framer-motion';
import { REGIONS } from '../data/content';
import { EASE } from './Reveal';

const IVORY_LINE = 'rgba(243, 240, 232, 0.08)';
const IVORY_TEXT = 'rgba(243, 240, 232, 0.62)';
const IVORY_FAINT = 'rgba(243, 240, 232, 0.38)';

export default function TradeMap() {
    const [active, setActive] = useState(null);
    const asia = REGIONS.find((r) => r.primary);
    const routes = REGIONS.filter((r) => !r.primary);

    const arc = (r) => {
        const mx = (asia.x + r.x) / 2;
        const lift = Math.max(Math.abs(asia.x - r.x) * 0.28, 90);
        const cy = Math.min(asia.y, r.y) - lift;
        return `M ${asia.x} ${asia.y} Q ${mx} ${cy} ${r.x} ${r.y}`;
    };

    return (
        <div className="relative w-full" onMouseLeave={() => setActive(null)} data-testid="trade-map">
            <svg viewBox="0 0 1200 620" className="w-full h-auto" role="img" aria-label="Cartographic drawing of AITH trade routes from Asia to the Middle East, Africa, Europe and North America">
                {Array.from({ length: 11 }, (_, i) => (
                    <line key={`v${i}`} x1={60 + i * 108} y1="30" x2={60 + i * 108} y2="590" stroke={IVORY_LINE} strokeWidth="1" />
                ))}
                {Array.from({ length: 6 }, (_, i) => (
                    <line key={`h${i}`} x1="40" y1={60 + i * 100} x2="1160" y2={60 + i * 100} stroke={IVORY_LINE} strokeWidth="1" />
                ))}

                {[70, 130, 200].map((r, i) => (
                    <circle key={i} cx={asia.x} cy={asia.y} r={r} fill="none" stroke="rgba(243,240,232,0.07)" strokeWidth="1" strokeDasharray="2 6" />
                ))}
                <ellipse cx="330" cy="430" rx="200" ry="110" fill="none" stroke="rgba(243,240,232,0.05)" strokeWidth="1" />
                <ellipse cx="950" cy="480" rx="160" ry="80" fill="none" stroke="rgba(243,240,232,0.05)" strokeWidth="1" />

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

                {REGIONS.map((r, i) => (
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
                        <rect x={r.x - 5} y={r.y - 5} width="10" height="10" fill="#B65A32" />
                        <rect x={r.x - 13} y={r.y - 13} width="26" height="26" fill="none" stroke="rgba(182,90,50,0.4)" strokeWidth="1" />
                        <circle cx={r.x} cy={r.y} r="34" fill="transparent" />
                        <text x={r.x + 20} y={r.y + 2} fill={IVORY_TEXT} fontSize="12" fontFamily="'JetBrains Mono', monospace" letterSpacing="2.5">
                            {r.name}
                        </text>
                        <text x={r.x + 20} y={r.y + 20} fill={IVORY_FAINT} fontSize="10" fontFamily="'JetBrains Mono', monospace" letterSpacing="1.5">
                            {r.coord}
                        </text>
                    </motion.g>
                ))}

                <text x="44" y="604" fill={IVORY_FAINT} fontSize="10" fontFamily="'JetBrains Mono', monospace" letterSpacing="2.5">
                    28°36'N 77°13'E — SOURCE ORIGIN
                </text>
                <text x="980" y="44" fill={IVORY_FAINT} fontSize="10" fontFamily="'JetBrains Mono', monospace" letterSpacing="2.5">
                    TRADE LANES / 004
                </text>
            </svg>

            {active && (
                <div
                    className="absolute z-20 w-72 max-w-[78vw] bg-ivory text-graphite p-5 border border-graphite/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] pointer-events-none"
                    style={{
                        left: `${Math.min(Math.max((active.x / 1200) * 100, 12), 78)}%`,
                        top: `${(active.y / 620) * 100}%`,
                        transform: 'translateY(-108%)',
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
