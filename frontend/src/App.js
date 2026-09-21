import { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Lenis from 'lenis';
import { Toaster } from 'sonner';
import { ArrowUpRight } from 'lucide-react';
import '@/App.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import Home from '@/pages/Home';

const Products = lazy(() => import('@/pages/Products'));
const Minerals = lazy(() => import('@/pages/Minerals'));
const Markets = lazy(() => import('@/pages/Markets'));
const Insights = lazy(() => import('@/pages/Insights'));
const RequestQuote = lazy(() => import('@/pages/RequestQuote'));
const Article = lazy(() => import('@/pages/Article'));
const About = lazy(() => import('@/pages/About'));
const Services = lazy(() => import('@/pages/Services'));
const Faq = lazy(() => import('@/pages/Faq'));
const Contact = lazy(() => import('@/pages/Contact'));
const Partner = lazy(() => import('@/pages/Partner'));
const QualityCompliance = lazy(() => import('@/pages/QualityCompliance'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Careers = lazy(() => import('@/pages/Careers'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ServiceSeoPage = lazy(() => import('@/pages/ServiceSeoPage'));
const IndustriesIndex = lazy(() => import('@/pages/IndustriesIndex'));
const IndustryPage = lazy(() => import('@/pages/IndustryPage'));
const Blogs = lazy(() => import('@/pages/Blogs'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const AdminApp = lazy(() => import('@/admin/AdminApp'));

const SERVICE_SEO_ROUTES = [
    'global-sourcing-services',
    'import-export-services',
    'international-procurement',
    'supplier-sourcing',
    'trade-documentation',
    'freight-coordination',
];

const ScrollManager = () => {
    const { pathname, hash } = useLocation();
    useEffect(() => {
        if (pathname.startsWith('/admin')) return undefined;
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

/** SPA route pageviews for PostHog - skip duplicate of first auto pageview */
const AnalyticsPageviews = () => {
    const { pathname, search } = useLocation();
    const first = useRef(true);
    useEffect(() => {
        if (pathname.startsWith('/admin')) return;
        if (first.current) {
            first.current = false;
            return;
        }
        try {
            window.posthog?.capture?.('$pageview', {
                $current_url: window.location.href,
                path: pathname + search,
            });
        } catch {
            /* analytics must never block navigation */
        }
    }, [pathname, search]);
    return null;
};

const MobileCTA = () => {
    const { pathname } = useLocation();
    if (pathname === '/request-quote' || pathname.startsWith('/admin')) return null;
    return (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden" data-testid="mobile-persistent-cta">
            <Link
                to="/request-quote"
                className="flex items-center justify-center gap-2 bg-copper text-ivory py-4 font-mono text-[11px] tracking-[0.28em] uppercase min-h-[52px]"
            >
                Request Quote <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
        </div>
    );
};

const RouteFallback = () => (
    <div className="min-h-[50vh] bg-ivory flex items-center justify-center" aria-busy="true" aria-live="polite">
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-mute">Loading…</p>
    </div>
);

function PublicChrome({ children }) {
    return (
        <>
            <Nav />
            {children}
            <Footer />
            <MobileCTA />
        </>
    );
}

function AppLayout() {
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith('/admin');

    useEffect(() => {
        if (isAdmin) {
            if (window.__lenis) {
                window.__lenis.destroy();
                window.__lenis = null;
                document.documentElement.classList.remove('lenis', 'lenis-smooth');
            }
            return undefined;
        }

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return undefined;
        if (window.__lenis) return undefined;

        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const lenis = new Lenis({
            duration: 0.95,
            smoothWheel: !coarse,
            lerp: 0.1,
            wheelMultiplier: 1,
            touchMultiplier: 1.2,
            syncTouch: false,
        });
        window.__lenis = lenis;
        document.documentElement.classList.add('lenis', 'lenis-smooth');

        lenis.on('scroll', () => {
            window.dispatchEvent(new Event('scroll'));
        });

        let raf;
        const loop = (t) => {
            lenis.raf(t);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            document.documentElement.classList.remove('lenis', 'lenis-smooth');
            lenis.destroy();
            window.__lenis = null;
        };
    }, [isAdmin]);

    if (isAdmin) {
        return (
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    <Route path="/admin/*" element={<AdminApp />} />
                </Routes>
            </Suspense>
        );
    }

    return (
        <PublicChrome>
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    {SERVICE_SEO_ROUTES.map((slug) => (
                        <Route
                            key={slug}
                            path={`/${slug}`}
                            element={<ServiceSeoPage slug={slug} />}
                        />
                    ))}
                    <Route path="/products" element={<Products />} />
                    <Route path="/minerals" element={<Minerals />} />
                    <Route path="/industries" element={<IndustriesIndex />} />
                    <Route path="/industries/:slug" element={<IndustryPage />} />
                    <Route path="/markets" element={<Markets />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/insights/:id" element={<Article />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/:slug" element={<BlogPost />} />
                    <Route path="/faq" element={<Faq />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/partner" element={<Partner />} />
                    <Route path="/quality-compliance" element={<QualityCompliance />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/request-quote" element={<RequestQuote />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </PublicChrome>
    );
}

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <ErrorBoundary>
                    <ScrollManager />
                    <AnalyticsPageviews />
                    <AppLayout />
                    <Toaster position="bottom-right" />
                </ErrorBoundary>
            </BrowserRouter>
        </div>
    );
}

export default App;
