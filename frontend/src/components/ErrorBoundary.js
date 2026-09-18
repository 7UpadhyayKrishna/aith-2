import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * Minimal branded boundary — prevents a blank white screen on uncaught render errors.
 * Stack traces stay in the console for developers; users see recovery actions only.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error('AITH ErrorBoundary:', error, info);
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <main
                id="main-content"
                className="min-h-screen bg-forest text-ivory flex flex-col justify-center px-6 lg:px-12 py-24"
                data-testid="error-boundary"
            >
                <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-copper">AITH</p>
                <h1 className="text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold tracking-tight mt-6 leading-[0.95]">
                    Something went wrong.
                </h1>
                <p className="text-ivory/65 text-sm mt-6 max-w-md leading-relaxed">
                    An unexpected error interrupted this page. You can return home or reload.
                </p>
                <div className="flex flex-wrap gap-4 mt-10">
                    <Link
                        to="/"
                        className="inline-flex items-center bg-copper text-ivory px-7 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-terra transition-colors duration-300"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Return home
                    </Link>
                    <button
                        type="button"
                        onClick={this.handleReload}
                        className="inline-flex items-center font-mono text-[11px] tracking-[0.22em] uppercase border-b border-ivory/35 pb-1 hover:text-copper hover:border-copper transition-colors duration-300"
                    >
                        Reload
                    </button>
                </div>
            </main>
        );
    }
}
