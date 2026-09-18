import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { listUsers, createUser, disableUser } from '@/services/adminApi';
import { useAdminAuth } from './AdminAuthContext';

const field = 'w-full border border-graphite/20 bg-white px-2.5 py-2 text-sm outline-none focus:border-copper';
const btn =
    'px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase border border-graphite/25 hover:border-copper disabled:opacity-40';
const btnPrimary =
    'px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase bg-forest text-ivory hover:bg-forest/90 disabled:opacity-40';

export default function AdminUsers() {
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const { user: me } = useAdminAuth();
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
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
        try {
            await createUser(form);
            setForm({ email: '', displayName: '', password: '', role: 'editor' });
            await load();
        } catch (err) {
            alert(err.message);
        }
    }

    async function onDisable(id) {
        if (!window.confirm('Disable this user and revoke sessions?')) return;
        try {
            await disableUser(id);
            await load();
        } catch (err) {
            alert(err.message);
        }
    }

    if (loading) return <p className="font-mono text-[11px] uppercase tracking-widest text-mute">Loading…</p>;
    if (error) return <p className="text-copper text-sm">{error}</p>;

    return (
        <div className="space-y-6 max-w-3xl" data-testid="admin-users">
            <div className="border border-graphite/15 bg-white overflow-x-auto">
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
                            <tr key={u.id} className="border-b border-graphite/8">
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

            <form onSubmit={onCreate} className="border border-graphite/15 bg-white p-4 space-y-3">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-mute">Create user</p>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block font-mono text-[9px] tracking-widest uppercase text-mute mb-1" htmlFor="nu-email">
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
                        <label className="block font-mono text-[9px] tracking-widest uppercase text-mute mb-1" htmlFor="nu-name">
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
                        <label className="block font-mono text-[9px] tracking-widest uppercase text-mute mb-1" htmlFor="nu-pass">
                            Password (15+ passphrase)
                        </label>
                        <input
                            id="nu-pass"
                            required
                            type="password"
                            minLength={15}
                            maxLength={128}
                            className={field}
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            autoComplete="new-password"
                        />
                        <p className="mt-1 text-xs text-mute">Prefer a long passphrase. No forced symbol/case rules.</p>
                    </div>
                    <div>
                        <label className="block font-mono text-[9px] tracking-widest uppercase text-mute mb-1" htmlFor="nu-role">
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
                <button type="submit" className={btnPrimary}>
                    Create
                </button>
            </form>
        </div>
    );
}
