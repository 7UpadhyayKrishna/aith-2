import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { listUsers, createUser, disableUser } from '@/services/adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { ErrorBanner, LoadingBlock, btn, btnPrimary, field, label, panel, sectionTitle } from './adminUi';
import { RecordHeader } from './AdminRecordPage';

export default function AdminUsers() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const { user: me } = useAdminAuth();
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({
        email: '',
        displayName: '',
        password: '',
        role: 'editor',
    });

    useEffect(() => {
        setPageTitle('Users');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const res = await listUsers();
            setItems(res.items || []);
        } catch (err) {
            setError(err.status === 403 ? 'Admin role required.' : err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function onCreate(e) {
        e.preventDefault();
        setBusy(true);
        try {
            await createUser(form);
            setForm({ email: '', displayName: '', password: '', role: 'editor' });
            await load();
            toast.success('User created');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function onDisable(id) {
        if (!window.confirm('Disable this user and revoke sessions?')) return;
        try {
            await disableUser(id);
            await load();
            toast.success('User disabled');
        } catch (err) {
            toast.error(err.message);
        }
    }

    if (loading) return <LoadingBlock label="Loading users…" />;
    if (error) return <ErrorBanner>{error}</ErrorBanner>;

    return (
        <div className="space-y-6 max-w-3xl" data-testid="admin-users">
            <RecordHeader
                eyebrow="System"
                title="Users"
                subtitle="Provision editors and admins. There is no public signup."
            />

            <div className={`${panel} overflow-x-auto`}>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-graphite/10 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-mute">
                            <th className="px-3 py-2 font-normal">Name</th>
                            <th className="px-3 py-2 font-normal">Email</th>
                            <th className="px-3 py-2 font-normal">Role</th>
                            <th className="px-3 py-2 font-normal">Active</th>
                            <th className="px-3 py-2 font-normal" />
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((u) => (
                            <tr key={u.id} className="border-b border-graphite/8 hover:bg-bone/30 transition-colors">
                                <td className="px-3 py-2.5 font-medium">{u.displayName}</td>
                                <td className="px-3 py-2.5">{u.email}</td>
                                <td className="px-3 py-2.5 font-mono text-[10px] uppercase">{u.role}</td>
                                <td className="px-3 py-2.5">{u.active === false ? 'No' : 'Yes'}</td>
                                <td className="px-3 py-2.5 text-right">
                                    {u.id !== me?.id && u.active !== false && (
                                        <button type="button" className={btn} onClick={() => onDisable(u.id)}>
                                            Disable
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <form onSubmit={onCreate} className={`${panel} p-4 space-y-3`}>
                <p className={sectionTitle}>Create user</p>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label className={label} htmlFor="nu-email">
                            Email
                        </label>
                        <input
                            id="nu-email"
                            required
                            type="email"
                            className={field}
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="nu-name">
                            Display name
                        </label>
                        <input
                            id="nu-name"
                            required
                            className={field}
                            value={form.displayName}
                            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="nu-pass">
                            Password (min 15)
                        </label>
                        <input
                            id="nu-pass"
                            required
                            type="password"
                            minLength={15}
                            className={field}
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="nu-role">
                            Role
                        </label>
                        <select
                            id="nu-role"
                            className={field}
                            value={form.role}
                            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                        >
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className={btnPrimary} disabled={busy}>
                    {busy ? 'Creating…' : 'Create user'}
                </button>
            </form>
        </div>
    );
}
