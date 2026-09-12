const u = (id, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
    hero: u('photo-1494412574643-ff11b0a5c1c3', 2200),
    approach: u('photo-1771904866827-8850e545f415'),
    approachOverlap: u('photo-1586201375761-83865001e31c', 900),
    vessel: u('photo-1763257708531-363d5ca39c22', 2200),
    warehouse: u('photo-1553413077-190dd305871c'),
    cranes: u('photo-1519003722824-194d4455a60c'),
    field: u('photo-1500382017468-9049fed747ef', 2000),
    story1: u('photo-1578575437130-527eed3abbec'),
    story2: u('photo-1780245882836-5a0501dc93d7'),
    story3: u('photo-1759411364609-aeb30eb034e4'),
};

export const CATEGORIES = [
    {
        id: 'healthcare',
        index: '01',
        name: 'Healthcare',
        tone: '#A9B4BA',
        toneName: 'MINERAL BLUE-GREY',
        blurb: 'Medical devices, consumables and pharmaceutical inputs sourced from audited manufacturers.',
        image: u('photo-1584308666744-24d5c474f2ae'),
        products: ['Surgical Instruments', 'Medical Consumables', 'Pharmaceutical Ingredients', 'Diagnostic Equipment', 'Hospital Supplies', 'Protective Equipment'],
    },
    {
        id: 'agriculture',
        index: '02',
        name: 'Agriculture',
        tone: '#C98262',
        toneName: 'TERRACOTTA / SAGE',
        blurb: 'Food grains, spices and produce moving from Asian farms to international markets.',
        image: u('photo-1563514227147-6d2ff665a6a0'),
        products: ['Rice', 'Wheat', 'Pulses', 'Spices', 'Fresh Produce', 'Dry Fruits'],
    },
    {
        id: 'minerals',
        index: '03',
        name: 'Minerals',
        tone: '#B9B2A4',
        toneName: 'DUSTED STONE',
        blurb: 'Industrial minerals and raw materials with assay-backed quality documentation.',
        image: u('photo-1504917595217-d4dc5ebe6122'),
        products: ['Iron Ore', 'Coal & Coke', 'Limestone', 'Bauxite', 'Industrial Salt', 'Quartz'],
    },
    {
        id: 'chemicals',
        index: '04',
        name: 'Chemicals',
        tone: '#29372E',
        toneName: 'DEEP OLIVE / PALE SAND',
        blurb: 'Industrial and specialty chemicals handled with controlled, compliant logistics.',
        image: u('photo-1516937941344-00b4e0337589'),
        products: ['Industrial Solvents', 'Specialty Chemicals', 'Fertilizers', 'Polymers', 'Dyes & Pigments', 'Industrial Acids'],
    },
    {
        id: 'textiles',
        index: '05',
        name: 'Textiles',
        tone: '#B7AEB6',
        toneName: 'LAVENDER-GREY / WARM BONE',
        blurb: 'Yarns, fabrics and finished goods from established weaving and garment clusters.',
        image: u('photo-1542272604-787c3835535d'),
        products: ['Cotton Yarn', 'Woven Fabrics', 'Technical Textiles', 'Home Textiles', 'Garments', 'Denim'],
    },
];

export const SHOWCASE_PRODUCTS = [
    { name: 'Rice', image: u('photo-1586201375761-83865001e31c', 2000) },
    { name: 'Wheat', image: u('photo-1574323347407-f5e1ad6d020b', 2000) },
    { name: 'Pulses', image: u('photo-1610725664285-7c57e6eeac3f', 2000) },
    { name: 'Spices', image: u('photo-1596040033229-a9821ebd058d', 2000) },
    { name: 'Fresh Produce', image: u('photo-1464226184884-fa280b87c399', 2000) },
    { name: 'Dry Fruits', image: u('photo-1447933601403-0c6688de566e', 2000) },
];

export const CAPABILITIES = [
    {
        index: '01',
        title: 'Global Sourcing',
        blurb: 'We identify, evaluate and onboard suppliers across Asia matched to your specification, volume and compliance requirements.',
        image: u('photo-1494412651409-8963ce7935a7'),
    },
    {
        index: '02',
        title: 'Import & Export',
        blurb: 'End-to-end movement of goods across borders — documentation, customs coordination and trade compliance handled.',
        image: u('photo-1605745341112-85968b19335b'),
    },
    {
        index: '03',
        title: 'International Procurement',
        blurb: 'Structured procurement programs for institutions, distributors and industrial buyers with recurring requirements.',
        image: u('photo-1504328345606-18bbc8c9d7d1'),
    },
    {
        index: '04',
        title: 'Bulk Trading',
        blurb: 'Container-load and vessel-scale commodity trading with negotiated terms, inspection and secure settlement.',
        image: u('photo-1574323347407-f5e1ad6d020b'),
    },
    {
        index: '05',
        title: 'Supply Chain',
        blurb: 'Coordination from origin warehouse to destination port — freight, warehousing partners and delivery scheduling.',
        image: u('photo-1760998805232-4c8632d71cc3'),
    },
];

