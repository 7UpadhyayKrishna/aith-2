import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Seo from '@/components/Seo';
import { changePassword } from '@/services/adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { btn, btnCopper, field, label } from './adminUi';

export default function AdminChangePassword() {
    const { user, logout } = useAdminAuth();
    const outlet = useOutletContext();
    const [currentPassword, setCurrent] = useState('');
    const [newPassword, setNew] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [ok, setOk] = useState('');
    const [busy, setBusy] = useState(false);
    const forced = Boolean(user?.mustChangePassword);
    const embedded = Boolean(outlet?.setPageTitle) && !forced;

    useEffect(() => {
        if (embedded) {
            outlet.setPageTitle('Change password');
            outlet.setHeaderActions?.(null);
        }
    }, [embedded, outlet]);

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setOk('');
        if (newPassword !== confirm) {
            setError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 15) {
            setError('New password must be at least 15 characters.');
            return;
        }
        setBusy(true);
        try {
            await changePassword(currentPassword, newPassword);
            setOk('Password updated. Sign in again with your new password.');
            setTimeout(() => logout(), 1200);
        } catch (err) {
            setError(err.message || 'Unable to change password.');
        } finally {
            setBusy(false);
        }
    }

    const form = (
        <form
            onSubmit={onSubmit}
            className={`${
                embedded ? 'max-w-md border border-graphite/15 bg-white p-6' : 'w-full max-w-md border border-graphite/15 bg-white p-6'
            } space-y-4`}
        >
            {!embedded && <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-copper">AITH Admin</p>}
            <h1 className={embedded ? 'font-serif text-2xl text-forest tracking-tight' : 'text-2xl font-extrabold tracking-tight'}>
                {forced ? 'Password update required' : 'Change password'}
            </h1>
            {forced && (
                <p className="text-sm text-mute">
                    Your account was flagged for a stronger password policy. Update it before using the CMS.
                </p>
            )}
            {error && (
                <p className="text-sm text-copper border border-copper/25 bg-copper/5 px-3 py-2" role="alert">
                    {error}
                </p>
            )}
            {ok && <p className="text-sm text-forest border border-forest/20 bg-forest/5 px-3 py-2">{ok}</p>}
            <div>
                <label className={label} htmlFor="cp-current">
                    Current password
                </label>
                <input
                    id="cp-current"
                    type="password"
                    autoComplete="current-password"
                    className={field}
                    value={currentPassword}
                    onChange={(e) => setCurrent(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className={label} htmlFor="cp-new">
                    New password (min 15)
                </label>
                <input
                    id="cp-new"
                    type="password"
                    autoComplete="new-password"
                    className={field}
                    value={newPassword}
                    onChange={(e) => setNew(e.target.value)}
                    required
                    minLength={15}
                    maxLength={128}
                />
            </div>
            <div>
                <label className={label} htmlFor="cp-confirm">
                    Confirm new password
                </label>
                <input
                    id="cp-confirm"
                    type="password"
                    autoComplete="new-password"
                    className={field}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={15}
                    maxLength={128}
                />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
                <button type="submit" className={btnCopper} disabled={busy}>
                    {busy ? 'Saving…' : 'Update password'}
                </button>
                {embedded ? (
                    <Link to="/admin" className={btn}>
                        Cancel
                    </Link>
                ) : (
                    !forced && (
                        <button type="button" className={btn} onClick={() => logout()}>
                            Cancel / sign out
                        </button>
                    )
                )}
            </div>
        </form>
    );

    if (embedded) {
        return <div data-testid="admin-change-password">{form}</div>;
    }

    return (
        <div className="min-h-screen bg-ivory flex items-center justify-center px-4 animate-admin-fade" data-testid="admin-change-password">
            <Seo title="Change password" path="/admin/change-password" noIndex />
            {form}
        </div>
    );
}
