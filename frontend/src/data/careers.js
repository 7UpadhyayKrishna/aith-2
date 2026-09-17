/**
 * Careers / open roles for AITH.
 * Only roles with published: true appear on /careers.
 * Do not invent openings — leave OPEN_ROLES empty for a professional empty state.
 */

export const OPEN_ROLES = [
    // Example draft (unpublished) — enable when hiring is confirmed:
    // {
    //     id: 'trade-coordinator-delhi',
    //     title: 'Trade Coordinator',
    //     team: 'Operations',
    //     location: 'New Delhi',
    //     type: 'Full-time',
    //     blurb: 'Coordinate documentation, supplier communication and shipment milestones for active trade lanes.',
    //     published: false,
    // },
];

export function getPublishedRoles() {
    return OPEN_ROLES.filter((r) => r.published);
}

export const CAREER_VALUES = [
    {
        index: '01',
        title: 'International markets',
        blurb: 'Work across real trade lanes — Asia origins to destination buyers — with documentation and commercial discipline.',
    },
    {
        index: '02',
        title: 'Commercial learning',
        blurb: 'Learn how specifications, Incoterms, freight modes and compliance shape viable deals — not abstract theory.',
    },
    {
        index: '03',
        title: 'Clear expectations',
        blurb: 'Roles emphasise reliability, communication and follow-through. We value precision over noise.',
    },
    {
        index: '04',
        title: 'Long-horizon relationships',
        blurb: 'Trade houses succeed on recurring trust with suppliers and buyers. That culture shapes how we hire and work.',
    },
];

/** Role families we may hire into — not open vacancies. */
export const ROLE_FAMILIES = [
    {
        id: 'commercial',
        title: 'Commercial / trade',
        blurb: 'Buyer and supplier conversations, quote discipline and relationship ownership across active lanes.',
    },
    {
        id: 'sourcing',
        title: 'Sourcing',
        blurb: 'Requirement intake, origin mapping, supplier evaluation and sample coordination.',
    },
    {
        id: 'operations',
        title: 'Operations',
        blurb: 'Order follow-through, milestone tracking and handoffs between origin and destination partners.',
    },
    {
        id: 'logistics',
        title: 'Logistics coordination',
        blurb: 'Mode selection support, booking windows and documentation timing with freight partners.',
    },
    {
        id: 'documentation',
        title: 'Documentation & quality',
        blurb: 'Export document sets, inspection scheduling and compliance checks against destination rules.',
    },
];

export const HIRE_STEPS = [
    { index: '01', title: 'Introduce', blurb: 'Share your background, interest area and preferred location.' },
    { index: '02', title: 'Conversation', blurb: 'A focused discussion on experience, commercial judgement and fit.' },
    { index: '03', title: 'Alignment', blurb: 'Where there is mutual fit, we align on role, location and next steps.' },
];
