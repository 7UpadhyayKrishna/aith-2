import { BRAND } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Official AITH lockup.
 *
 * variant: 'full' | 'mark'
 * tone: 'color' (navy+gold for light surfaces) | 'light' (white+gold for dark surfaces)
 */
export default function BrandLogo({
    variant = 'full',
    tone = 'color',
    className = '',
    imgClassName = '',
    priority = false,
}) {
    const isMark = variant === 'mark';
    const isLight = tone === 'light';
    const width = isMark ? BRAND.markWidth : BRAND.logoWidth;
    const height = isMark ? BRAND.markHeight : BRAND.logoHeight;

    const webp = isMark
        ? (isLight ? BRAND.logoMarkWhiteWebp : BRAND.logoMarkWebp)
        : (isLight ? BRAND.logoWhiteWebp : BRAND.logoWebp);
    const png = isMark
        ? (isLight ? BRAND.logoMarkWhitePng : BRAND.logoMarkPng)
        : (isLight ? BRAND.logoWhitePng : BRAND.logoPng);
    const webp15 = isMark
        ? null
        : isLight
            ? '/brand/logo-white-transparent@1.5x.webp?v=9'
            : '/brand/logo-transparent@1.5x.webp?v=8';
    const webp2x = isMark
        ? null
        : isLight
            ? BRAND.logoWhiteWebp2x
            : BRAND.logoWebp2x;

    return (
        <span
            className={cn('relative inline-flex items-center shrink-0', className)}
            data-testid={`brand-logo-${variant}-${tone}`}
        >
            <picture className="block h-full max-h-full">
                {!isMark && (
                    <source
                        type="image/webp"
                        srcSet={`${webp} 1x, ${webp15} 1.5x, ${webp2x} 2x`}
                    />
                )}
                {isMark && <source type="image/webp" srcSet={webp} />}
                <img
                    src={png}
                    alt="Asian International Trade House"
                    width={width}
                    height={height}
                    decoding={priority ? 'sync' : 'async'}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : undefined}
                    className={cn(
                        'block h-full max-h-full w-auto max-w-full object-contain object-left select-none',
                        imgClassName
                    )}
                />
            </picture>
        </span>
    );
}
