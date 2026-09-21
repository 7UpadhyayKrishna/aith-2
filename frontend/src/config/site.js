/**
 * Central site configuration - update SITE_ORIGIN when production domain changes.
 */
export const SITE_NAME = 'Asian International Trade House';
export const SITE_SHORT = 'AITH';
export const SITE_ORIGIN = 'https://www.aithworld.com';
export const SITE_EMAIL = 'connect@aithworld.com';

export const DEFAULT_DESCRIPTION =
    'Asian International Trade House - global sourcing, international trading and supply solutions connecting products, suppliers and buyers across international markets.';

export const BRAND = {
    logoWebp: '/brand/logo-transparent.webp?v=8',
    logoPng: '/brand/logo-transparent.png?v=8',
    logoMarkWebp: '/brand/logo-mark-transparent.webp?v=8',
    logoMarkPng: '/brand/logo-mark-transparent.png?v=8',
    logoWebp2x: '/brand/logo-transparent@2x.webp?v=8',
    logoWhiteWebp: '/brand/logo-white-transparent.webp?v=9',
    logoWhitePng: '/brand/logo-white-transparent.png?v=9',
    logoWhiteWebp2x: '/brand/logo-white-transparent@2x.webp?v=9',
    logoMarkWhiteWebp: '/brand/logo-white-transparent.webp?v=9',
    logoMarkWhitePng: '/brand/logo-white-transparent.png?v=9',
    ogImage: '/brand/og-image.jpg?v=10',
    /** Intrinsic dimensions of logo-transparent.* (horizontal lockup) */
    logoWidth: 1100,
    logoHeight: 222,
    markWidth: 160,
    markHeight: 214,
};

export const SOCIAL = {
    linkedin: null, // [TBD]
    x: null, // [TBD]
    instagram: null, // [TBD]
};

/**
 * Show "Draft - for review" on Privacy / Terms.
 * Set REACT_APP_SHOW_LEGAL_DRAFT=false in production once counsel has approved.
 */
export const SHOW_LEGAL_DRAFT_BANNER = process.env.REACT_APP_SHOW_LEGAL_DRAFT !== 'false';

export function absoluteUrl(path = '/') {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_ORIGIN}${p === '/' ? '' : p}`;
}
