import Seo, { orgJsonLd } from '../components/Seo';
import { SITE_ORIGIN } from '../config/site';
import Hero from '../components/home/Hero';
import WhoWeAre from '../components/home/WhoWeAre';
import WhatWeDo from '../components/home/WhatWeDo';
import Discovery from '../components/home/Discovery';
import GlobalTrade from '../components/home/GlobalTrade';
import Process from '../components/home/Process';
import Industries from '../components/home/Industries';
import Closing from '../components/home/Closing';
import FaqAccordion from '../components/FaqAccordion';
import { FAQ_BY_CONTEXT, getFaqsByIds } from '../data/faqs';

export default function Home() {
    return (
        <main id="main-content">
            <Seo
                title={null}
                description="Asian International Trade House — global sourcing, international trading and supply solutions connecting products, suppliers and buyers across international markets."
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
            <GlobalTrade />
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
            <Closing />
        </main>
    );
}
