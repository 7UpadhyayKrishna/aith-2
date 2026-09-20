/**
 * Preloaded blog skeleton for New Blog + JSON Reset Template.
 * Keep in sync with docs/BLOG_JSON_SCHEMA.md and backend cms.blog_models.
 */

export const BLOG_CONTENT_SKELETON = `## Introduction

Write a clear opening that immediately answers why this topic matters to the reader.

## Key Considerations

Outline the practical factors buyers or operators should weigh before acting.

## What Buyers Should Check

List concrete verification points, documents, or decision criteria.

## Practical Next Steps

Close with actionable next steps and link to the relevant AITH service or industry page.
`;

/** Exact preloaded template for new blogs */
export function createBlogTemplate() {
    return {
        title: '',
        slug: '',
        subtitle: '',
        excerpt: '',
        category: 'Global Sourcing',
        tags: [],
        author: {
            type: 'Organization',
            name: 'AITH Editorial Team',
            url: null,
        },
        cover: {
            eyebrow: 'TRADE JOURNAL',
            headline: '',
            deck: '',
            image: {
                url: '',
                alt: '',
                caption: '',
                credit: '',
            },
        },
        // Legacy mirror of cover.image — kept for API compatibility
        featuredImage: {
            url: '',
            alt: '',
            caption: '',
        },
        contentMarkdown: BLOG_CONTENT_SKELETON,
        contentImages: [
            {
                id: 'image-1',
                url: '',
                alt: '',
                caption: '',
                credit: '',
                placement: 'after:introduction',
                decorative: false,
            },
        ],
        status: 'draft',
        featured: false,
        publishedAt: null,
        scheduledAt: null,
        seo: {
            primaryIntent: '',
            primaryKeyword: '',
            supportingKeywords: [],
            metaTitle: '',
            metaDescription: '',
            canonicalUrl: null,
            index: true,
            follow: true,
            ogTitle: '',
            ogDescription: '',
            ogImage: {
                url: '',
                alt: '',
            },
        },
        internalLinks: [
            {
                anchor: '',
                url: '',
                reason: '',
            },
        ],
        relatedSlugs: [],
        sources: [
            {
                label: '',
                url: '',
            },
        ],
        editorial: {
            contentType: 'evergreen',
            searchIntent: 'informational',
            audience: '',
            readerQuestion: '',
            recommendedServiceLink: '',
            recommendedIndustryLink: '',
            competitorNotes: '',
            authorNotes: '',
            lastReviewedAt: null,
            nextReviewAt: null,
            needsRefresh: false,
        },
        searchPerformance: {
            targetQueries: [],
            opportunityNotes: '',
            lastReviewedAt: null,
        },
        brief: {
            primarySearchIntent: '',
            primaryKeyword: '',
            supportingTopics: [],
            audience: '',
            readerQuestion: '',
            recommendedServiceLink: '',
            recommendedIndustryLink: '',
            competitorNotes: '',
            authorNotes: '',
        },
    };
}

export const BLOG_TEMPLATE_JSON = JSON.stringify(createBlogTemplate(), null, 2);

/** Sync featuredImage ↔ cover.image for backward compatibility */
export function syncCoverAndFeatured(blog) {
    const next = structuredClone(blog || createBlogTemplate());
    if (!next.cover) {
        next.cover = {
            eyebrow: 'TRADE JOURNAL',
            headline: next.title || '',
            deck: next.subtitle || next.excerpt || '',
            image: {
                url: next.featuredImage?.url || '',
                alt: next.featuredImage?.alt || '',
                caption: next.featuredImage?.caption || '',
                credit: '',
            },
        };
    }
    if (!next.cover.image) {
        next.cover.image = { url: '', alt: '', caption: '', credit: '' };
    }
    // Prefer cover.image as source of truth when present
    const img = next.cover.image;
    next.featuredImage = {
        url: img.url || next.featuredImage?.url || '',
        alt: img.alt || next.featuredImage?.alt || '',
        caption: img.caption || next.featuredImage?.caption || '',
    };
    // Normalize ogImage object vs string
    if (typeof next.seo?.ogImage === 'string') {
        next.seo.ogImage = { url: next.seo.ogImage, alt: '' };
    }
    if (!next.seo) next.seo = createBlogTemplate().seo;
    if (!next.editorial) next.editorial = createBlogTemplate().editorial;
    if (!next.brief) next.brief = createBlogTemplate().brief;
    if (!next.searchPerformance) next.searchPerformance = createBlogTemplate().searchPerformance;
    if (!Array.isArray(next.contentImages)) next.contentImages = [];
    if (!Array.isArray(next.internalLinks)) next.internalLinks = [];
    return next;
}

/** Pillar routes for internal-link suggestions (topic clusters) */
export const TOPIC_CLUSTER_LINKS = {
    'global sourcing': ['/global-sourcing-services', '/supplier-sourcing', '/request-quote'],
    sourcing: ['/global-sourcing-services', '/supplier-sourcing', '/request-quote'],
    'supplier verification': ['/supplier-sourcing', '/quality-compliance', '/request-quote'],
    supplier: ['/supplier-sourcing', '/quality-compliance'],
    quality: ['/quality-compliance', '/supplier-sourcing'],
    inspection: ['/quality-compliance', '/supplier-sourcing'],
    procurement: ['/international-procurement', '/request-quote'],
    documentation: ['/trade-documentation', '/import-export-services'],
    invoice: ['/trade-documentation', '/import-export-services'],
    incoterms: ['/trade-documentation', '/import-export-services'],
    'import': ['/import-export-services', '/trade-documentation'],
    export: ['/import-export-services', '/freight-coordination'],
    freight: ['/freight-coordination', '/import-export-services'],
    logistics: ['/freight-coordination'],
    industry: ['/industries', '/products'],
    healthcare: ['/industries/healthcare'],
    agriculture: ['/industries/agriculture'],
    minerals: ['/minerals', '/industries/minerals-metals'],
    chemicals: ['/industries/chemicals'],
    textiles: ['/industries/textiles'],
};

export function suggestInternalLinks(blog) {
    const intent = (
        blog?.seo?.primaryIntent ||
        blog?.brief?.primarySearchIntent ||
        blog?.category ||
        ''
    ).toLowerCase();
    const found = new Set();
    Object.entries(TOPIC_CLUSTER_LINKS).forEach(([key, urls]) => {
        if (intent.includes(key) || (blog?.title || '').toLowerCase().includes(key)) {
            urls.forEach((u) => found.add(u));
        }
    });
    // Category fallbacks
    const cat = blog?.category || '';
    const categoryMap = {
        'Global Sourcing': ['/global-sourcing-services', '/supplier-sourcing'],
        'Supplier Sourcing': ['/supplier-sourcing', '/quality-compliance'],
        'Import & Export': ['/import-export-services', '/trade-documentation'],
        Procurement: ['/international-procurement', '/request-quote'],
        'Trade Documentation': ['/trade-documentation', '/import-export-services'],
        Documentation: ['/trade-documentation'],
        Logistics: ['/freight-coordination'],
        'Quality & Compliance': ['/quality-compliance', '/supplier-sourcing'],
        Quality: ['/quality-compliance'],
        'Industry Guides': ['/industries', '/products'],
    };
    (categoryMap[cat] || []).forEach((u) => found.add(u));
    return [...found];
}
