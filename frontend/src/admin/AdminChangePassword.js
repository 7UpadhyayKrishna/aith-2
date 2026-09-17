import { useState } from 'react';
import Seo from '@/components/Seo';
import { changePassword } from '@/services/adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { btnCopper } from './adminUi';

export default function AdminChangePassword() {
    const { user, logout } = useAdminAuth();
    const [currentPassword, setCurrent] = useState('');
    const [newPassword, setNew] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [ok, setOk] = useState('');
    const [busy, setBusy] = useState(false);
    const forced = Boolean(user?.mustChangePassword);

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

    return (
        <div className="min-h-screen bg-ivory flex items-center justify-center px-4" data-testid="admin-change-password">
            <Seo title="Change password" path="/admin/change-password" noIndex />
            <form onSubmit={onSubmit} className="w-full max-w-md border border-graphite/15 bg-white p-6 space-y-4">
                <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-copper">AITH Admin</p>
                <h1 className="text-2xl font-extrabold tracking-tight">
                    {forced ? 'Password update required' : 'Change password'}
                </h1>
                {forced && (
                    <p className="text-sm text-mute">
                        Your account was flagged for a stronger password policy. Update it before using the CMS.
                    </p>
                )}
                {error && <p className="text-sm text-copper">{error}</p>}
                {ok && <p className="text-sm text-forest">{ok}</p>}
                <label className="block text-sm">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Current password</span>
                    <input
                        type="password"
                        autoComplete="current-password"
                        className="mt-1 w-full border border-graphite/20 px-3 py-2"
                        value={currentPassword}
                        onChange={(e) => setCurrent(e.target.value)}
                        required
                    />
                </label>
                <label className="block text-sm">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-mute">New password (min 15)</span>
                    <input
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 w-full border border-graphite/20 px-3 py-2"
                        value={newPassword}
                        onChange={(e) => setNew(e.target.value)}
                        required
                        minLength={15}
                        maxLength={128}
                    />
                </label>
                <label className="block text-sm">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Confirm new password</span>
                    <input
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 w-full border border-graphite/20 px-3 py-2"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        minLength={15}
                        maxLength={128}
                    />
                </label>
                <div className="flex gap-2 pt-2">
                    <button type="submit" className={btnCopper} disabled={busy}>
                        {busy ? 'Saving…' : 'Update password'}
                    </button>
                    {!forced && (
                        <button
                            type="button"
                            className="px-3 py-2 font-mono text-[10px] tracking-[0.14em] uppercase border border-graphite/25"
                            onClick={() => logout()}
                        >
                            Cancel / sign out
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
