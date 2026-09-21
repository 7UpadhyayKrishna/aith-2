import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { systemStatus } from '@/services/adminApi';
import { ErrorBanner, LoadingBlock, fmtDateTime, panel, sectionTitle } from './adminUi';

function flag(v) {
    if (v === true) return 'YES';
    if (v === false) return 'NO';
    return v ?? '-';
}

function StatusPill({ ok, label }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase ${
                ok ? 'text-emerald-800' : 'text-copper'
            }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-700' : 'bg-copper'}`} aria-hidden />
            {label}
        </span>
    );
}

export default function AdminSystem() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPageTitle('System health');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    useEffect(() => {
        systemStatus()
            .then(setData)
            .catch((err) => setError(err.status === 403 ? 'Admin role required.' : err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingBlock label="Checking system…" />;
    if (error) return <ErrorBanner>{error}</ErrorBanner>;

    const rows = [
        ['Environment', data.environment],
        ['API version', data.apiVersion],
        ['Frontend version', data.frontendVersion],
        ['API', data.api],
        ['Database', data.database],
        ['SMTP', data.smtp],
        ['Last admin login', fmtDateTime(data.lastSuccessfulAdminLogin)],
        ['Health path', data.healthPath],
        ['MFA', data.mfa],
    ];

    const readiness = data.productionReadiness || {};
    const readinessRows = [
        ['Database configured', flag(readiness.databaseConfigured ?? readiness.mongoConfigured)],
        ['SMTP configured', flag(readiness.smtpConfigured)],
        ['Secure cookies', flag(readiness.secureCookiesEnabled)],
        ['Session secret set', flag(readiness.sessionSecretConfigured)],
        ['CORS explicit', flag(readiness.corsExplicit)],
        ['Legal draft mode', flag(readiness.legalDraftMode)],
        ['Blog sitemap (API)', readiness.blogSitemapPath],
        ['Blog sitemap (public)', readiness.blogSitemapPublicHint],
        ['Admin MFA', readiness.adminMfa],
        ['Site origin', readiness.siteOrigin],
    ];

    return (
        <div className="max-w-2xl space-y-8" data-testid="admin-system">
            <div className="flex flex-wrap gap-4">
                <StatusPill ok={data.api === 'ONLINE'} label={`API ${data.api}`} />
                <StatusPill ok={data.database === 'CONNECTED'} label={`DB ${data.database}`} />
                <StatusPill ok={data.smtp === 'enabled'} label={`SMTP ${data.smtp}`} />
            </div>

            <div className={`${panel} divide-y divide-graphite/10`}>
                {rows.map(([k, v]) => (
                    <div key={k} className="px-4 py-3 flex justify-between gap-4 text-sm">
                        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-mute">{k}</span>
                        <span className="font-medium text-right break-all">{v ?? '-'}</span>
                    </div>
                ))}
            </div>

            <section>
                <h2 className={`${sectionTitle} mb-3`}>Production readiness (safe flags only)</h2>
                <div className={`${panel} divide-y divide-graphite/10`}>
                    {readinessRows.map(([k, v]) => (
                        <div key={k} className="px-4 py-3 flex justify-between gap-4 text-sm">
                            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-mute">{k}</span>
                            <span className="font-medium text-right break-all">{v ?? '-'}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-3 text-xs text-mute">
                    Secret values are never shown. Proxy <code className="font-mono">/blog-sitemap.xml</code> to the API
                    in production.
                </p>
            </section>

            <p className="text-xs text-mute">
                Session cookies are HttpOnly. CSRF uses <code className="font-mono">aith_admin_csrf</code>. Never store
                passwords or tokens in localStorage.
            </p>
        </div>
    );
}
