import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import * as api from '@/services/adminApi';
import { btn, ErrorBanner, LoadingBlock, panel, sectionTitle, fmtDateTime } from './adminUi';
import { BackLink, RecordHeader } from './AdminRecordPage';
import { useAdminAuth } from './AdminAuthContext';

/**
 * Account → Security: password link, sessions, MFA structure only when enabled.
 */
export default function AdminSecurity() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const { user } = useAdminAuth();
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ mfaEnabledGlobally: false, mfaEnabledForUser: false });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [revoking, setRevoking] = useState(false);

    useEffect(() => {
        setPageTitle('Security');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.listSessions();
            setItems(data.items || []);
            setMeta({
                mfaEnabledGlobally: !!data.mfaEnabledGlobally,
                mfaEnabledForUser: !!data.mfaEnabledForUser,
            });
        } catch (err) {
            setError(err.message || 'Failed to load sessions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function revokeOthers() {
        if (!window.confirm('Sign out all other sessions for this account?')) return;
        setRevoking(true);
        try {
            const res = await api.revokeOtherSessions();
            toast.success(`Signed out ${res.revoked || 0} other session(s)`);
            await load();
        } catch (err) {
            setError(err.message || 'Revoke failed');
        } finally {
            setRevoking(false);
        }
    }

    return (
        <div className="space-y-5 max-w-2xl animate-admin-enter" data-testid="admin-security">
            <BackLink to="/admin">Dashboard</BackLink>
            <RecordHeader
                eyebrow="Account"
                title="Security"
                subtitle={user?.email || undefined}
            />

            <section className={`${panel} p-5 space-y-3`}>
                <p className={sectionTitle}>Password</p>
                <p className="text-sm text-mute">Changing your password signs out every session, including this one.</p>
                <Link
                    to="/admin/change-password"
                    className={`${btn} inline-flex font-mono text-[11px] tracking-widest uppercase`}
                >
                    Change password
                </Link>
            </section>

            <section className={`${panel} p-5 space-y-4`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={sectionTitle}>Sessions</p>
                    <button type="button" className={btn} disabled={revoking || loading} onClick={revokeOthers}>
                        {revoking ? 'Signing out…' : 'Sign out other sessions'}
                    </button>
                </div>
                {error ? <ErrorBanner>{error}</ErrorBanner> : null}
                {loading ? (
                    <LoadingBlock label="Loading sessions…" />
                ) : items.length === 0 ? (
                    <p className="text-sm text-mute">No active sessions found.</p>
                ) : (
                    <ul className="divide-y divide-graphite/10">
                        {items.map((s) => (
                            <li key={s.id} className="py-3 text-sm">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="font-medium text-forest">
                                        {s.current ? 'Current session' : 'Other session'}
                                    </p>
                                    <p className="font-mono text-[10px] text-mute">{s.ip || '—'}</p>
                                </div>
                                <p className="text-mute text-xs mt-1">
                                    Last active {fmtDateTime(s.lastUsedAt) || '—'} · Created{' '}
                                    {fmtDateTime(s.createdAt) || '—'}
                                </p>
                                {s.userAgent ? (
                                    <p className="text-[11px] text-mute mt-1 truncate" title={s.userAgent}>
                                        {s.userAgent}
                                    </p>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {meta.mfaEnabledGlobally ? (
                <section className={`${panel} p-5 space-y-2`}>
                    <p className={sectionTitle}>MFA</p>
                    <p className="text-sm text-mute">
                        {meta.mfaEnabledForUser
                            ? 'Authenticator MFA is enabled on your account.'
                            : 'MFA is available on this deployment. Setup flows use the existing auth endpoints.'}
                    </p>
                </section>
            ) : null}
        </div>
    );
}
