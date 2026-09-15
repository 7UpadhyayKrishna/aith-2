import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../components/Seo';
import { Line, Fade } from '../components/Reveal';

export default function NotFound() {
    return (
        <main id="main-content" className="min-h-[70vh] bg-forest text-ivory flex flex-col justify-center px-6 lg:px-12 py-32">
            <Seo title="Page not found" description="The page you requested does not exist on Asian International Trade House." path="/404" noIndex />
            <Fade y={10}>
                <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-copper">404</p>
            </Fade>
            <h1 className="text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.94] tracking-[-0.03em] font-extrabold mt-8">
                <Line>ROUTE NOT</Line>
                <Line delay={0.12}>
                    <span className="font-serif italic font-normal">FOUND.</span>
                </Line>
            </h1>
            <Fade delay={0.3}>
                <p className="text-ivory/65 text-sm lg:text-base mt-8 max-w-md leading-relaxed">
                    This path is not on our map. Return home, open FAQs, or start a trade request.
                </p>
                <div className="flex flex-wrap gap-4 mt-10">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                        data-testid="404-home"
                    >
                        Home <ArrowRight size={14} />
                    </Link>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase border-b border-ivory/35 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                        data-testid="404-contact"
                    >
                        Contact
                    </Link>
                    <Link
                        to="/request-quote"
                        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase border-b border-ivory/35 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                        data-testid="404-quote"
                    >
                        Request Quote
                    </Link>
                </div>
            </Fade>
        </main>
    );
}
