/**
 * Industry page content keyed by slug.
 * categoryId maps to CATEGORIES.id in content.js (minerals-metals → minerals).
 */

export const INDUSTRIES = {
    healthcare: {
        slug: 'healthcare',
        categoryId: 'healthcare',
        name: 'Healthcare',
        kicker: 'AITH / Industries / Healthcare',
        titleLines: ['HEALTHCARE', 'SUPPLY,', 'SPECIFIED.'],
        italicLast: true,
        lead:
            'Medical consumables, hospital supplies and process inputs sourced against written specifications — with documentation and quality checks matched to the destination market.',
        overview: [
            'Healthcare trade is specification-led. A “glove” or “syringe” without grade, sterility status, material and packing is not a buyable brief. We work from detailed product descriptions and destination expectations before approaching manufacturers.',
            'Our focus is commercial sourcing and export coordination for consumables, protective equipment, hospital supplies and related process inputs. We do not claim pharmaceutical marketing authorisations, device registrations or regulatory approvals on behalf of buyers or suppliers.',
            'Where destination markets require health certificates, registration numbers or importer licences, those obligations sit with the responsible party. We coordinate supplier documents that support your compliance file — we do not replace your regulatory counsel or local authorised representative.',
        ],
        productAreas: [
            {
                title: 'Surgical instruments',
                body: 'Reuseable and disposable instrument lines where manufacturers can evidence material grade, finish and sterilisation method as specified.',
            },
            {
                title: 'Medical consumables',
                body: 'High-turnover disposable items — from dressings to procedural consumables — packed for export with lot traceability where required.',
            },
            {
                title: 'Pharmaceutical ingredients (process inputs)',
                body: 'Selected input materials where buyers provide clear specifications and accept that marketing authorisation and import licensing remain outside AITH’s role.',
            },
            {
                title: 'Diagnostic and hospital supplies',
                body: 'Laboratory and ward supply items sourced to catalogue or custom specs, with packing suitable for air or sea depending on urgency and volume.',
            },
            {
                title: 'Protective equipment',
                body: 'Gloves, masks and related PPE lines evaluated against stated standards and test reports — not generic “medical grade” labels without evidence.',
            },
        ],
        buyerConsiderations: [
            'Provide destination country, intended use context and any importer licence constraints before quoting.',
            'Name required standards, test methods or certificate types explicitly — “CE-like” is not a specification.',
            'Confirm whether sterility, single-use labelling and language of IFU/labels are part of the brief.',
            'Decide early if third-party inspection or batch sampling is mandatory before shipment.',
            'Separate regulatory registration work from commercial sourcing so timelines stay realistic.',
        ],
        supplierConsiderations: [
            'Export experience and document discipline matter as much as factory capacity.',
            'Lot coding, shelf-life dating and packing integrity should be demonstrated on trial lots.',
            'Willingness to support buyer-nominated inspection reduces later friction.',
            'Claims about regulatory status must be evidenced; unsupported claims are discarded.',
        ],
        quality: [
            'Supplier capability review before commercial commitment.',
            'Pre-shipment inspection or sampling against the agreed acceptance criteria where required.',
            'Certificate of analysis or test reports matched to the product and destination list.',
            'Hold points for non-conforming lots at origin when inspection fails.',
        ],
        packaging: [
            'Export cartons with clear marks, lot references and quantity per pack.',
            'Protection against moisture and crush damage for sterile or delicate lines.',
            'Language and symbol requirements on outer packs as specified by the buyer market.',
            'Palletisation and container stuffing plans for sea; dimensional limits for air.',
        ],
        documentation: [
            'Commercial invoice and packing list with precise product descriptions.',
            'Certificate of origin where preferential or destination rules require it.',
            'Product test reports, CoA or health-related certificates only where destination rules demand them.',
            'Transport document (B/L or AWB) aligned with consignee instructions.',
        ],
        shipment: [
            'Air for urgent or temperature-sensitive parcels; sea for larger, stable consumable volumes.',
            'Cold-chain or special handling only when explicitly scoped and partner-capable.',
            'Milestone updates from booking through arrival handoff.',
        ],
        processNote:
            'Healthcare sourcing starts with a written specification and destination constraint list. We will not invent regulatory status or accelerate registration timelines that belong to licensed local parties.',
        markets: [
            'Africa — public and private hospital supply programmes',
            'Middle East — distributor and institutional procurement',
            'Europe — compliance-led importer programmes',
            'North America — where importer pathways are already established by the buyer',
        ],
        relatedProducts: [
            'Surgical Instruments',
            'Medical Consumables',
            'Pharmaceutical Ingredients',
            'Diagnostic Equipment',
            'Hospital Supplies',
            'Protective Equipment',
        ],
        relatedLinks: [
            { label: 'Global Sourcing', to: '/global-sourcing-services' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Trade Documentation', to: '/trade-documentation' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'categories',
            'custom-source',
            'samples',
            'quality-process',
            'certifications',
            'product-certificates',
            'air-vs-sea',
            'documents',
        ],
        caution:
            'AITH coordinates commercial sourcing and export documentation for healthcare-related products. We do not claim to hold pharmaceutical manufacturing licences, medical device registrations, or authority to approve products for clinical use in any market. Regulatory clearance remains the responsibility of the buyer, importer of record and applicable competent authorities.',
    },

    agriculture: {
        slug: 'agriculture',
        categoryId: 'agriculture',
        name: 'Agriculture',
        kicker: 'AITH / Industries / Agriculture',
        titleLines: ['GRAIN.', 'SPICE.', 'ORIGIN.'],
        italicLast: true,
        lead:
            'Rice, wheat, pulses, spices and related agri lines from Asian origin — graded, packed and documented for destination food-import rules.',
        overview: [
            'Agricultural trade is seasonal and grade-sensitive. Crop calendars, moisture, broken percentages and packing formats change the commercial conversation more than a glossy product photo.',
            'We source food grains, pulses, spices, dry fruits and selected fresh or semi-processed lines when cold-chain and phytosanitary paths are workable. Volume often moves in container lots; vessel-scale is discussed only when the brief and origin can support it.',
            'Phytosanitary certificates, fumigation evidence and destination residue or contaminant limits are treated as part of the path — not optional extras discovered at stuffing.',
        ],
        productAreas: [
            {
                title: 'Rice',
                body: 'Varieties and grades matched to buyer specs — broken limits, moisture, milling degree and packing in bags or bulk-in-container as agreed.',
            },
            {
                title: 'Wheat',
                body: 'Milling or feed wheat as specified, with protein and quality parameters confirmed before booking.',
            },
            {
                title: 'Pulses',
                body: 'Lentils, chickpeas and related pulses with size, colour and defect criteria written into the contract.',
            },
            {
                title: 'Spices',
                body: 'Whole and ground spices where origin, cleanliness and moisture matter; samples often precede first commercial lots.',
            },
            {
                title: 'Fresh produce and dry fruits',
                body: 'Selected lines where packing, shelf life and mode (often air or fast sea) fit the destination window.',
            },
        ],
        buyerConsiderations: [
            'State grade standards (e.g. broken %, moisture) and packing (bag weight, liner) in the RFQ.',
            'Confirm destination phytosanitary and food-safety certificate list early.',
            'Share preferred origin harvest windows if timing is critical for price or availability.',
            'Clarify whether inspection (SGS or nominated agency) is required before loading.',
            'Agree Incoterm and discharge port capabilities — not every inland point suits bulk grain.',
        ],
        supplierConsiderations: [
            'Consistent grading and moisture control beat opportunistic mixing.',
            'Export packing and mark discipline reduce destination claims.',
            'Fumigation and phytosanitary readiness must match the sailing date.',
            'Transparent crop availability prevents overselling into a short harvest.',
        ],
        quality: [
            'Pre-shipment sampling against agreed grade and contaminant limits.',
            'Moisture and defect checks recorded before stuffing.',
            'Certificate of analysis or quality certificate as required by the contract.',
            'Buyer-nominated inspection welcome on food-security programmes.',
        ],
        packaging: [
            'Food-grade bags or bulk container liners as specified.',
            'Clear lot and grade marks for traceability.',
            'Protection against infestation and moisture ingress in transit.',
            'Pallet or slip-sheet programmes where destination receiving requires them.',
        ],
        documentation: [
            'Commercial invoice and packing list with precise commodity descriptions.',
            'Phytosanitary certificate where destination plant-health rules require it.',
            'Certificate of origin for preferential or standard import formalities.',
            'B/L instructions aligned with letter of credit or buyer bank if used.',
        ],
        shipment: [
            'Sea containers for most bagged and liner programmes; air for urgent spices or perishables.',
            'Booking against confirmed cargo readiness after inspection, not before.',
            'Transit and storage conditions flagged when heat or humidity risk is material.',
        ],
        processNote:
            'Agri quotes move with crop and freight markets. Validity windows are short by design; we reconfirm availability and price before you commit capital.',
        markets: [
            'Middle East — food-security and distributor programmes',
            'Africa — grain and pulse import corridors',
            'Europe — compliance-led spice and specialty agri',
            'North America — selected containerised food ingredients',
        ],
        relatedProducts: ['Rice', 'Wheat', 'Pulses', 'Spices', 'Fresh Produce', 'Dry Fruits'],
        relatedLinks: [
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'Import & Export', to: '/import-export-services' },
            { label: 'Markets', to: '/markets' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'categories',
            'moq',
            'samples',
            'documents',
            'product-certificates',
            'modes',
            'lead-times',
            'quote-process',
            'regions',
        ],
    },

    'minerals-metals': {
        slug: 'minerals-metals',
        categoryId: 'minerals',
        name: 'Minerals & Metals',
        kicker: 'AITH / Industries / Minerals & Metals',
        titleLines: ['MINERALS.', 'ASSAYED.', 'SHIPPED.'],
        italicLast: true,
        lead:
            'Industrial minerals and related materials traded against assay and commercial specs — coordination from origin to destination, without mining ownership claims.',
        overview: [
            'Mineral trade lives on numbers: assay, moisture, size distribution and impurity limits. We treat those figures as contractual, not decorative.',
            'AITH coordinates sourcing and export of industrial minerals such as iron ore, limestone, bauxite, industrial salt, quartz and related lines when suppliers can evidence quality. We do not claim to own mines, operate extraction sites or control pit production.',
            'Bulk and container programmes both appear. Vessel-scale moves only when origin load ports, laycan and documentary credit structures are realistic for the parties involved.',
        ],
        productAreas: [
            {
                title: 'Iron ore',
                body: 'Fe content, silica/alumina and moisture bands confirmed by assay before commercial lock.',
            },
            {
                title: 'Coal and coke',
                body: 'Industrial fuel and reductant grades where destination specifications and handling rules allow.',
            },
            {
                title: 'Limestone and bauxite',
                body: 'Industrial feedstock grades with size and chemical limits written into the brief.',
            },
            {
                title: 'Industrial salt and quartz',
                body: 'Purity and grain-size specifications matched to chemical, glass or process uses.',
            },
        ],
        buyerConsiderations: [
            'Provide assay targets and rejection limits — not only a commodity name.',
            'Confirm load port, discharge port and any draft or gear restrictions early.',
            'State whether independent surveyor attendance is required at load and/or discharge.',
            'Clarify Incoterm carefully; bulk mineral risk allocation is unforgiving.',
            'Plan documentary timelines for assay certificates alongside B/L release.',
        ],
        supplierConsiderations: [
            'Assay labs and sampling methods should be named and acceptable to the buyer.',
            'Stockpile consistency matters more than a single favourable sample.',
            'Load-rate and storage readiness must match nominated vessels or containers.',
            'No representation of mine ownership is made through AITH’s involvement.',
        ],
        quality: [
            'Assay-backed certificates of analysis against contractual bands.',
            'Independent inspection or survey where nominated.',
            'Moisture and size checks before loading where relevant.',
            'Photographic and tally evidence on containerised mineral programmes when useful.',
        ],
        packaging: [
            'Bulk in vessel holds or bulk containers with appropriate liners.',
            'Bagged minerals for smaller industrial lots with tear and moisture resistance.',
            'Clear lot identification for blended or multi-grade programmes.',
            'Dust and contamination controls during stuffing.',
        ],
        documentation: [
            'Commercial invoice reflecting accurate quantity and value.',
            'Certificate of analysis / assay report.',
            'Certificate of origin as required.',
            'B/L or multimodal transport document with correct cargo description.',
        ],
        shipment: [
            'Bulk sea for large industrial programmes; containers for smaller or specialty lots.',
            'Laycan and NOR discipline communicated clearly on vessel fixtures coordinated through partners.',
            'Discharge survey coordination when the contract requires it.',
        ],
        processNote:
            'Mineral offers without recent assay context are incomplete. We will ask for numbers before chasing freight.',
        markets: [
            'Europe — industrial feedstock and specialty minerals',
            'Middle East — construction and process minerals',
            'Africa — selected industrial import programmes',
            'Asia intra-trade — origin and regional redistribution where relevant',
        ],
        relatedProducts: [
            'Iron Ore',
            'Coal & Coke',
            'Limestone',
            'Bauxite',
            'Industrial Salt',
            'Quartz',
        ],
        relatedLinks: [
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'International Procurement', to: '/international-procurement' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'categories',
            'samples',
            'quality-process',
            'third-party-inspection',
            'product-certificates',
            'modes',
            'documents',
            'moq',
        ],
    },

    chemicals: {
        slug: 'chemicals',
        categoryId: 'chemicals',
        name: 'Chemicals',
        kicker: 'AITH / Industries / Chemicals',
        titleLines: ['CHEMICALS,', 'HANDLED WITH', 'CARE.'],
        italicLast: true,
        lead:
            'Industrial and specialty chemical lines with SDS, packing and logistics coordination matched to hazard class and destination rules.',
        overview: [
            'Chemical trade is documentation-heavy for good reason. Safety data sheets, packing groups and transport classifications decide whether a lane is workable before price is interesting.',
            'We coordinate solvents, specialty chemicals, fertilizers, polymers, dyes, pigments and industrial acids where suppliers can provide current SDS and handling guidance. We do not claim to manufacture chemicals or operate licensed hazardous-goods warehouses.',
            'Restricted or controlled substances are screened against applicable trade rules. If a request cannot proceed, we say so early.',
        ],
        productAreas: [
            {
                title: 'Industrial solvents',
                body: 'Process solvents quoted with purity, packing type and transport classification confirmed upfront.',
            },
            {
                title: 'Specialty chemicals',
                body: 'Application-specific grades where CoA parameters and batch consistency matter to the buyer process.',
            },
            {
                title: 'Fertilizers',
                body: 'Nutrient grades and packing formats aligned to destination agricultural import rules.',
            },
            {
                title: 'Polymers, dyes and pigments',
                body: 'Material grades and colour indices specified; samples often precede scale-up.',
            },
            {
                title: 'Industrial acids',
                body: 'Concentration and packing integrity critical; handling notes follow the SDS, not improvisation.',
            },
        ],
        buyerConsiderations: [
            'Share intended use context only as needed for classification — not for marketing claims.',
            'Require current SDS and CoA templates before approving a supplier.',
            'Confirm whether the destination importer holds any required chemical import licences.',
            'State packing preference (drums, IBCs, isotanks) and whether returns or rinsing apply.',
            'Budget inspection and possible DG surcharges honestly into the landed view.',
        ],
        supplierConsiderations: [
            'SDS must be current and language-appropriate for the lane.',
            'Packing must match UN/transport requirements where applicable.',
            'Batch traceability and CoA discipline are non-negotiable for repeat buyers.',
            'Overstating hazard-free status when classification says otherwise ends the conversation.',
        ],
        quality: [
            'Certificate of analysis per batch against agreed specs.',
            'SDS review as part of supplier evaluation.',
            'Pre-shipment checks on packing integrity and labelling.',
            'Buyer-nominated inspection for sensitive specialty grades.',
        ],
        packaging: [
            'Drums, IBCs or other UN-rated packs as required by classification.',
            'Labelled hazard marks and handling pictograms per applicable rules.',
            'Segregation plans for mixed container loads when compatible.',
            'Tamper and leak prevention during stuffing and transit.',
        ],
        documentation: [
            'Commercial invoice with accurate chemical identity and HS context.',
            'SDS and CoA accompanying the commercial set.',
            'Certificate of origin where required.',
            'Dangerous goods declarations coordinated with logistics partners when applicable — partners execute DG formalities they are licensed for.',
        ],
        shipment: [
            'Mode and carrier acceptance depend on classification; not every chemical flies or sails on the first preference.',
            'Booking only after packing and document readiness for DG cargo.',
            'Milestone updates include holds related to carrier or terminal acceptance.',
        ],
        processNote:
            'If SDS, packing group or import licence status is unclear, we pause commercial work until those facts exist. Speed without classification is not a service.',
        markets: [
            'Middle East — industrial and specialty demand',
            'Africa — fertilizer and process chemical imports',
            'Europe — compliance-led specialty and polymer programmes',
            'North America — selected lines where importer pathways exist',
        ],
        relatedProducts: [
            'Industrial Solvents',
            'Specialty Chemicals',
            'Fertilizers',
            'Polymers',
            'Dyes & Pigments',
            'Industrial Acids',
        ],
        relatedLinks: [
            { label: 'Trade Documentation', to: '/trade-documentation' },
            { label: 'Freight Coordination', to: '/freight-coordination' },
            { label: 'Quality & Compliance', to: '/quality-compliance' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'categories',
            'documents',
            'product-certificates',
            'certifications',
            'customs',
            'modes',
            'quality-process',
            'restricted',
        ],
    },

    textiles: {
        slug: 'textiles',
        categoryId: 'textiles',
        name: 'Textiles',
        kicker: 'AITH / Industries / Textiles',
        titleLines: ['YARN.', 'FABRIC.', 'FINISHED.'],
        italicLast: true,
        lead:
            'Cotton yarn, woven fabrics, technical and home textiles, denim and garments from established Asian spinning, weaving and garment clusters.',
        overview: [
            'Textile sourcing fails on vague hand-feel descriptions and succeeds on measurable specs — count, construction, GSM, width, colour fastness and shrinkage. We push briefs toward numbers and approved references.',
            'India and wider Asia offer deep spinning, weaving and garment capacity. We match buyer programmes to manufacturers who can hold quality across bulk, not only on a showroom metre.',
            'Private label and OEM paths are possible where suppliers support branding, packaging and MOQs. Regulatory or sustainability claims (e.g. specific eco labels) are only pursued when evidence exists — we do not invent certifications.',
        ],
        productAreas: [
            {
                title: 'Cotton yarn',
                body: 'Counts and spin types matched to weaving or knitting end use; cone packing and moisture control as specified.',
            },
            {
                title: 'Woven fabrics',
                body: 'Construction, width, GSM and finish agreed; bulk shade continuity planned for multi-lot programmes.',
            },
            {
                title: 'Technical and home textiles',
                body: 'Performance or home-furnishing specs with test reports where the buyer market expects them.',
            },
            {
                title: 'Garments and denim',
                body: 'Style specs, size runs and packing lists locked before cutting; wash and measurement tolerances agreed.',
            },
        ],
        buyerConsiderations: [
            'Provide tech packs, approved samples or measurable fabric specs — not only mood boards.',
            'State testing standards (colour fastness, pilling, shrinkage) required at destination.',
            'Confirm labelling language, fibre composition rules and care-label formats.',
            'Plan MOQs honestly; garment and fabric minimums differ by mill and style.',
            'Decide inspection stages (inline, final random) before production starts.',
        ],
        supplierConsiderations: [
            'Shade continuity and lot management for bulk fabric programmes.',
            'Capacity planning against delivery calendars — overbooking creates missed vessels.',
            'Willingness to accept buyer QC protocols and AQL levels.',
            'Transparent lead times including dyeing, finishing and packing.',
        ],
        quality: [
            'Lab dips, strike-offs or size sets before bulk where relevant.',
            'Inline and final inspections against agreed AQL.',
            'Test reports for colour fastness, shrinkage and other named standards.',
            'Needle and metal detection for garments when buyer programmes require them.',
        ],
        packaging: [
            'Polybag and carton standards for garments; roll packing for fabrics.',
            'Assortment and ratio packing as per PO.',
            'Moisture barriers for sea transit on cotton-heavy programmes.',
            'Retail or private-label packaging only when artwork and MOQ are confirmed.',
        ],
        documentation: [
            'Commercial invoice and detailed packing list (styles, colours, sizes).',
            'Certificate of origin for preferential duty where claimed.',
            'Textile test reports and fibre composition statements as required.',
            'B/L or AWB matching consignee and notify details on the PO.',
        ],
        shipment: [
            'Sea containers for bulk fabric and garment programmes; air for launch-critical styles.',
            'Booking against ex-factory readiness after final inspection pass.',
            'Carton-level packing lists reduce destination receiving errors.',
        ],
        processNote:
            'Textile calendars are unforgiving around fashion drops and retail windows. Share hard in-store or warehouse dates early so mode and production buffers are honest.',
        markets: [
            'Europe — compliance and private-label fabric/garment programmes',
            'North America — distribution and retail supply',
            'Middle East — garments, home textiles and fabric demand',
            'Africa — selected apparel and textile import programmes',
        ],
        relatedProducts: [
            'Cotton Yarn',
            'Woven Fabrics',
            'Technical Textiles',
            'Home Textiles',
            'Garments',
            'Denim',
        ],
        relatedLinks: [
            { label: 'Supplier Sourcing', to: '/supplier-sourcing' },
            { label: 'Global Sourcing', to: '/global-sourcing-services' },
            { label: 'Products', to: '/products' },
            { label: 'Request a Quote', to: '/request-quote' },
        ],
        faqIds: [
            'categories',
            'moq',
            'moq-vary',
            'private-label-oem',
            'samples',
            'packaging',
            'quality-process',
            'certifications',
            'lead-times',
        ],
    },
};

export const INDUSTRY_LIST = Object.values(INDUSTRIES);

export function getIndustry(slug) {
    return INDUSTRIES[slug] || null;
}

export function categoryToIndustrySlug(categoryId) {
    if (categoryId === 'minerals') return 'minerals-metals';
    return categoryId;
}
