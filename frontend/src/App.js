import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Lenis from 'lenis';
import { Toaster } from 'sonner';
import { ArrowUpRight } from 'lucide-react';
import '@/App.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import Markets from '@/pages/Markets';
import Insights from '@/pages/Insights';
import RequestQuote from '@/pages/RequestQuote';
import Article from '@/pages/Article';

const ScrollManager = () => {
    const { pathname, hash } = useLocation();
    useEffect(() => {
        const lenis = window.__lenis;
        if (hash) {
            const t = setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) {
                    if (lenis) lenis.scrollTo(el, { offset: -90 });
                    else el.scrollIntoView();
                }
            }, 120);
            return () => clearTimeout(t);
        }
        if (lenis) lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
    }, [pathname, hash]);
    return null;
};

const MobileCTA = () => {
    const { pathname } = useLocation();
    if (pathname === '/request-quote') return null;
    return (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden" data-testid="mobile-persistent-cta">
            <Link
                to="/request-quote"
                className="flex items-center justify-center gap-2 bg-copper text-ivory py-4 font-mono text-[11px] tracking-[0.28em] uppercase"
            >
                Request Quote <ArrowUpRight size={14} />
            </Link>
        </div>
    );
};

function App() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
        window.__lenis = lenis;
        let raf;
        const loop = (t) => {
            lenis.raf(t);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            lenis.destroy();
            window.__lenis = null;
        };
    }, []);

    return (
        <div className="App">
            <BrowserRouter>
                <ScrollManager />
                <Nav />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/markets" element={<Markets />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/insights/:id" element={<Article />} />
                    <Route path="/request-quote" element={<RequestQuote />} />
                    <Route path="*" element={<Home />} />
                </Routes>
                <Footer />
                <MobileCTA />
                <Toaster position="bottom-right" />
            </BrowserRouter>
        </div>
    );
}

export default App;
