const u = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const IMG = {
    hero: u('photo-1494412574643-ff11b0a5c1c3', 1600),
    approach: u('photo-1771904866827-8850e545f415', 1400),
    approachOverlap: u('photo-1586201375761-83865001e31c', 800),
    vessel: u('photo-1763257708531-363d5ca39c22', 1400),
    warehouse: u('photo-1553413077-190dd305871c', 1200),
    cranes: u('photo-1519003722824-194d4455a60c', 1200),
    field: u('photo-1500382017468-9049fed747ef', 1400),
    story1: u('photo-1578575437130-527eed3abbec', 1000),
    story2: u('photo-1780245882836-5a0501dc93d7', 1000),
    story3: u('photo-1759411364609-aeb30eb034e4', 1000),
};

export const CATEGORIES = [
    {
        id: 'healthcare',
        index: '01',
        name: 'Healthcare',
        tone: '#A9B4BA',
        toneName: 'MINERAL BLUE-GREY',
        blurb: 'Medical devices, consumables and pharmaceutical inputs sourced from audited manufacturers.',
        image: u('photo-1584308666744-24d5c474f2ae', 1000),
        products: ['Surgical Instruments', 'Medical Consumables', 'Pharmaceutical Ingredients', 'Diagnostic Equipment', 'Hospital Supplies', 'Protective Equipment'],
    },
    {
        id: 'agriculture',
        index: '02',
        name: 'Agriculture',
        tone: '#C98262',
        toneName: 'TERRACOTTA / SAGE',
        blurb: 'Food grains, spices and produce moving from Asian farms to international markets.',
        image: u('photo-1563514227147-6d2ff665a6a0', 1000),
        products: ['Rice', 'Wheat', 'Pulses', 'Spices', 'Fresh Produce', 'Dry Fruits'],
    },
    {
        id: 'minerals',
        index: '03',
        name: 'Minerals',
        tone: '#B9B2A4',
        toneName: 'DUSTED STONE',
        blurb: 'Industrial minerals and raw materials with assay-backed quality documentation.',
        image: u('photo-1504917595217-d4dc5ebe6122', 1000),
        products: ['Iron Ore', 'Coal & Coke', 'Limestone', 'Bauxite', 'Industrial Salt', 'Quartz', 'Rare Earth Elements'],
    },
    {
        id: 'chemicals',
        index: '04',
        name: 'Chemicals',
        tone: '#29372E',
        toneName: 'DEEP OLIVE / PALE SAND',
        blurb: 'Industrial and specialty chemicals handled with controlled, compliant logistics.',
        image: u('photo-1516937941344-00b4e0337589', 1000),
        products: ['Industrial Solvents', 'Specialty Chemicals', 'Fertilizers', 'Polymers', 'Dyes & Pigments', 'Industrial Acids'],
    },
    {
        id: 'textiles',
        index: '05',
        name: 'Textiles',
        tone: '#B7AEB6',
        toneName: 'LAVENDER-GREY / WARM BONE',
        blurb: 'Yarns, fabrics and finished goods from established weaving and garment clusters.',
        image: u('photo-1542272604-787c3835535d', 1000),
        products: ['Cotton Yarn', 'Woven Fabrics', 'Technical Textiles', 'Home Textiles', 'Garments', 'Denim'],
    },
];

export const SHOWCASE_PRODUCTS = [
    { name: 'Rice', image: u('photo-1586201375761-83865001e31c', 1200) },
    { name: 'Wheat', image: u('photo-1574323347407-f5e1ad6d020b', 1200) },
    { name: 'Pulses', image: u('photo-1610725664285-7c57e6eeac3f', 1200) },
    { name: 'Spices', image: u('photo-1596040033229-a9821ebd058d', 1200) },
    { name: 'Fresh Produce', image: u('photo-1464226184884-fa280b87c399', 1200) },
    { name: 'Dry Fruits', image: u('photo-1447933601403-0c6688de566e', 1200) },
];

