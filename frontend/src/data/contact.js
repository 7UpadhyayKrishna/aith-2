/**
 * Contact & commercial details — sourced from AITH letterhead where available.
 * Leave WhatsApp / hours / SLA unset until confirmed (omit from UI).
 */
export const CONTACT = {
    email: 'connect@aithworld.com',
    phone: '011-47025456',
    phoneTel: '+911147025456',
    whatsapp: null,
    addressLine1: 'No. 901, Devika Tower, Nehru Place',
    addressLine2: 'New Delhi — 110019, India',
    corporateOffice:
        '210A, 2nd Floor, Seethakathi Business Center, Anna Salai, Chennai — 600 006',
    branches: ['Dubai, UAE', 'Singapore', 'Jakarta, Indonesia', 'Thimphu, Bhutan'],
    gstin: '07AGNPR2321L2Z3',
    coordinates: "28°36'N 77°13'E",
    hours: null,
    responseSla: null,
};

/** True when a value is configured (not empty / not a [TBD] placeholder). */
export function isConfigured(value) {
    if (!value || typeof value !== 'string') return false;
    return !value.includes('[TBD');
}
