import { useState } from 'react';
import Seo from '@/components/Seo';

export default function AdminLogin({ onSubmit, error }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [needsMfa, setNeedsMfa] = useState(false);
    const [busy, setBusy] = useState(false);

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
            className="min-h-screen bg-ivory flex items-center justify-center px-5"
            style={{
                backgroundImage:
                    'radial-gradient(ellipse at 20% 0%, rgba(182,90,50,0.06), transparent 45%), radial-gradient(ellipse at 80% 100%, rgba(23,35,29,0.06), transparent 40%)',
            }}
            data-testid="admin-login"
        >
            <Seo title="Admin Sign In" path="/admin" noIndex />
            <div className="w-full max-w-sm border border-graphite/15 bg-white/90 px-6 py-8">
                <div className="flex items-center gap-3">
                    <img src="/brand/logo-mark-transparent.png" alt="" className="h-8 w-8 object-contain" width={32} height={32} />
                    <div>
                        <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-copper">AITH</p>
                        <h1 className="font-sans text-lg font-extrabold tracking-tight text-forest">Admin portal</h1>
                    </div>
                </div>
                <p className="mt-4 text-sm text-mute">
                    Sign in with a provisioned administrator account. There is no public registration.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
                    <div>
                        <label htmlFor="admin-email" className="block font-mono text-[10px] tracking-[0.2em] uppercase text-mute mb-1.5">
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
                            className="w-full border border-graphite/25 bg-white px-3 py-2.5 text-sm focus:border-copper outline-none focus-visible:ring-1 focus-visible:ring-copper/40"
                        />
                    </div>
                    <div>
                        <label htmlFor="admin-password" className="block font-mono text-[10px] tracking-[0.2em] uppercase text-mute mb-1.5">
                            Password
                        </label>
                        <input
                            id="admin-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-graphite/25 bg-white px-3 py-2.5 text-sm focus:border-copper outline-none focus-visible:ring-1 focus-visible:ring-copper/40"
                        />
                    </div>
                    {needsMfa && (
                        <div>
                            <label htmlFor="admin-totp" className="block font-mono text-[10px] tracking-[0.2em] uppercase text-mute mb-1.5">
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
                                className="w-full border border-graphite/25 bg-white px-3 py-2.5 text-sm focus:border-copper outline-none focus-visible:ring-1 focus-visible:ring-copper/40"
                            />
                        </div>
                    )}

                    {error && (
                        <p role="alert" className="text-sm text-copper border border-copper/25 bg-copper/5 px-3 py-2">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full bg-copper text-ivory font-mono text-[11px] tracking-[0.2em] uppercase py-3 hover:bg-copper/90 disabled:opacity-60"
                    >
                        {busy ? 'Signing in…' : needsMfa ? 'Verify & sign in' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
