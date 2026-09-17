export default function Marquee({ items, dark = true }) {
    return (
        <div
            className={`overflow-hidden border-y py-6 ${dark ? 'bg-forest text-ivory border-ivory/10' : 'bg-ivory text-graphite border-graphite/10'}`}
            aria-hidden="true"
            data-testid="editorial-marquee"
        >
            <div className="flex w-max animate-marquee">
                {[0, 1].map((dup) => (
                    <div key={dup} className="flex items-center">
                        {items.map((item, i) => (
                            <span key={i} className="flex items-center">
                                <span className={`px-10 font-mono text-xs lg:text-sm tracking-[0.35em] uppercase whitespace-nowrap ${item.toUpperCase() === 'TRADE IS CONNECTION' ? 'text-copper' : dark ? 'text-ivory/60' : 'text-graphite/60'}`}>
                                    {item}
                                </span>
                                <span className="w-1.5 h-1.5 bg-copper/70 shrink-0" />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
