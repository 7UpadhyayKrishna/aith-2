import { useState } from 'react';
import Seo from '@/components/Seo';
import { btnCopper, field, label } from './adminUi';

export default function AdminLogin({ onSubmit, error, sessionExpired }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [needsMfa, setNeedsMfa] = useState(false);
    const [busy, setBusy] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setBusy(true);
        try {
            await onSubmit(email.trim(), password, needsMfa ? totpCode.trim() : undefined);
            setNeedsMfa(false);
        } catch (err) {
            if (err?.mfaRequired) {
                setNeedsMfa(true);
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <div
            className="min-h-screen bg-ivory flex items-center justify-center px-5 animate-admin-fade"
            style={{
                backgroundImage:
                    'radial-gradient(ellipse at 18% 8%, rgba(182,90,50,0.08), transparent 42%), radial-gradient(ellipse at 88% 92%, rgba(23,35,29,0.07), transparent 38%)',
            }}
            data-testid="admin-login"
        >
            <Seo title="Admin Sign In" path="/admin" noIndex />
            <div className="w-full max-w-sm border border-graphite/15 bg-white/95 px-6 py-8 shadow-[0_20px_60px_-40px_rgba(23,35,29,0.45)] animate-admin-enter">
                <div className="flex items-center gap-3">
                    <img
                        src="/brand/logo-mark-transparent.png"
                        alt=""
                        className="h-9 w-9 object-contain"
                        width={36}
                        height={36}
                    />
                    <div>
                        <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-copper">AITH</p>
                        <h1 className="font-sans text-lg font-extrabold tracking-tight text-forest">Admin portal</h1>
                    </div>
                </div>
                <p className="mt-4 text-sm text-mute leading-relaxed">
                    Sign in with a provisioned administrator account. There is no public registration.
                </p>

                {sessionExpired && !error ? (
                    <p
                        role="status"
                        className="mt-4 text-sm text-copper border border-copper/25 bg-copper/5 px-3 py-2 animate-admin-fade"
                    >
                        Your previous session ended. Sign in again to continue.
                    </p>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
                    <div>
                        <label htmlFor="admin-email" className={label}>
                            Email
                        </label>
                        <input
                            id="admin-email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={field}
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <label htmlFor="admin-password" className={`${label} mb-0`}>
                                Password
                            </label>
                            <button
                                type="button"
                                className="font-mono text-[9px] tracking-[0.14em] uppercase text-mute hover:text-copper transition-colors"
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <input
                            id="admin-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={field}
                        />
                    </div>
                    {needsMfa && (
                        <div className="animate-admin-enter">
                            <label htmlFor="admin-totp" className={label}>
                                Authenticator code
                            </label>
                            <input
                                id="admin-totp"
                                name="totp"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                required
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                className={field}
                            />
                        </div>
                    )}

                    {error && (
                        <p role="alert" className="text-sm text-copper border border-copper/25 bg-copper/5 px-3 py-2 animate-admin-fade">
                            {error}
                        </p>
                    )}
                    <button type="submit" disabled={busy} className={`${btnCopper} w-full py-3 text-[11px] tracking-[0.2em]`}>
                        {busy ? 'Signing in…' : needsMfa ? 'Verify & sign in' : 'Sign in'}
                    </button>
                </form>
                <p className="mt-6 text-center">
                    <a href="/" className="font-mono text-[10px] tracking-[0.16em] uppercase text-mute hover:text-copper transition-colors">
                        ← Back to site
                    </a>
                </p>
            </div>
        </div>
    );
}
