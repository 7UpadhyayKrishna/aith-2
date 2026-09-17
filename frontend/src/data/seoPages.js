/**
 * Per-route SEO copy and internal-link hints for AITH marketing pages.
 * Titles omit the brand suffix — Seo.js appends " — SITE_NAME".
 */

export const SERVICE_SEO_SLUGS = [
    'global-sourcing-services',
    'import-export-services',
    'international-procurement',
    'supplier-sourcing',
    'trade-documentation',
    'freight-coordination',
];

export const INDUSTRY_SLUGS = [
    'healthcare',
    'agriculture',
    'minerals-metals',
    'chemicals',
    'textiles',
];

export const SEO_PAGES = {
    '/': {
        path: '/',
        primaryIntent: 'international trade company India',
        supporting: [
            'global sourcing Asia',
            'import export Delhi',
            'procurement Middle East Africa Europe',
        ],
        title: 'International Trade Company India | Global Sourcing & Export',
        description:
            'Asian International Trade House sources, documents and coordinates import-export from India and Asia to Middle East, Africa, Europe and North America.',
        h1Lines: ['FROM ASIA.', 'TO EVERYWHERE.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Services', to: '/services' },
            { label: 'Products', to: '/products' },
            { label: 'Request a Quote', to: '/request-quote' },
            { label: 'Contact Delhi', to: '/contact' },
        ],
        status: 'complete',
    },

    '/about': {
        path: '/about',
        primaryIntent: 'about Asian International Trade House',
        supporting: ['trade house India', 'sourcing company Delhi', 'AITH company'],
        title: 'About AITH | Trade Coordination from India',
        description:
            'How Asian International Trade House connects buyers and Asian suppliers through sourcing, documentation, quality checks and freight coordination.',
        h1Lines: ['WE CONNECT', 'PRODUCTS, PEOPLE', 'AND MARKETS.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Services', to: '/services' },
            { label: 'Markets', to: '/markets' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Partner with us', to: '/partner' },
        ],
        status: 'complete',
    },

    '/services': {
        path: '/services',
        primaryIntent: 'import export services India',
        supporting: [
            'global sourcing services',
            'international procurement',
            'freight coordination',
        ],
        title: 'Trade Services | Sourcing, Import-Export & Procurement',
        description:
            'Global sourcing, import-export coordination, procurement programs, trade documentation and freight coordination — structured from requirement to destination handoff.',
        h1Lines: ['SOLUTIONS FOR', 'REAL TRADE.'],
        italicLast: true,
        schemaType: 'collection',
        internalLinks: [
            { label: 'Global Sourcing', to: '/global-sourcing-services' },
            { label: 'Import & Export', to: '/import-export-services' },
            { label: 'Procurement', to: '/international-procurement' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
        ],
        status: 'complete',
    },

    '/products': {
        path: '/products',
        primaryIntent: 'import export products Asia',
        supporting: [
            'agriculture commodities export',
            'healthcare consumables sourcing',
            'industrial minerals trade',
        ],
        title: 'Products | Healthcare, Agriculture, Minerals, Chemicals, Textiles',
        description:
            'Five trade chapters — healthcare consumables, agriculture, industrial minerals, chemicals and textiles — sourced to specification for international buyers.',
        h1Lines: ['WHAT WE', 'MOVE.'],
        italicLast: true,
        schemaType: 'collection',
        internalLinks: [
            { label: 'Industries', to: '/industries' },
            { label: 'Agriculture', to: '/industries/agriculture' },
            { label: 'Request a Quote', to: '/request-quote' },
            { label: 'Custom sourcing', to: '/supplier-sourcing' },
        ],
        status: 'complete',
    },

    '/markets': {
        path: '/markets',
        primaryIntent: 'export markets Middle East Africa Europe',
        supporting: [
            'trade corridors India',
            'Gulf import sourcing',
            'Asia origin export lanes',
        ],
        title: 'Markets | Middle East, Africa, Europe & North America',
        description:
            'Demand regions we serve from Asian origin — Middle East, Africa, Europe and North America — with lane planning, Incoterms and documentation per shipment.',
        h1Lines: ['WHERE GOODS', 'LAND.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Services', to: '/services' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'Contact', to: '/contact' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/insights': {
        path: '/insights',
        primaryIntent: 'international trade insights',
        supporting: [
            'commodity markets guide',
            'trade documentation guide',
            'bulk procurement notes',
        ],
        title: 'Insights | Trade Guides & Market Notes',
        description:
            'Practical notes on commodity markets, essential trade documents and bulk procurement — written for buyers and suppliers running real cross-border deals.',
        h1Lines: ['TRADE NOTES.', 'NO NOISE.'],
        italicLast: true,
        schemaType: 'collection',
        internalLinks: [
            { label: 'Trade Documentation', to: '/trade-documentation' },
            { label: 'FAQ', to: '/faq' },
            { label: 'Services', to: '/services' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/faq': {
        path: '/faq',
        primaryIntent: 'import export FAQ India',
        supporting: [
            'how to request a trade quote',
            'shipping documents explained',
            'MOQ and lead times',
        ],
        title: 'FAQ | Quotes, Documents, Shipping & Quality',
        description:
            'Answers on starting a trade request, MOQs, Incoterms, documents, air vs sea, customs coordination, quality checks and becoming a supplier partner.',
        h1Lines: ['QUESTIONS.', 'ANSWERED.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Request a Quote', to: '/request-quote' },
            { label: 'Contact', to: '/contact' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Partner', to: '/partner' },
        ],
        status: 'complete',
    },

    '/contact': {
        path: '/contact',
        primaryIntent: 'import export company Delhi',
        supporting: [
            'AITH Nehru Place contact',
            'trade enquiry New Delhi',
            'Chennai corporate office',
        ],
        title: 'Contact | Import-Export Company Delhi (Nehru Place)',
        description:
            'Reach Asian International Trade House at Devika Tower, Nehru Place, New Delhi — or Chennai corporate office. Send a trade enquiry or visit details.',
        h1Lines: ["LET'S TALK", 'TRADE.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Request a Quote', to: '/request-quote' },
            { label: 'Partner', to: '/partner' },
            { label: 'Careers', to: '/careers' },
            { label: 'FAQ', to: '/faq' },
        ],
        status: 'complete',
    },

    '/request-quote': {
        path: '/request-quote',
        primaryIntent: 'request import export quote',
        supporting: [
            'trade RFQ India',
            'sourcing quote process',
            'bulk commodity enquiry',
        ],
        title: 'Request a Quote | Product, Volume & Destination',
        description:
            'Submit a structured trade brief with product, specification, volume, destination and timing. We review and return next steps or a commercial path.',
        h1Lines: ['START WITH', 'THE BRIEF.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'How quoting works', to: '/faq' },
            { label: 'Products', to: '/products' },
            { label: 'Services', to: '/services' },
            { label: 'Contact', to: '/contact' },
        ],
        status: 'complete',
    },

    '/partner': {
        path: '/partner',
        primaryIntent: 'become supplier partner India export',
        supporting: [
            'manufacturer export partnership',
            'supplier onboarding trade house',
            'long-term procurement supply',
        ],
        title: 'Partner | Supply Buyers Through AITH',
        description:
            'Manufacturers and exporters: share capacity, certifications and product range. We review fit against active buyer demand and onboarding standards.',
        h1Lines: ['BUILD TRADE', 'TOGETHER.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Supplier Sourcing', to: '/supplier-sourcing' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Contact', to: '/contact' },
            { label: 'Products', to: '/products' },
        ],
        status: 'complete',
    },

    '/quality-compliance': {
        path: '/quality-compliance',
        primaryIntent: 'trade quality compliance process',
        supporting: [
            'pre-shipment inspection',
            'certificate of analysis trade',
            'supplier verification',
        ],
        title: 'Quality & Compliance | Inspection & Documentation',
        description:
            'Quality as a process — supplier verification, product inspection, documentation checks and destination-market certificates arranged where required.',
        h1Lines: ['QUALITY', 'IS A PROCESS.'],
        italicLast: false,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Trade Documentation', to: '/trade-documentation' },
            { label: 'Services', to: '/services' },
            { label: 'FAQ', to: '/faq' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/careers': {
        path: '/careers',
        primaryIntent: 'careers international trade Delhi',
        supporting: [
            'trade operations jobs India',
            'sourcing coordinator careers',
            'AITH careers',
        ],
        title: 'Careers | Work in Trade Operations & Sourcing',
        description:
            'Open roles in trade operations, sourcing and commercial coordination across New Delhi, Chennai and international branches when positions are active.',
        h1Lines: ['WORK WITH', 'TRADE.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'About', to: '/about' },
            { label: 'Contact', to: '/contact' },
            { label: 'FAQ — Careers', to: '/faq' },
            { label: 'Partner', to: '/partner' },
        ],
        status: 'complete',
    },

    '/privacy': {
        path: '/privacy',
        primaryIntent: 'privacy policy AITH',
        supporting: ['data handling trade enquiries', 'website privacy India'],
        title: 'Privacy Policy',
        description:
            'How Asian International Trade House handles personal and commercial information submitted through the website, forms and trade correspondence channels.',
        h1Lines: ['PRIVACY', 'POLICY.'],
        italicLast: false,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Terms of Trade', to: '/terms' },
            { label: 'Contact', to: '/contact' },
        ],
        status: 'complete',
    },

    '/terms': {
        path: '/terms',
        primaryIntent: 'terms of trade AITH',
        supporting: ['website terms of use', 'commercial terms overview'],
        title: 'Terms of Trade',
        description:
            'Website and trade engagement terms for Asian International Trade House — use of the site, enquiries and commercial dealings subject to agreed contracts.',
        h1Lines: ['TERMS OF', 'TRADE.'],
        italicLast: false,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Contact', to: '/contact' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/global-sourcing-services': {
        path: '/global-sourcing-services',
        primaryIntent: 'global sourcing services India',
        supporting: [
            'supplier discovery Asia',
            'market mapping procurement',
            'sample verification sourcing',
        ],
        title: 'Global Sourcing Services India | Requirement to Supplier',
        description:
            'Requirement definition, market mapping, supplier discovery, evaluation, samples and order coordination — sourcing built around your specification.',
        h1Lines: ['GLOBAL SOURCING,', 'BUILT AROUND', 'THE REQUIREMENT.'],
        italicLast: true,
        schemaType: 'service',
        internalLinks: [
            { label: 'Supplier Sourcing', to: '/supplier-sourcing' },
            { label: 'International Procurement', to: '/international-procurement' },
            { label: 'Products', to: '/products' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/import-export-services': {
        path: '/import-export-services',
        primaryIntent: 'import export services India',
        supporting: [
            'export coordination Asia',
            'import support documentation',
            'cross-border trade India',
        ],
        title: 'Import & Export Services India | Coordinated Trade',
        description:
            'Import and export support with sourcing, commercial coordination, documentation, quality checks and freight coordination — not customs brokerage claims.',
        h1Lines: ['IMPORT.', 'EXPORT.', 'COORDINATED.'],
        italicLast: true,
        schemaType: 'service',
        internalLinks: [
            { label: 'Trade Documentation', to: '/trade-documentation' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'Markets', to: '/markets' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/international-procurement': {
        path: '/international-procurement',
        primaryIntent: 'international procurement services',
        supporting: [
            'recurring procurement programs',
            'institutional buying Asia',
            'order planning export',
        ],
        title: 'International Procurement Services | Structured Buying',
        description:
            'Structured international procurement — requirement, supplier search, comparison, specification lock, quality, documentation and repeat order planning.',
        h1Lines: ['PROCUREMENT', 'WITH A PLAN.'],
        italicLast: true,
        schemaType: 'service',
        internalLinks: [
            { label: 'Global Sourcing', to: '/global-sourcing-services' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Industries', to: '/industries' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/supplier-sourcing': {
        path: '/supplier-sourcing',
        primaryIntent: 'supplier sourcing India',
        supporting: [
            'find manufacturers India export',
            'Indian supplier evaluation',
            'buyer supplier match Asia',
        ],
        title: 'Supplier Sourcing India | Find & Evaluate Manufacturers',
        description:
            'For foreign buyers seeking Indian and Asian suppliers — manufacturer identification, capability evaluation and commercial comparison against your brief.',
        h1Lines: ['FIND THE', 'RIGHT ORIGIN.'],
        italicLast: true,
        schemaType: 'service',
        internalLinks: [
            { label: 'Global Sourcing', to: '/global-sourcing-services' },
            { label: 'Partner', to: '/partner' },
            { label: 'Products', to: '/products' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/trade-documentation': {
        path: '/trade-documentation',
        primaryIntent: 'import export documentation',
        supporting: [
            'commercial invoice packing list',
            'certificate of origin',
            'bill of lading AWB',
        ],
        title: 'Import-Export Documentation | Invoice, CoO, B/L & AWB',
        description:
            'What commercial invoices, packing lists, certificates of origin, bills of lading and air waybills do — and how we coordinate complete export document sets.',
        h1Lines: ['DOCUMENTS', 'THAT CLEAR.'],
        italicLast: true,
        schemaType: 'service',
        internalLinks: [
            { label: 'Import & Export', to: '/import-export-services' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'Insights', to: '/insights' },
            { label: 'FAQ', to: '/faq' },
        ],
        status: 'complete',
    },

    '/freight-coordination': {
        path: '/freight-coordination',
        primaryIntent: 'international freight coordination',
        supporting: [
            'air sea multimodal coordination',
            'container booking support',
            'shipment milestone updates',
        ],
        title: 'International Freight Coordination | Air, Sea & Multimodal',
        description:
            'Air, sea and multimodal freight coordination aligned to your Incoterms — booking support, milestones and handoff. Coordination only, not freight forwarding claims.',
        h1Lines: ['FREIGHT,', 'COORDINATED.'],
        italicLast: true,
        schemaType: 'service',
        internalLinks: [
            { label: 'Import & Export', to: '/import-export-services' },
            { label: 'Trade Documentation', to: '/trade-documentation' },
            { label: 'Markets', to: '/markets' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/industries': {
        path: '/industries',
        primaryIntent: 'trade industries Asia export',
        supporting: [
            'healthcare agriculture minerals',
            'chemicals textiles sourcing',
            'sector procurement India',
        ],
        title: 'Industries | Healthcare, Agri, Minerals, Chemicals, Textiles',
        description:
            'Five industry chapters — healthcare consumables, agriculture, minerals & metals, chemicals and textiles — each with distinct commercial and compliance needs.',
        h1Lines: ['ESSENTIAL', 'INDUSTRIES.'],
        italicLast: true,
        schemaType: 'collection',
        internalLinks: [
            { label: 'Healthcare', to: '/industries/healthcare' },
            { label: 'Agriculture', to: '/industries/agriculture' },
            { label: 'Minerals & Metals', to: '/industries/minerals-metals' },
            { label: 'Products', to: '/products' },
        ],
        status: 'complete',
    },

    '/industries/healthcare': {
        path: '/industries/healthcare',
        primaryIntent: 'healthcare sourcing India',
        supporting: [
            'medical consumables export',
            'hospital supplies procurement',
            'protective equipment sourcing',
        ],
        title: 'Healthcare Sourcing India | Consumables & Process Inputs',
        description:
            'Sourcing medical consumables, hospital supplies and process inputs from Asian manufacturers — documentation and quality checks without regulatory approval claims.',
        h1Lines: ['HEALTHCARE', 'SUPPLY,', 'SPECIFIED.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Products', to: '/products' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Global Sourcing', to: '/global-sourcing-services' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/industries/agriculture': {
        path: '/industries/agriculture',
        primaryIntent: 'agriculture export India rice wheat spices',
        supporting: [
            'rice wheat pulses export',
            'spices sourcing India',
            'food grain procurement',
        ],
        title: 'Agriculture Export | Rice, Wheat, Pulses & Spices',
        description:
            'Food grains, pulses, spices and related agri lines from Asian origin — grade, packaging, phytosanitary docs and freight coordination for destination markets.',
        h1Lines: ['GRAIN.', 'SPICE.', 'ORIGIN.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Products', to: '/products' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'Markets', to: '/markets' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/industries/minerals-metals': {
        path: '/industries/minerals-metals',
        primaryIntent: 'industrial minerals trade India',
        supporting: [
            'iron ore limestone quartz',
            'assay backed mineral export',
            'bulk mineral procurement',
        ],
        title: 'Minerals & Metals Trade | Industrial Minerals Sourcing',
        description:
            'Industrial minerals and related materials with assay-backed specs — iron ore, limestone, bauxite, quartz and more. Trading coordination, not mining ownership claims.',
        h1Lines: ['MINERALS.', 'ASSAYED.', 'SHIPPED.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Products', to: '/products' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Bulk freight', to: '/freight-coordination' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/industries/chemicals': {
        path: '/industries/chemicals',
        primaryIntent: 'chemical sourcing export India',
        supporting: [
            'industrial solvents SDS',
            'specialty chemicals trade',
            'polymers dyes pigments',
        ],
        title: 'Chemicals Trade | Industrial & Specialty Lines',
        description:
            'Industrial and specialty chemicals with SDS, handling notes and controlled logistics coordination — solvents, polymers, dyes, fertilizers and related lines.',
        h1Lines: ['CHEMICALS,', 'HANDLED WITH', 'CARE.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Trade Documentation', to: '/trade-documentation' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },

    '/industries/textiles': {
        path: '/industries/textiles',
        primaryIntent: 'textile sourcing India yarn fabric garments',
        supporting: [
            'cotton yarn export',
            'woven fabrics procurement',
            'garment sourcing India',
        ],
        title: 'Textiles Sourcing India | Yarn, Fabric & Garments',
        description:
            'Cotton yarn, woven fabrics, technical and home textiles, denim and garments from established Asian weaving and garment clusters — spec, QC and shipment.',
        h1Lines: ['YARN.', 'FABRIC.', 'FINISHED.'],
        italicLast: true,
        schemaType: 'webpage',
        internalLinks: [
            { label: 'Products', to: '/products' },
            { label: 'Supplier Sourcing', to: '/supplier-sourcing' },
            { label: 'Markets', to: '/markets' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        status: 'complete',
    },
};

/** Indexable routes for sitemap generation (exclude 404). */
export const SITEMAP_ROUTES = [
    { path: '/', changefreq: 'weekly', priority: 1.0 },
    { path: '/about', changefreq: 'monthly', priority: 0.9 },
    { path: '/services', changefreq: 'monthly', priority: 0.9 },
    { path: '/products', changefreq: 'weekly', priority: 0.9 },
    { path: '/markets', changefreq: 'monthly', priority: 0.8 },
    { path: '/insights', changefreq: 'weekly', priority: 0.8 },
    { path: '/faq', changefreq: 'monthly', priority: 0.8 },
    { path: '/contact', changefreq: 'monthly', priority: 0.8 },
    { path: '/request-quote', changefreq: 'monthly', priority: 0.9 },
    { path: '/partner', changefreq: 'monthly', priority: 0.8 },
    { path: '/quality-compliance', changefreq: 'monthly', priority: 0.8 },
    { path: '/careers', changefreq: 'monthly', priority: 0.7 },
    { path: '/global-sourcing-services', changefreq: 'monthly', priority: 0.85 },
    { path: '/import-export-services', changefreq: 'monthly', priority: 0.85 },
    { path: '/international-procurement', changefreq: 'monthly', priority: 0.85 },
    { path: '/supplier-sourcing', changefreq: 'monthly', priority: 0.85 },
    { path: '/trade-documentation', changefreq: 'monthly', priority: 0.8 },
    { path: '/freight-coordination', changefreq: 'monthly', priority: 0.8 },
    { path: '/industries', changefreq: 'monthly', priority: 0.85 },
    { path: '/industries/healthcare', changefreq: 'monthly', priority: 0.8 },
    { path: '/industries/agriculture', changefreq: 'monthly', priority: 0.8 },
    { path: '/industries/minerals-metals', changefreq: 'monthly', priority: 0.8 },
    { path: '/industries/chemicals', changefreq: 'monthly', priority: 0.8 },
    { path: '/industries/textiles', changefreq: 'monthly', priority: 0.8 },
    { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
    { path: '/terms', changefreq: 'yearly', priority: 0.3 },
];

export function getSeoPage(path) {
    return SEO_PAGES[path] || null;
}
