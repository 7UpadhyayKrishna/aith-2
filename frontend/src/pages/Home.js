import Hero from '../components/home/Hero';
import WhoWeAre from '../components/home/WhoWeAre';
import WhatWeDo from '../components/home/WhatWeDo';
import Discovery from '../components/home/Discovery';
import GlobalTrade from '../components/home/GlobalTrade';
import Process from '../components/home/Process';
import Industries from '../components/home/Industries';
import Closing from '../components/home/Closing';

export default function Home() {
    return (
        <main>
            <Hero />
            <WhoWeAre />
            <WhatWeDo />
            <Discovery />
            <GlobalTrade />
            <Process />
            <Industries />
            <Closing />
        </main>
    );
}
