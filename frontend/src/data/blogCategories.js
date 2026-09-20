/** Shared blog categories - keep in sync with backend cms.config.BLOG_CATEGORIES */
export const BLOG_CATEGORIES = [
    'Global Sourcing',
    'Supplier Sourcing',
    'Import & Export',
    'Procurement',
    'Trade Documentation',
    'Logistics',
    'Quality & Compliance',
    'Industry Guides',
];

export const BLOG_STATUSES = ['draft', 'review', 'scheduled', 'published', 'archived'];

export const SEO_ISSUE_FILTERS = [
    { value: '', label: 'All SEO' },
    { value: 'missing-metadata', label: 'Missing metadata' },
    { value: 'missing-alt', label: 'Missing alt text' },
    { value: 'no-internal-links', label: 'No internal links' },
    { value: 'needs-refresh', label: 'Needs refresh' },
    { value: 'canonical-override', label: 'Canonical override' },
];

export const ENQUIRY_STATUSES = ['new', 'read', 'in-progress', 'resolved', 'archived'];
export const QUOTE_STATUSES = ['new', 'reviewing', 'responded', 'closed', 'archived'];
