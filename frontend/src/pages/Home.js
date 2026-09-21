import { lazy, Suspense } from 'react';
import Seo, { orgJsonLd } from '../components/Seo';
import { SITE_ORIGIN } from '../config/site';
import Hero from '../components/home/Hero';
import WhoWeAre from '../components/home/WhoWeAre';
import WhatWeDo from '../components/home/WhatWeDo';
import Discovery from '../components/home/Discovery';
import Process from '../components/home/Process';
import Industries from '../components/home/Industries';
import Closing from '../components/home/Closing';
import HomeJournal from '../components/home/HomeJournal';
import FaqAccordion from '../components/FaqAccordion';
import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';

const GlobalTrade = lazy(() => import('../components/home/GlobalTrade'));

export default function Home() {
    return (
        <main id="main-content" className="overflow-x-clip">
            <Seo
                title={null}
                description="Asian International Trade House - global sourcing, international trading and supply solutions connecting products, suppliers and buyers across international markets."
                path="/"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@graph': [
                        orgJsonLd,
                        {
                            '@type': 'WebSite',
                            name: 'Asian International Trade House',
                            url: SITE_ORIGIN,
                        },
                    ],
                }}
            />
            <Hero />
            <WhoWeAre />
            <WhatWeDo />
            <Discovery />
            <Suspense
                fallback={
                    <section className="bg-forest text-ivory min-h-[40vh] flex items-center justify-center" aria-busy="true">
                        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-ivory/50">Loading map…</p>
                    </section>
                }
            >
                <GlobalTrade />
            </Suspense>
            <Process />
            <Industries />
            <FaqAccordion
                items={getFaqsByIds(FAQ_BY_CONTEXT.home)}
                index="09"
                label="FAQ"
                title="What customers ask first"
                className="bg-ivory text-graphite content-visibility-auto"
                testId="home-faq"
            />
            <HomeJournal />
            <Closing />
        </main>
    );
}
