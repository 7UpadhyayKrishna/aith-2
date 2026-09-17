import { useEffect } from 'react';
import {
    SITE_NAME,
    DEFAULT_DESCRIPTION,
    SITE_ORIGIN,
    SITE_EMAIL,
    BRAND,
    SOCIAL,
    absoluteUrl,
} from '@/config/site';
import { COMPANY } from '@/data/company';

function upsertMeta(attr, key, content) {
    if (!content) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function upsertLink(rel, href) {
    if (!href) return;
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
    const existing = document.getElementById(id);
    if (!data) {
        if (existing) existing.remove();
        return;
    }
    const el = existing || document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    el.text = JSON.stringify(data);
    if (!existing) document.head.appendChild(el);
}

/**
 * Per-route document head updates for the CRA SPA.
 */
export default function Seo({
    title,
    description = DEFAULT_DESCRIPTION,
    path = '/',
    image = BRAND.ogImage,
    type = 'website',
    jsonLd,
    noIndex = false,
    canonical,
}) {
    useEffect(() => {
        // Prefer natural "Intent | AITH" titles; avoid double-branding when title already includes AITH
        const fullTitle = title
            ? (/\bAITH\b/i.test(title) ? title : `${title} | AITH`)
            : `${SITE_NAME} — Global Sourcing, Import & Export`;
        const url = canonical || absoluteUrl(path);
        const absImage = image.startsWith('http') ? image : `${SITE_ORIGIN}${image}`;

        document.title = fullTitle;
        upsertMeta('name', 'description', description);
        upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
        upsertLink('canonical', url);

        upsertMeta('property', 'og:title', fullTitle);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:type', type);
        upsertMeta('property', 'og:url', url);
        upsertMeta('property', 'og:image', absImage);
        upsertMeta('property', 'og:site_name', SITE_NAME);

        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:title', fullTitle);
        upsertMeta('name', 'twitter:description', description);
        upsertMeta('name', 'twitter:image', absImage);

        upsertJsonLd('aith-jsonld', jsonLd);

        return () => {
            upsertJsonLd('aith-jsonld', null);
        };
    }, [title, description, path, image, type, jsonLd, noIndex, canonical]);

    return null;
}

export const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: 'AITH',
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}${BRAND.logoPng}`,
    email: SITE_EMAIL,
    telephone: COMPANY.phoneTel || undefined,
    address: {
        '@type': 'PostalAddress',
        streetAddress: COMPANY.addressLine1,
        addressLocality: 'New Delhi',
        postalCode: '110019',
        addressCountry: 'IN',
    },
    sameAs: [SOCIAL.linkedin, SOCIAL.x, SOCIAL.instagram].filter(Boolean),
    description: DEFAULT_DESCRIPTION,
};

export function faqPageJsonLd(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
            },
        })),
    };
}

export function breadcrumbJsonLd(crumbs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: c.path ? absoluteUrl(c.path) : undefined,
        })),
    };
}

export function articleJsonLd({ title, description, path, image, datePublished, dateModified }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        image: image?.startsWith('http') ? image : `${SITE_ORIGIN}${image || BRAND.ogImage}`,
        author: {
            '@type': 'Organization',
            name: SITE_NAME,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_ORIGIN}${BRAND.logoPng}`,
            },
        },
        mainEntityOfPage: absoluteUrl(path),
        datePublished: datePublished || undefined,
        dateModified: dateModified || datePublished || undefined,
    };
}

export function blogPostingJsonLd({
    title,
    description,
    path,
    image,
    datePublished,
    dateModified,
    authorName,
    authorType = 'Organization',
}) {
    const img = image?.startsWith('http') ? image : `${SITE_ORIGIN}${image || BRAND.ogImage}`;
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        image: img,
        author: {
            '@type': authorType === 'Person' ? 'Person' : 'Organization',
            name: authorName || SITE_NAME,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_ORIGIN}${BRAND.logoPng}`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': absoluteUrl(path),
        },
        datePublished: datePublished || undefined,
        dateModified: dateModified || datePublished || undefined,
    };
}

export function serviceJsonLd({ name, description, path }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        provider: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_ORIGIN,
        },
        url: absoluteUrl(path),
        areaServed: 'Worldwide',
    };
}
