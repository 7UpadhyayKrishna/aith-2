/**
 * Central business configuration for AITH.
 * Unknown commercial values stay null / [TBD] and must not render in customer UI
 * until confirmed - use isConfigured() before display.
 */

import { SITE_NAME, SITE_SHORT, SITE_ORIGIN, SITE_EMAIL, SOCIAL } from '../config/site';

/** True when a value is configured (not empty / not a [TBD] placeholder). */
export function isConfigured(value) {
    if (!value || typeof value !== 'string') return false;
    return !value.includes('[TBD');
}

export const COMPANY = {
    companyName: SITE_NAME,
    shortName: SITE_SHORT,
    legalEntityName: null, // [TBD]
    website: SITE_ORIGIN,
    email: SITE_EMAIL,
    phone: '011-47025456',
    phoneTel: '+911147025456',
    whatsapp: null, // [TBD]
    addressLine1: 'No. 901, Devika Tower, Nehru Place',
    addressLine2: 'New Delhi - 110019, India',
    corporateOffice:
        '210A, 2nd Floor, Seethakathi Business Center, Anna Salai, Chennai - 600 006',
    branches: ['Dubai, UAE', 'Singapore', 'Jakarta, Indonesia', 'Thimphu, Bhutan'],
    gstin: '07AGNPR2321L2Z3',
    coordinates: "28°36'N 77°13'E",
    hours: null, // [TBD]
    responseSla: null, // [TBD]
    socialLinks: SOCIAL,
    defaultCurrency: null, // [TBD]
    supportedCurrencies: null, // [TBD]
    preferredIncoterms: null, // [TBD]
    moqPolicy: null, // [TBD]
    quoteValidity: null, // [TBD]
    paymentTerms: null, // [TBD]
    insuranceCapability: null, // [TBD]
};

/** Locations shown on Careers / About when configured. */
export const WORK_LOCATIONS = [
    { id: 'delhi', label: 'New Delhi', detail: COMPANY.addressLine1 },
    { id: 'chennai', label: 'Chennai', detail: 'Corporate office' },
    ...COMPANY.branches.map((b) => ({
        id: b.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        label: b,
        detail: 'International branch',
    })),
];
