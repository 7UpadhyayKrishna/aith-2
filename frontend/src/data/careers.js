/**
 * Careers / open roles for AITH.
 * Only roles with published: true appear on /careers.
 * Toggle `published` when hiring - keep drafts here so postings stay consistent.
 */

export const OPEN_ROLES = [
    {
        id: 'trade-coordinator-delhi',
        title: 'Trade Coordinator',
        team: 'Operations',
        location: 'New Delhi',
        type: 'Full-time',
        postedAt: '2026-09-01',
        blurb:
            'Coordinate documentation, supplier communication and shipment milestones for active Asia-origin trade lanes.',
        responsibilities: [
            'Track order milestones from confirmation through document handoff.',
            'Liaise with suppliers, freight partners and the commercial team on timing.',
            'Prepare and check commercial document packs against the agreed brief.',
            'Flag delays early with clear next steps - not noise.',
        ],
        requirements: [
            '1-3 years in trade ops, logistics coordination or export documentation.',
            'Comfortable with email-led supplier follow-up and spreadsheet tracking.',
            'Clear written English; Hindi helpful for Delhi operations.',
        ],
        published: true,
    },
    {
        id: 'sourcing-associate',
        title: 'Sourcing Associate',
        team: 'Sourcing',
        location: 'New Delhi / Hybrid',
        type: 'Full-time',
        postedAt: '2026-09-01',
        blurb:
            'Support requirement intake, origin mapping and supplier evaluation for healthcare, agri, minerals and related categories.',
        responsibilities: [
            'Capture buyer specs into clear sourcing briefs.',
            'Map requirements to origin options and shortlist suppliers.',
            'Coordinate samples, assays and technical data where available.',
            'Keep commercial notes tidy for quote and follow-up.',
        ],
        requirements: [
            'Interest in international trade, commodities or industrial sourcing.',
            'Strong organisation and follow-through; detail over theatre.',
            'Willingness to learn Incoterms, category basics and documentation flow.',
        ],
        published: true,
    },
    // Draft template - set published: true when confirmed:
    // {
    //     id: 'documentation-specialist',
    //     title: 'Documentation Specialist',
    //     team: 'Documentation & quality',
    //     location: 'New Delhi',
    //     type: 'Full-time',
    //     postedAt: '2026-09-15',
    //     blurb: 'Own export document sets and inspection scheduling against destination rules.',
    //     responsibilities: ['Assemble invoice, packing list and transport docs.', 'Schedule third-party inspection where required.'],
    //     requirements: ['Export documentation experience preferred.'],
    //     published: false,
    // },
];

export function getPublishedRoles() {
    return OPEN_ROLES.filter((r) => r.published);
}

export function getRoleById(id) {
    if (!id) return null;
    return OPEN_ROLES.find((r) => r.id === id) || null;
}

export const CAREER_VALUES = [
    {
        index: '01',
        title: 'International markets',
        blurb: 'Work across real trade lanes - Asia origins to destination buyers - with documentation and commercial discipline.',
    },
    {
        index: '02',
        title: 'Commercial learning',
        blurb: 'Learn how specifications, Incoterms, freight modes and compliance shape viable deals - not abstract theory.',
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

/** Role families we may hire into - not open vacancies. */
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