export const CAPABILITIES = [
    {
        index: '01',
        title: 'Global Sourcing',
        blurb: 'We identify, evaluate and onboard suppliers across Asia matched to your specification, volume and compliance requirements.',
        image: u('photo-1494412651409-8963ce7935a7', 900),
    },
    {
        index: '02',
        title: 'Import & Export',
        blurb: 'End-to-end movement of goods across borders — documentation, customs coordination and trade compliance handled.',
        image: u('photo-1605745341112-85968b19335b', 900),
    },
    {
        index: '03',
        title: 'International Procurement',
        blurb: 'Structured procurement programs for institutions, distributors and industrial buyers with recurring requirements.',
        image: u('photo-1504328345606-18bbc8c9d7d1', 900),
    },
    {
        index: '04',
        title: 'Bulk Trading',
        blurb: 'Container-load and vessel-scale commodity trading with negotiated terms, inspection and secure settlement.',
        image: u('photo-1574323347407-f5e1ad6d020b', 900),
    },
    {
        index: '05',
        title: 'Supply Chain',
        blurb: 'Coordination from origin warehouse to destination port — freight, warehousing partners and delivery scheduling.',
        image: u('photo-1760998805232-4c8632d71cc3', 900),
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

export const PORTS = [
    { code: 'INNSA1', name: 'Nhava Sheva', lon: 72.94, lat: 18.95 },
    { code: 'INMUN1', name: 'Mundra', lon: 69.72, lat: 22.74, anchor: 'end' },
    { code: 'SGSIN', name: 'Singapore', lon: 103.82, lat: 1.26 },
    { code: 'AEJEA', name: 'Jebel Ali', lon: 55.06, lat: 25.01 },
    { code: 'NLRTM', name: 'Rotterdam', lon: 4.14, lat: 51.95 },
    { code: 'USHOU', name: 'Houston', lon: -95.36, lat: 29.76 },
    { code: 'KEMBA', name: 'Mombasa', lon: 39.66, lat: -4.05 },
];

export const ARTICLES = {
    'commodity-markets': {
        id: 'commodity-markets',
        tag: 'MARKET INSIGHT',
        read: '8 MIN READ',
        date: 'MAR 2026',
        title: 'Understanding Global Commodity Markets',
        image: '/STORY1',
        blocks: [
            { t: 'p', text: 'Commodity prices are often described as numbers on a screen. In practice, every price quoted for rice, cotton or iron ore is the visible tip of a long chain of physical events — a monsoon over the Gangetic plain, a queue of vessels at a canal, a freight rate negotiated in Singapore the previous week.' },
            { t: 'p', text: 'Buyers who understand that chain make better decisions. Buyers who only watch the screen tend to arrive late.' },
            { t: 'h', text: 'The Harvest Sets the Rhythm' },
            { t: 'p', text: 'Agricultural commodities move on biological time, not financial time. Wheat, rice and pulses enter the market in waves that follow planting and harvest calendars, and the weeks around a harvest are when supply is deepest and negotiation is most constructive.' },
            { t: 'p', text: 'The practical implication is simple: the best moment to discuss a contract is usually before the harvest, not after it. Once the crop is in the warehouse, the easy margin is gone.' },
            { t: 'h', text: 'Freight Is a Second Price' },
            { t: 'p', text: 'The cost of moving a container of textiles or a vessel of grain can swing as sharply as the commodity itself. A quoted price that ignores freight is only half a price. Serious offers are always discussed as landed numbers — commodity, freight, insurance and port costs together.' },
            { t: 'quote', text: 'A landed price is never one number. It is the commodity, the freight, the currency and the calendar — negotiated together.' },
            { t: 'h', text: 'Currency and Timing' },
            { t: 'p', text: 'Most Asian commodity trade is settled in US dollars, which means a buyer in Nairobi or Rotterdam carries two exposures: the price of the goods and the price of the currency. A two percent currency move can erase a well-negotiated discount, so payment terms and timing deserve the same attention as the headline price.' },
            { t: 'p', text: 'None of this is reason for caution — it is reason for structure. Markets reward buyers who specify clearly, commit at the right point in the cycle and work with partners who watch the whole chain rather than one number.' },
        ],
    },
    'trade-documents': {
        id: 'trade-documents',
        tag: 'TRADE GUIDE',
        read: '6 MIN READ',
        date: 'FEB 2026',
        title: 'Essential Documents for International Trade',
        image: '/STORY2',
        blocks: [
            { t: 'p', text: 'Every international shipment travels twice — once physically, across water and rail, and once on paper, through banks, customs desks and port authorities. The paper journey is usually where delays happen, and almost always for avoidable reasons.' },
            { t: 'h', text: 'The Bill of Lading' },
            { t: 'p', text: 'The bill of lading is the single most important document in sea freight. It is a receipt from the carrier, evidence of the contract of carriage, and a document of title — whoever holds the original can claim the goods. Errors in consignee names or cargo descriptions on a bill of lading can hold a container at port for weeks.' },
            { t: 'h', text: 'Commercial Invoice and Packing List' },
            { t: 'p', text: 'The commercial invoice declares what is being sold, to whom, at what value and under which Incoterms. Customs authorities use it to assess duties. The packing list complements it with the physical detail: carton counts, weights, dimensions. The two must agree with each other exactly — a mismatch between invoice and packing list is one of the most common triggers for inspection.' },
            { t: 'h', text: 'Certificate of Origin' },
            { t: 'p', text: 'Many trade agreements reduce or remove duties for goods originating in specific countries — but only if the origin is certified. A certificate of origin, issued by an authorised chamber of commerce, is the document that turns a tariff preference into actual savings.' },
            { t: 'h', text: 'Inspection and Insurance' },
            { t: 'p', text: 'Pre-shipment inspection certificates confirm the goods match the agreed specification before the vessel sails. Insurance certificates confirm the cargo is covered while it moves. Both are cheap compared to the problems they prevent.' },
            { t: 'quote', text: 'Most delays at customs are not about the goods. They are about the documents.' },
            { t: 'p', text: 'A trading house coordinates this paper trail as a single sequence — drafted early, checked against the contract, and aligned with the destination market before anything leaves the origin port.' },
        ],
    },
    'bulk-procurement': {
        id: 'bulk-procurement',
        tag: 'SOURCING',
        read: '5 MIN READ',
        date: 'JAN 2026',
        title: 'What Buyers Should Consider Before Bulk Procurement',
        image: '/STORY3',
        blocks: [
            { t: 'p', text: 'A single container is forgiving. A hundred containers are not. Bulk procurement magnifies everything — the savings when it goes well, and the losses when a specification slips or a supplier underdelivers. A few disciplines separate the two outcomes.' },
            { t: 'h', text: 'Specification Before Price' },
            { t: 'p', text: 'The most expensive sentence in bulk trade is "we assumed it was the same grade." Broken percentage in rice, moisture content in grain, micron count in fibre — these details decide the real value of a shipment. Write the specification first, attach it to the contract, and let every quote compete against the same document.' },
            { t: 'h', text: 'Supplier Redundancy' },
            { t: 'p', text: 'One supplier is a dependency, not a supply chain. Weather, export policy and plant maintenance all interrupt production without warning. Qualifying a second origin — even if it never ships — changes the negotiating position and protects the program.' },
            { t: 'h', text: 'Inspection Points' },
            { t: 'p', text: 'Inspection is cheapest at the origin and most expensive at the destination. Agree sampling standards and inspection points before production starts: at the mill, at stuffing, at loading. A discrepancy found at the origin port is a conversation. The same discrepancy found at destination is a claim.' },
            { t: 'quote', text: 'In bulk trade, the cheapest quote is often the most expensive order.' },
            { t: 'h', text: 'Terms and Timeline' },
            { t: 'p', text: 'Finally, treat payment terms and delivery windows as part of the price. A supplier quoting three percent lower with sixty-day open credit may cost more than a slightly higher quote with terms that match the buyer’s cash cycle. Line the terms up next to the price before deciding.' },
            { t: 'p', text: 'Bulk procurement rewards preparation. The buyers who win are rarely the ones who negotiate hardest — they are the ones who specify earliest.' },
        ],
    },
};