export const REGIONS = [
    {
        id: 'north-america',
        name: 'NORTH AMERICA',
        coord: '39°N 98°W',
        lon: -98,
        lat: 39,
        la: 'start',
        ldx: 16,
        ldy: 4,
        products: 'TEXTILES / AGRI COMMODITIES / CHEMICALS',
        opp: 'Long-term distribution and retail supply contracts.',
        routes: 'INNSA1 → USHOU / USNYC',
    },
    {
        id: 'europe',
        name: 'EUROPE',
        coord: '50°N 10°E',
        lon: 10,
        lat: 50,
        la: 'start',
        ldx: 16,
        ldy: -16,
        products: 'TEXTILES / MINERALS / SPECIALTY CHEMICALS',
        opp: 'Compliance-led sourcing and private-label programs.',
        routes: 'INNSA1 → NLRTM / DEHAM',
    },
    {
        id: 'middle-east',
        name: 'MIDDLE EAST',
        coord: '26°N 52°E',
        lon: 52,
        lat: 26,
        la: 'start',
        ldx: 16,
        ldy: 30,
        products: 'AGRICULTURE / TEXTILES / CHEMICALS',
        opp: 'Food-security procurement across the Gulf corridor.',
        routes: 'INNSA1 → AEJEA / SAJED',
    },
    {
        id: 'africa',
        name: 'AFRICA',
        coord: '2°S 36°E',
        lon: 36,
        lat: -2,
        la: 'start',
        ldx: 16,
        ldy: 34,
        products: 'HEALTHCARE / AGRICULTURE / MINERALS',
        opp: 'Public-health procurement and grain import programs.',
        routes: 'INMUN1 → KEMBA / ZADUR',
    },
    {
        id: 'asia',
        name: 'ASIA — SOURCE ORIGIN',
        coord: "28°36'N 77°13'E",
        lon: 78,
        lat: 26,
        la: 'end',
        ldx: -16,
        ldy: -18,
        primary: true,
        products: 'SUPPLIER NETWORK / INTRA-ASIA CORRIDORS',
        opp: 'Origin network across India, Southeast and East Asia.',
        routes: 'INNSA1 / SGSIN / CNSHA',
    },
];

export const LANES = [
    { from: 'INNSA1 NHAVA SHEVA', to: 'AEJEA JEBEL ALI' },
    { from: 'INMUN1 MUNDRA', to: 'KEMBA MOMBASA' },
    { from: 'INNSA1 NHAVA SHEVA', to: 'NLRTM ROTTERDAM' },
    { from: 'SGSIN SINGAPORE', to: 'USHOU HOUSTON' },
];

export const PROCESS_STEPS = [
    { index: '01', title: 'Require', blurb: 'Tell us the product, specification, quantity and destination.' },
    { index: '02', title: 'Source', blurb: 'We map the requirement against our supplier network and market options.' },
    { index: '03', title: 'Verify', blurb: 'Supplier credentials, product quality and documentation are checked.' },
    { index: '04', title: 'Quote', blurb: 'You receive a clear, itemised offer with terms and timelines.' },
    { index: '05', title: 'Coordinate', blurb: 'We manage production schedules, inspection and freight.' },
    { index: '06', title: 'Deliver', blurb: 'Goods arrive at your port with complete documentation.' },
];

export const QUALITY_STEPS = [
    { index: 'Q/01', title: 'Supplier Verification', blurb: 'Facilities, trade references and production capability reviewed before onboarding.' },
    { index: 'Q/02', title: 'Product Inspection', blurb: 'Pre-shipment inspection against the agreed specification and sampling standard.' },
    { index: 'Q/03', title: 'Documentation', blurb: 'Contracts, invoices, packing lists and certificates of origin prepared and checked.' },
    { index: 'Q/04', title: 'Certifications', blurb: 'Product certifications arranged where the destination market requires them.' },
    { index: 'Q/05', title: 'Regulatory Compliance', blurb: 'Customs, duties and import regulations coordinated with clearing partners.' },
];

export const STORIES = [
    {
        id: 'commodity-markets',
        tag: 'MARKET INSIGHT',
        read: '8 MIN READ',
        title: 'Understanding Global Commodity Markets',
        excerpt: 'How harvest cycles, freight rates and currency movements shape the price of what lands at your port.',
        image: IMG.story1,
    },
    {
        id: 'trade-documents',
        tag: 'TRADE GUIDE',
        read: '6 MIN READ',
        title: 'Essential Documents for International Trade',
        excerpt: 'Bill of lading, certificate of origin, packing list — what each document does and why it matters.',
        image: IMG.story2,
    },
    {
        id: 'bulk-procurement',
        tag: 'SOURCING',
        read: '5 MIN READ',
        title: 'What Buyers Should Consider Before Bulk Procurement',
        excerpt: 'Specification discipline, supplier redundancy and inspection points that protect a large order.',
        image: IMG.story3,
    },
];

export const RESOURCES = [
    { id: 'company-profile', name: 'Company Profile', meta: 'PDF — 4.2 MB' },
    { id: 'product-catalogue', name: 'Product Catalogue', meta: 'PDF — 18.6 MB' },
    { id: 'specifications', name: 'Product Specifications', meta: 'PDF — 7.1 MB' },
    { id: 'certifications', name: 'Certifications & Compliance', meta: 'PDF — 2.8 MB' },
    { id: 'incoterms', name: 'Trade Guide — Incoterms', meta: 'PDF — 1.4 MB' },
    { id: 'faq', name: 'Frequently Asked Questions', meta: 'WEB' },
];

export const PARTNERSHIPS = [
    { id: 'buyers', title: 'Buyers', blurb: 'Source products for your market.' },
    { id: 'suppliers', title: 'Suppliers', blurb: 'Connect your products with international opportunities.' },
    { id: 'distributors', title: 'Distributors', blurb: 'Explore long-term commercial partnerships.' },
];
