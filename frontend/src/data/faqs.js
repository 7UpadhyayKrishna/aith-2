/**
 * Customer FAQ content for AITH.
 * Answers marked with [TBD] should be replaced when final commercial details are confirmed.
 */

export const FAQ_CATEGORIES = [
    {
        id: 'getting-started',
        label: 'Getting Started',
        items: [
            {
                id: 'what-is-aith',
                q: 'What does Asian International Trade House do?',
                a: 'AITH connects buyers and suppliers across international markets. We source products from Asia, coordinate import and export documentation, manage procurement programs, and move bulk commodities through verified supply chains — from requirement to delivery.',
            },
            {
                id: 'who-we-serve',
                q: 'Who do you work with?',
                a: 'We work with institutional and commercial buyers, manufacturers and exporters looking for international demand, and distributors building long-term supply partnerships across Middle East, Africa, Europe and North America.',
            },
            {
                id: 'how-to-start',
                q: 'How do I start a trade request?',
                a: 'Use Request a Quote on the site. Tell us the product or category, approximate volume, destination market, timing and your company details. Our team reviews the requirement and responds with next steps, clarification questions or a structured commercial path.',
            },
            {
                id: 'response-time',
                q: 'How quickly will you respond to my enquiry?',
                a: '[TBD — confirm SLA] We aim to acknowledge trade enquiries within one to two business days. Complex or multi-origin sourcing requests may take longer while we verify availability and compliance requirements.',
            },
            {
                id: 'imports-exports',
                q: 'Can you handle both imports and exports?',
                a: 'Yes. We support buyers importing into their markets and suppliers or manufacturers exporting from Asia. The same sourcing, documentation and logistics coordination applies whether goods move inbound to your destination or outbound from origin.',
            },
            {
                id: 'international-suppliers',
                q: 'Can AITH work with international suppliers?',
                a: 'Our core strength is Asian origin networks, but we also coordinate with international suppliers and cross-border supply chains when a buyer requirement calls for it. Share the product, specification and destination — we map viable options.',
            },
        ],
    },
    {
        id: 'products-sourcing',
        label: 'Products & Sourcing',
        items: [
            {
                id: 'categories',
                q: 'Which product categories do you cover?',
                a: 'Primary categories include Healthcare, Agriculture, Minerals, Chemicals and Textiles. If your requirement sits outside these chapters, still send it — we routinely evaluate custom sourcing briefs.',
            },
            {
                id: 'moq',
                q: 'What is your minimum order quantity (MOQ)?',
                a: '[TBD — confirm MOQ policy] MOQs vary by product, origin and shipping mode. Agricultural and mineral bulk often moves in container or vessel lots; specialty healthcare and chemical lines may support smaller trial volumes after supplier confirmation.',
            },
            {
                id: 'custom-source',
                q: 'Can you source a product that is not listed on the website?',
                a: 'Yes. Share the specification, preferred origin if any, volume and destination. We map supplier options, verify capability and compliance, then return a sourcing plan or quote path.',
            },
            {
                id: 'samples',
                q: 'Do you provide samples or product specifications?',
                a: 'Where suppliers allow, we coordinate samples, assays, certificates of analysis or technical data sheets before commercial commitment. Sample freight and handling terms are confirmed case by case.',
            },
            {
                id: 'moq-vary',
                q: 'Can MOQs differ by supplier or product?',
                a: 'Yes. Minimum order quantities are set by the supplier, product format and shipping mode — not by a single company-wide rule. Bulk commodities often move in container or vessel lots; manufactured or specialty lines may allow smaller trial volumes after supplier confirmation.',
            },
            {
                id: 'sourcing-duration',
                q: 'How long does sourcing take?',
                a: 'Simple, in-stock requirements may resolve in days once specification is clear. New supplier identification, sampling, compliance checks or multi-origin comparison typically take longer — often one to four weeks depending on category and documentation needs. We share a realistic timeline with each sourcing path.',
            },
            {
                id: 'packaging',
                q: 'Can AITH assist with packaging requirements?',
                a: 'Yes. We coordinate export-ready packaging, labelling, palletisation and destination-market labelling rules with suppliers. Retail-ready or private-label packaging is discussed against your specification and supplier capability.',
            },
            {
                id: 'private-label-oem',
                q: 'Can products be private-labelled or OEM sourced?',
                a: 'Where suppliers support it, we can explore private label, OEM or custom formulation paths. Share brand requirements, volumes, packaging artwork and regulatory expectations — feasibility depends on category, MOQ and supplier capacity.',
            },
        ],
    },
    {
        id: 'pricing-quotes',
        label: 'Pricing, Quotes & Incoterms',
        items: [
            {
                id: 'quote-process',
                q: 'How does the quoting process work?',
                a: 'After we receive your brief, we validate specification and volume, check supplier availability, align logistics and documentation, then issue commercial terms. Quotes depend on market pricing, freight and currency at the time of offer.',
            },
            {
                id: 'incoterms',
                q: 'Which Incoterms do you support?',
                a: '[TBD — confirm preferred Incoterms] Common structures include FOB, CFR, CIF and occasionally EXW or DAP depending on lane and buyer preference. We recommend the term that matches your risk appetite and destination capabilities.',
            },
            {
                id: 'price-validity',
                q: 'How long is a quote valid?',
                a: '[TBD] Commodity and freight markets move. Validity is stated on each offer — typically a short window for bulk commodities and a clearer window for manufactured goods with locked supplier pricing.',
            },
            {
                id: 'currency',
                q: 'In which currencies do you quote?',
                a: '[TBD] Most international offers are prepared in USD. Alternate currencies can be discussed for specific markets and banking corridors.',
            },
            {
                id: 'quote-info',
                q: 'What information is needed for an accurate quote?',
                a: 'At minimum: product name or specification, quantity and unit, destination country or port, target timeline and your company details. Helpful extras include preferred origin, Incoterm, quality or certification requirements, packaging needs and any reference pricing or samples.',
            },
            {
                id: 'quote-includes',
                q: 'What is included or excluded from a quote?',
                a: 'Each offer states what is covered — typically product cost, agreed Incoterm point, and sometimes freight or documentation. Unless explicitly included, quotes exclude import duties and taxes at destination, inland delivery beyond the Incoterm, inspection fees you nominate separately, banking charges and insurance unless arranged. We clarify inclusions on every commercial path.',
            },
        ],
    },
    {
        id: 'shipping-docs',
        label: 'Shipping, Timelines & Documentation',
        items: [
            {
                id: 'modes',
                q: 'Do you handle sea, air and land freight?',
                a: 'Yes. Sea freight is primary for bulk and container loads; air is used for urgent or high-value parcels; land and multimodal legs are coordinated with destination partners where required. Mode is chosen against cost, timeline and product constraints.',
            },
            {
                id: 'lead-times',
                q: 'What lead times should I expect?',
                a: 'Lead time depends on product readiness, inspection, vessel or flight availability and destination clearance. We share an estimated schedule with each commercial path and update you when milestones move.',
            },
            {
                id: 'documents',
                q: 'What trade documents do you prepare?',
                a: 'Typical export sets include commercial invoice, packing list, certificate of origin, and product-specific certificates (phytosanitary, inspection, certificate of analysis). For shipment evidence we coordinate bills of lading for sea freight and air waybills for air cargo. Exact documents follow destination import rules and product category.',
            },
            {
                id: 'shipping-documents',
                q: 'What are commercial invoices, packing lists and transport documents?',
                a: 'The commercial invoice states seller, buyer, goods description, value and terms for customs. The packing list details cartons, weights and marks. A bill of lading (sea) or air waybill (air) is the carrier document proving custody and enabling release at destination. Certificate of origin confirms where goods were produced — often required for preferential duty treatment.',
            },
            {
                id: 'shipment-duration',
                q: 'How long does an international shipment take?',
                a: 'Transit depends on mode and lane. Sea freight commonly runs two to six weeks port-to-port plus local clearance; air may be three to ten days door-to-airport. Production lead time, inspection holds and destination customs add to the total schedule — we estimate end-to-end timing with each offer.',
            },
            {
                id: 'air-vs-sea',
                q: 'Air freight vs sea freight — how is the mode selected?',
                a: 'We weigh cost, timeline, product shelf life, volume and destination infrastructure. Bulk and heavy cargo usually moves by sea; urgent, high-value or perishable lines may justify air. If you have a preference or deadline, state it in your enquiry — we recommend the mode that balances commercial and operational risk.',
            },
            {
                id: 'cargo-insurance',
                q: 'Can cargo insurance be arranged or coordinated?',
                a: 'Yes. Marine or air cargo insurance can be arranged or coordinated as part of the commercial path, typically aligned to the agreed Incoterm and insurable interest. Coverage scope and premium are confirmed before shipment.',
            },
            {
                id: 'shipment-updates',
                q: 'How are shipment updates communicated?',
                a: 'We share milestone updates at key points — booking confirmation, goods ready, export clearance, departure, arrival and delivery handoff where applicable. Frequency and channel follow the shipment size and your preference; [TBD — confirm standard update cadence and portal access].',
            },
            {
                id: 'customs',
                q: 'Do you handle customs clearance?',
                a: 'We coordinate origin export formalities and work with destination partners or your appointed broker for import clearance. Responsibility under the agreed Incoterm defines who owns each leg.',
            },
        ],
    },
    {
        id: 'quality-compliance',
        label: 'Quality & Compliance',
        items: [
            {
                id: 'quality-process',
                q: 'How do you ensure product quality?',
                a: 'Quality is a process: supplier verification, product inspection, documentation checks, certifications and regulatory compliance. Shipments move through the same sequence regardless of size or destination.',
            },
            {
                id: 'third-party-inspection',
                q: 'Can we nominate a third-party inspection agency?',
                a: 'Yes. Buyers may nominate an inspection body, or we can propose recognised agencies at origin. Inspection scope and hold points are agreed before loading.',
            },
            {
                id: 'certifications',
                q: 'Which certifications can you support?',
                a: 'Depending on category: ISO and GMP-related documentation for healthcare inputs, food safety and origin certificates for agriculture, assay reports for minerals, SDS and handling docs for chemicals, and textile test reports where applicable.',
            },
            {
                id: 'product-certificates',
                q: 'Can you provide product-specific certificates?',
                a: 'Yes, where the product and destination require them — for example phytosanitary certificates for agriculture, certificates of analysis for chemicals and minerals, health or registration documents for healthcare inputs, and textile test reports. Scope is confirmed against your market rules before loading.',
            },
            {
                id: 'spec-mismatch',
                q: 'What happens if goods do not match agreed specifications?',
                a: 'Specifications are agreed before production or loading and verified through documentation and inspection where applicable. If goods deviate, we work through the contractual remedy — rework, replacement, credit or claim — according to the commercial terms and evidence from inspection or destination receipt.',
            },
        ],
    },
    {
        id: 'payments-partners',
        label: 'Payments & Partnership',
        items: [
            {
                id: 'payment-terms',
                q: 'What payment terms do you offer?',
                a: '[TBD — confirm banking terms] Terms depend on relationship stage, order size and destination risk. Options may include advance, letter of credit or other structured settlement after credit assessment.',
            },
            {
                id: 'become-supplier',
                q: 'How can my company become a supplier partner?',
                a: 'Use Partner on the site or Contact us with your product range, capacity, certifications and export experience. We review fit against active buyer demand and onboarding standards.',
            },
            {
                id: 'long-term',
                q: 'Do you support recurring procurement programs?',
                a: 'Yes. For distributors and industrial buyers with repeating demand, we build structured procurement calendars, dual-sourcing where needed, and clearer forecast-based planning.',
            },
            {
                id: 'commercial-confidentiality',
                q: 'How is commercial information handled?',
                a: 'Trade enquiries, pricing, supplier identities and buyer requirements are treated as confidential commercial information shared only on a need-to-know basis to execute the transaction. Formal NDAs can be discussed for sensitive sourcing programs. [TBD — confirm data retention and privacy policy references].',
            },
        ],
    },
    {
        id: 'markets',
        label: 'Markets & Destinations',
        items: [
            {
                id: 'regions',
                q: 'Which markets do you serve?',
                a: 'Primary demand regions are Middle East, Africa, Europe and North America, sourced from Asian origin networks. Specific ports and lanes are planned per shipment.',
            },
            {
                id: 'restricted',
                q: 'Are there products or destinations you cannot serve?',
                a: 'We follow applicable trade compliance, sanctions and destination import rules. If a request cannot proceed, we say so early and explain the constraint.',
            },
            {
                id: 'delhi-hub',
                q: 'Where is AITH based?',
                a: 'Our head office is at No. 901, Devika Tower, Nehru Place, New Delhi — 110019 (28°36\'N 77°13\'E), with a corporate office in Chennai and international branches in Dubai, Singapore, Jakarta and Thimphu. [TBD — visiting hours]',
            },
        ],
    },
];

export const allFaqItems = () => FAQ_CATEGORIES.flatMap((c) => c.items);

export const FAQ_BY_CONTEXT = {
    home: ['what-is-aith', 'how-to-start', 'categories', 'imports-exports', 'modes', 'quality-process', 'quote-process', 'quote-info', 'regions'],
    services: ['what-is-aith', 'modes', 'air-vs-sea', 'documents', 'customs', 'lead-times', 'shipment-duration', 'incoterms', 'quote-process'],
    products: ['categories', 'moq', 'moq-vary', 'custom-source', 'samples', 'private-label-oem', 'quality-process', 'certifications'],
    contact: ['how-to-start', 'response-time', 'delhi-hub', 'become-supplier', 'payment-terms', 'commercial-confidentiality'],
    partner: ['become-supplier', 'who-we-serve', 'categories', 'quality-process', 'long-term', 'custom-source'],
    quality: ['quality-process', 'third-party-inspection', 'certifications', 'documents', 'customs', 'spec-mismatch'],
};

export function getFaqsByIds(ids) {
    const map = Object.fromEntries(allFaqItems().map((item) => [item.id, item]));
    return ids.map((id) => map[id]).filter(Boolean);
}
