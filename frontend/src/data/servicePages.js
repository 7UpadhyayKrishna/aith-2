/**
 * Long-form service page content keyed by URL slug.
 * Freight language uses "coordination" only - no forwarder/broker claims.
 */

export const SERVICE_PAGES = {
    'global-sourcing-services': {
        slug: 'global-sourcing-services',
        path: '/global-sourcing-services',
        kicker: 'AITH / Global Sourcing',
        titleLines: ['GLOBAL SOURCING,', 'BUILT AROUND', 'THE REQUIREMENT.'],
        italicLast: true,
        lead:
            'We start from what you need to buy - specification, volume, destination and timing - then map origin options, evaluate suppliers and coordinate samples before commercial commitment.',
        heroImageKey: 'cranes',
        overview: [
            'Global sourcing only works when the brief is clear. Vague product names create vague offers. We push for grade, packing, compliance needs and destination rules early so supplier conversations stay commercial, not exploratory theatre.',
            'From India and wider Asia, we identify manufacturers and exporters who can actually produce to the brief, then compare landed economics - not just unit price. Samples, inspection points and documentation are part of the path, not an afterthought.',
            'Once a source is selected, we stay on the file through order confirmation, production windows and export readiness so the requirement does not drift between desk and dock.',
        ],
        sections: [
            {
                index: '01',
                title: 'Requirement definition',
                body: [
                    'We capture product identity, technical or commercial grade, quantity bands, target Incoterm, destination country or port, and any hard constraints - shelf life, labelling language, restricted ingredients, assay ranges.',
                    'If the brief is incomplete, we return clarification questions before contacting suppliers. A clean brief shortens quote cycles and reduces rework later.',
                ],
            },
            {
                index: '02',
                title: 'Market mapping',
                body: [
                    'Against the brief we map viable origin clusters and typical commercial patterns for that category - harvest windows for agri, production lead times for manufactured lines, common packing formats for bulk.',
                    'Market mapping is practical: which origins can meet the spec at the volume you need, and what documentation those lanes usually require.',
                ],
            },
            {
                index: '03',
                title: 'Supplier discovery',
                body: [
                    'We identify candidate manufacturers and exporters with relevant product range and export experience. Discovery is driven by capability fit, not a published network size.',
                    'Where your brief names a preferred origin or excludes others, we respect that constraint and document why alternatives were or were not pursued.',
                ],
            },
            {
                index: '04',
                title: 'Evaluation',
                body: [
                    'Candidates are reviewed for production capacity signals, export documentation readiness, quality process, and willingness to support samples or third-party inspection.',
                    'Evaluation is not a checklist theatre. Weak or mismatched suppliers are dropped early rather than carried through to a confusing multi-offer spreadsheet.',
                ],
            },
            {
                index: '05',
                title: 'Commercial comparison',
                body: [
                    'Offers are compared on the same basis - unit of measure, packing, Incoterm point, validity, lead time and known extras. Apples-to-apples comparison beats the cheapest headline number.',
                    'Currency, freight assumptions and inspection costs are called out when they materially change the landed picture.',
                ],
            },
            {
                index: '06',
                title: 'Samples and verification',
                body: [
                    'Where suppliers allow, we coordinate samples, assays, certificates of analysis or technical data sheets before you commit. Sample freight and handling terms are confirmed case by case.',
                    'Verification may include nominated third-party inspection at origin. Hold points are agreed before production or loading, not after goods are already at sea.',
                ],
            },
            {
                index: '07',
                title: 'Documentation alignment',
                body: [
                    'Destination import rules drive the document set. We align commercial invoice detail, packing list structure, origin certificates and product-specific certificates with what the market expects.',
                    'Documentation work starts before stuffing - so marks, HS descriptions and certificate names are not improvised on the quay.',
                ],
            },
            {
                index: '08',
                title: 'Order coordination',
                body: [
                    'After commercial agreement we coordinate production schedules, packing readiness, inspection windows and export formalities with the supplier and freight partners as required by the Incoterm.',
                    'You receive milestone updates at key points. Changes to quantity, packing or ship dates are confirmed in writing before they move the schedule.',
                ],
            },
        ],
        related: [
            { label: 'Supplier Sourcing', to: '/supplier-sourcing' },
            { label: 'International Procurement', to: '/international-procurement' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'what-is-aith',
            'how-to-start',
            'custom-source',
            'samples',
            'sourcing-duration',
            'quote-process',
            'quote-info',
            'quality-process',
            'categories',
        ],
        ctaLabel: 'Start a sourcing brief',
    },

    'import-export-services': {
        slug: 'import-export-services',
        path: '/import-export-services',
        kicker: 'AITH / Import & Export',
        titleLines: ['IMPORT.', 'EXPORT.', 'COORDINATED.'],
        italicLast: true,
        lead:
            'Cross-border movement needs more than a booking. We coordinate sourcing, commercial terms, documentation, quality checks and freight so inbound and outbound shipments stay bankable.',
        heroImageKey: 'vessel',
        overview: [
            'Import support helps buyers bring Asian-origin goods into their markets with clear specification, Incoterms and destination document readiness. Export support helps origin suppliers and programmes move goods out with complete commercial and shipping paperwork.',
            'We do not claim to act as a licensed customs broker or freight forwarder. Origin export formalities and destination clearance are coordinated with the parties named under your Incoterm - including your appointed broker where you nominate one.',
            'The same discipline applies whether the lane is a single trial container or a recurring programme: match the commercial path to the product, then keep documents and milestones aligned until handoff.',
        ],
        sections: [
            {
                index: '01',
                title: 'Import support',
                body: [
                    'For buyers importing into Middle East, Africa, Europe, North America or other destinations, we structure the origin side - product, packing, inspection and export documents - against your market rules.',
                    'Import duties, local taxes and inland delivery beyond the agreed Incoterm remain with the responsible party under those terms. We flag known destination requirements early so they are not discovered at the gate.',
                ],
            },
            {
                index: '02',
                title: 'Export support',
                body: [
                    'Outbound programmes from India and Asia need supplier readiness, packing for the mode, and a document set that matches the letter of credit or buyer instruction where applicable.',
                    'We coordinate commercial invoices, packing lists, origin certificates and transport documents with the shipment timeline so presentation packages are not assembled after departure.',
                ],
            },
            {
                index: '03',
                title: 'Sourcing within the trade',
                body: [
                    'When the product is not yet locked, import-export work includes sourcing - finding a capable origin and verifying it before freight is discussed.',
                    'Sourcing and logistics are sequenced deliberately: wrong source cannot be fixed by a faster vessel.',
                ],
            },
            {
                index: '04',
                title: 'Commercial coordination',
                body: [
                    'Price, Incoterm, payment structure and validity windows are confirmed before production or booking. Mid-stream changes are documented so both sides share the same file.',
                    'We state what a quote includes and excludes - product, freight assumptions, inspection - so landed cost surprises stay rare.',
                ],
            },
            {
                index: '05',
                title: 'Documentation',
                body: [
                    'Typical sets include commercial invoice, packing list, certificate of origin and product-specific certificates (phytosanitary, inspection, analysis). Sea shipments use bills of lading; air uses air waybills.',
                    'Exact documents follow destination rules and category. We are not a legal or customs authority - we coordinate accurate, complete sets against the commercial path.',
                ],
            },
            {
                index: '06',
                title: 'Quality before departure',
                body: [
                    'Pre-shipment inspection, sampling standards and certificate checks sit before loading wherever the programme requires them.',
                    'If goods fail inspection, the remedy follows the agreed commercial terms - rework, replacement or hold - rather than shipping and arguing later.',
                ],
            },
            {
                index: '07',
                title: 'Freight coordination',
                body: [
                    'Mode selection balances cost, timeline, volume and product constraints. Sea for bulk and containers; air for urgency or high-value parcels; multimodal when inland legs require it.',
                    'We coordinate bookings and milestones with logistics partners. We do not operate as a freight forwarder or shipping line.',
                ],
            },
            {
                index: '08',
                title: 'Markets and lanes',
                body: [
                    'Primary demand regions include Middle East, Africa, Europe and North America, planned per shipment against origin ports and destination infrastructure.',
                    'Restricted products or sanctioned destinations are declined early. Compliance constraints are explained, not buried in fine print after work has started.',
                ],
            },
        ],
        related: [
            { label: 'Trade Documentation', to: '/trade-documentation' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'Markets', to: '/markets' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'imports-exports',
            'how-to-start',
            'documents',
            'shipping-documents',
            'customs',
            'modes',
            'air-vs-sea',
            'incoterms',
            'lead-times',
            'regions',
        ],
        ctaLabel: 'Discuss an import or export',
    },

    'international-procurement': {
        slug: 'international-procurement',
        path: '/international-procurement',
        kicker: 'AITH / Procurement',
        titleLines: ['PROCUREMENT', 'WITH A PLAN.'],
        italicLast: true,
        lead:
            'Institutional and commercial buyers with repeating demand need more than one-off quotes. We build structured procurement paths - specification lock, supplier options, quality gates and shipment rhythm.',
        heroImageKey: 'warehouse',
        overview: [
            'International procurement fails when each order reinvents the brief. We treat recurring requirements as programmes: locked specifications, dual-sourcing where risk justifies it, and calendars that respect production and vessel realities.',
            'Distributors, industrial buyers and institutional purchasers use this path when volume, compliance or multi-SKU complexity exceeds a casual RFQ.',
            'Every cycle still starts with a clear requirement. The difference is that lessons from the first shipment feed the second - packing tweaks, document templates and supplier performance notes stay on file.',
        ],
        sections: [
            {
                index: '01',
                title: 'Requirement and forecast',
                body: [
                    'We capture SKUs or commodity grades, annual or seasonal volume bands, destination warehouses or ports, and any service-level expectations on lead time.',
                    'Forecasts are treated as planning tools, not binding contracts, until commercial terms say otherwise. Still, a realistic band beats a silent “as needed”.',
                ],
            },
            {
                index: '02',
                title: 'Supplier search',
                body: [
                    'Search focuses on producers who can sustain the volume and documentation load over multiple cycles, not only win a first trial lot.',
                    'Capacity signals, export history and quality process matter more than a single aggressive sample price.',
                ],
            },
            {
                index: '03',
                title: 'Comparison',
                body: [
                    'Shortlisted options are compared on total commercial fit - price structure, MOQ, lead time, inspection willingness and document readiness.',
                    'Where two suppliers both clear the bar, dual-sourcing can reduce concentration risk for critical lines.',
                ],
            },
            {
                index: '04',
                title: 'Specification lock',
                body: [
                    'Grade, packing, labelling and acceptance criteria are written down and shared with origin before production. Verbal “same as last time” is not a control.',
                    'Changes to specification mid-programme are versioned so older lots and new lots are not confused in claims.',
                ],
            },
            {
                index: '05',
                title: 'Order planning',
                body: [
                    'Orders are sequenced against production slots, inspection windows and intended sailings or flights. Bunching everything into one late booking creates avoidable demurrage and air premiums.',
                    'Call-off or batch ordering can be structured when the commercial relationship supports it.',
                ],
            },
            {
                index: '06',
                title: 'Quality gates',
                body: [
                    'Inspection scope, sampling plans and certificate requirements sit in the programme terms. Buyers may nominate their preferred inspection body.',
                    'Failed lots stop at origin when possible. Destination disputes are harder and more expensive than a hold at stuffing.',
                ],
            },
            {
                index: '07',
                title: 'Documentation templates',
                body: [
                    'Repeating document formats - invoice layouts, packing list marks, certificate names - are stabilised after the first successful clearance.',
                    'Template discipline reduces customs queries and LC discrepancies on later shipments.',
                ],
            },
            {
                index: '08',
                title: 'Shipment rhythm',
                body: [
                    'Freight mode and booking windows follow the programme calendar. Milestone updates keep your operations team aligned with origin reality.',
                    'We coordinate; carriers and local partners execute their legs under the Incoterm.',
                ],
            },
            {
                index: '09',
                title: 'Repeat procurement',
                body: [
                    'After each cycle we note what worked - supplier reliability, packing damage rates, document friction - and adjust the next order plan.',
                    'Long-term programmes are where this discipline pays: fewer surprises, clearer landed costs, and a file both sides can trust.',
                ],
            },
        ],
        related: [
            { label: 'Global Sourcing', to: '/global-sourcing-services' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Industries', to: '/industries' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'long-term',
            'how-to-start',
            'quote-process',
            'moq',
            'moq-vary',
            'quality-process',
            'third-party-inspection',
            'lead-times',
            'incoterms',
        ],
        ctaLabel: 'Plan a procurement programme',
    },

    'supplier-sourcing': {
        slug: 'supplier-sourcing',
        path: '/supplier-sourcing',
        kicker: 'AITH / Supplier Sourcing',
        titleLines: ['FIND THE', 'RIGHT ORIGIN.'],
        italicLast: true,
        lead:
            'Foreign buyers looking for Indian and Asian manufacturers need more than a directory listing. We identify candidates, evaluate export readiness and compare commercial offers against your brief.',
        heroImageKey: 'approach',
        overview: [
            'Supplier sourcing is for buyers who know what they need but not yet who should make it. We work from your specification and volume, then search origin clusters that actually produce that category.',
            'We do not advertise a fixed supplier count or “exclusive network size.” Fit is demonstrated per brief - capacity, quality process, documentation and willingness to export on your terms.',
            'Indian manufacturers seeking international demand should use our Partner path. This page is written primarily for inbound buyer requirements seeking origin.',
        ],
        sections: [
            {
                index: '01',
                title: 'Brief intake',
                body: [
                    'Share product, technical or commercial grade, target volumes, destination market, packaging expectations and any must-have certifications or test reports.',
                    'Preferred states or clusters in India can be noted; so can exclusions. Constraints save everyone’s time.',
                ],
            },
            {
                index: '02',
                title: 'Finding manufacturers',
                body: [
                    'We identify manufacturers and exporters whose product range and production profile match the brief - spinning mills, garment units, chemical producers, agri processors, mineral traders and others as relevant.',
                    'Candidates without export documentation discipline are filtered early, even if domestic pricing looks attractive.',
                ],
            },
            {
                index: '03',
                title: 'Capability evaluation',
                body: [
                    'Evaluation covers production capability signals, typical MOQs, lead times, quality controls and experience with destination-market paperwork.',
                    'Site visits or third-party audits can be arranged where the order size and risk justify them; scope is agreed before cost is incurred.',
                ],
            },
            {
                index: '04',
                title: 'Commercial comparison',
                body: [
                    'Shortlisted suppliers quote on a common basis so you can compare fairly. We highlight differences in packing, payment expectations and inspection support.',
                    'The goal is a defensible choice, not the longest list of names.',
                ],
            },
            {
                index: '05',
                title: 'Samples and trials',
                body: [
                    'Trial lots and samples, where available, let you validate quality before scaling. Terms for sample cost and freight are confirmed upfront.',
                    'Feedback from trials feeds the final supplier selection and any specification tweaks.',
                ],
            },
            {
                index: '06',
                title: 'Onboarding to order',
                body: [
                    'Once selected, the supplier is onboarded into the commercial path - contacts, document templates, inspection points and first-order schedule.',
                    'Ongoing performance is watched through the first shipments; underperformance triggers a structured review, not silence.',
                ],
            },
            {
                index: '07',
                title: 'For suppliers applying in',
                body: [
                    'If you are an Indian or Asian manufacturer seeking buyers, use Partner. Provide product range, capacity, certifications and export experience.',
                    'We review fit against active demand. Not every application becomes an active file - honesty beats inflated onboarding.',
                ],
            },
        ],
        related: [
            { label: 'Global Sourcing', to: '/global-sourcing-services' },
            { label: 'Partner', to: '/partner' },
            { label: 'Products', to: '/products' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'custom-source',
            'samples',
            'categories',
            'become-supplier',
            'who-we-serve',
            'quality-process',
            'sourcing-duration',
            'quote-info',
            'international-suppliers',
        ],
        ctaLabel: 'Request supplier options',
    },

    'trade-documentation': {
        slug: 'trade-documentation',
        path: '/trade-documentation',
        kicker: 'AITH / Documentation',
        titleLines: ['DOCUMENTS', 'THAT CLEAR.'],
        italicLast: true,
        lead:
            'Trade documents are operational tools, not paperwork theatre. Here is what the core set does - and how we coordinate accurate export packages against destination rules.',
        heroImageKey: 'warehouse',
        overview: [
            'A complete document set lets banks, carriers and destination customs understand what moved, at what value, in what packing, and under which terms. Missing or inconsistent documents create holds, discrepancies and demurrage.',
            'This page is educational. We coordinate commercial and shipping documents for transactions we handle. We are not a legal advisor, customs authority or licensed customs broker. Destination clearance remains with the party responsible under the Incoterm or your appointed broker.',
            'Exact requirements vary by product and market. Phytosanitary certificates, certificates of analysis, textile test reports and healthcare-related paperwork appear only where the category and destination demand them.',
        ],
        sections: [
            {
                index: '01',
                title: 'Commercial invoice',
                body: [
                    'The commercial invoice states seller, buyer, goods description, quantities, values, currency and Incoterms. Customs and banks rely on it for valuation and compliance checks.',
                    'Descriptions should match the goods and align with packing lists and certificates. Vague or inflated descriptions create problems; under-declaration creates larger ones.',
                ],
            },
            {
                index: '02',
                title: 'Packing list',
                body: [
                    'The packing list details packages, net and gross weights, dimensions where required, and shipping marks. It helps destination receiving and customs physical checks.',
                    'Marks on cartons or bags should match the list. Mixed SKUs need clear separation so counts reconcile.',
                ],
            },
            {
                index: '03',
                title: 'Certificate of origin (CoO)',
                body: [
                    'A certificate of origin states where goods were produced. Preferential duty treatment under trade agreements often depends on a correctly issued CoO.',
                    'Issuing bodies and formats differ by country and scheme. We coordinate the correct type for the lane - not a generic placeholder.',
                ],
            },
            {
                index: '04',
                title: 'Bill of lading (B/L)',
                body: [
                    'For sea freight, the bill of lading is the carrier’s transport document. It evidences receipt of goods, sets out carriage terms and is often required to release cargo at destination.',
                    'Original vs express release, consignee naming and notify party details must match the commercial and banking instructions. Errors here delay release even when goods have arrived.',
                ],
            },
            {
                index: '05',
                title: 'Air waybill (AWB)',
                body: [
                    'For air cargo, the air waybill is the carrier document. It is typically non-negotiable compared with traditional ocean B/Ls, but accuracy of shipper, consignee and cargo description still matters.',
                    'Urgent healthcare or high-value parcels often move on AWB - document timing must match flight cut-offs.',
                ],
            },
            {
                index: '06',
                title: 'Product-specific certificates',
                body: [
                    'Agriculture may need phytosanitary certificates. Minerals and chemicals often need certificates of analysis or assay reports. Textiles may need test reports. Healthcare inputs may need health or registration documents where the destination requires them.',
                    'We confirm the certificate list against your market before loading. Inventing certificates after stuffing is not a strategy.',
                ],
            },
            {
                index: '07',
                title: 'How we coordinate the set',
                body: [
                    'Document drafts are aligned with supplier data before goods leave origin. Finals are checked for consistency across invoice, packing list, CoO and transport document.',
                    'Where letters of credit apply, presentation requirements drive the checklist. Discrepancies are cheaper to fix before sailing than at the negotiating bank.',
                ],
            },
        ],
        related: [
            { label: 'Import & Export', to: '/import-export-services' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'Insights', to: '/insights' },
            { label: 'FAQ', to: '/faq' },
        ],
        faqIds: [
            'documents',
            'shipping-documents',
            'customs',
            'product-certificates',
            'certifications',
            'incoterms',
            'quote-includes',
            'shipment-updates',
        ],
        ctaLabel: 'Ask about your document set',
    },

    'freight-coordination': {
        slug: 'freight-coordination',
        path: '/freight-coordination',
        kicker: 'AITH / Freight Coordination',
        titleLines: ['FREIGHT,', 'COORDINATED.'],
        italicLast: true,
        lead:
            'Mode, timing and Incoterm decide how cargo moves. We coordinate air, sea and multimodal legs with logistics partners - booking support, milestones and handoff - without claiming to be a freight forwarder or shipping line.',
        heroImageKey: 'cranes',
        overview: [
            'Freight coordination sits between commercial agreement and destination receipt. Once product, packing and documents are clear, mode selection and booking windows determine cost and risk.',
            'We work with logistics partners for carriage. AITH coordinates the trade file - readiness dates, document timing, booking preferences and milestone communication. We do not operate vessels, aircraft or customs brokerage licences.',
            'Buyers and suppliers still own the obligations named in their Incoterm. Our job is to keep those obligations visible and the schedule honest.',
        ],
        sections: [
            {
                index: '01',
                title: 'Mode selection',
                body: [
                    'Sea freight is primary for bulk and container loads. Air suits urgent, high-value or time-sensitive parcels. Land and multimodal legs appear when inland destinations need more than a port gate delivery.',
                    'We weigh cost, timeline, shelf life, volume and destination infrastructure. Your deadline preference is part of that calculation when you state it.',
                ],
            },
            {
                index: '02',
                title: 'Sea freight coordination',
                body: [
                    'Container and bulk vessel planning includes origin readiness, stuffing or loading windows, and alignment of B/L instructions with commercial documents.',
                    'Schedules slip. We communicate revised ETDs and ETAs when carriers update - silence helps no one.',
                ],
            },
            {
                index: '03',
                title: 'Air freight coordination',
                body: [
                    'Air moves when sea cannot meet the window. Cut-offs are tight; document and packing readiness must match flight acceptance.',
                    'Dimensional weight and handling constraints are confirmed before quoting air as if it were a default.',
                ],
            },
            {
                index: '04',
                title: 'Multimodal and inland',
                body: [
                    'Some programmes need rail, road or partner inland haul after ocean or air arrival. Those legs are coordinated with destination partners under the agreed Incoterm.',
                    'Door delivery beyond the Incoterm is only included when explicitly stated in the commercial path.',
                ],
            },
            {
                index: '05',
                title: 'Booking and readiness',
                body: [
                    'Bookings are requested against confirmed cargo readiness - not hopeful production dates. Early booking on late cargo creates storage and roll costs.',
                    'Inspection holds and certificate delays are treated as readiness blockers, not footnotes.',
                ],
            },
            {
                index: '06',
                title: 'Milestones and updates',
                body: [
                    'Typical updates cover booking confirmation, goods ready, export formalities, departure, arrival and delivery handoff where applicable.',
                    'Channel and frequency follow shipment size and your preference. Portal access, if offered later, will be confirmed separately - not assumed here.',
                ],
            },
            {
                index: '07',
                title: 'Insurance and risk',
                body: [
                    'Cargo insurance may be arranged or coordinated depending on lane, Incoterm and product. Coverage scope should be confirmed on each commercial path before shipment.',
                    'Risk allocation follows the Incoterm. Coordination does not rewrite who bears loss at which point.',
                ],
            },
            {
                index: '08',
                title: 'What we do not claim',
                body: [
                    'We do not present AITH as a freight forwarder, NVOCC, shipping line or customs broker. Those roles belong to licensed operators and your appointed agents.',
                    'Our value is keeping origin readiness, documents and partner bookings aligned so the trade file moves as one.',
                ],
            },
        ],
        related: [
            { label: 'Import & Export', to: '/import-export-services' },
            { label: 'Trade Documentation', to: '/trade-documentation' },
            { label: 'Markets', to: '/markets' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'modes',
            'air-vs-sea',
            'lead-times',
            'shipment-duration',
            'shipment-updates',
            'cargo-insurance',
            'customs',
            'incoterms',
            'shipping-documents',
        ],
        ctaLabel: 'Coordinate a shipment path',
    },
};

export const SERVICE_PAGE_LIST = Object.values(SERVICE_PAGES);

export function getServicePage(slug) {
    return SERVICE_PAGES[slug] || null;
}
