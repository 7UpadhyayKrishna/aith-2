import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import * as api from '@/services/adminApi';
import { AdminAuthContext } from './AdminAuthContext';
import AdminShell from './AdminShell';
import AdminLogin from './AdminLogin';
import AdminChangePassword from './AdminChangePassword';
import AdminDashboard from './AdminDashboard';
import AdminBlogs from './AdminBlogs';
import AdminBlogEditor from './AdminBlogEditor';
import AdminBlogPreview from './AdminBlogPreview';
import AdminBlogImport from './AdminBlogImport';
import AdminBlogCalendar from './AdminBlogCalendar';
import AdminEnquiries from './AdminEnquiries';
import AdminQuotes from './AdminQuotes';
import AdminCareers from './AdminCareers';
import AdminSeo from './AdminSeo';
import AdminUsers from './AdminUsers';
import AdminAudit from './AdminAudit';
import AdminSystem from './AdminSystem';

export { useAdminAuth } from './AdminAuthContext';

export default function AdminApp() {
    const [user, setUser] = useState(null);
    const [bootstrapping, setBootstrapping] = useState(true);
    const [authError, setAuthError] = useState('');
    const [sessionExpired, setSessionExpired] = useState(false);
    const navigate = useNavigate();

    const refreshMe = useCallback(async () => {
        const data = await api.me();
        setUser(data.user);
        return data.user;
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await api.me();
                if (!cancelled) setUser(data.user);
            } catch {
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setBootstrapping(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleLogin = useCallback(
        async (email, password, totpCode) => {
            setAuthError('');
            setSessionExpired(false);
            try {
                const data = await api.login(email, password, totpCode);
                if (data?.mfaRequired && !data?.ok) {
                    setAuthError(data.message || 'Authenticator code required.');
                    const err = new Error('MFA_REQUIRED');
                    err.mfaRequired = true;
                    throw err;
                }
                setUser(data.user);
                if (data.user?.mustChangePassword) {
                    navigate('/admin/change-password', { replace: true });
                } else {
                    navigate('/admin', { replace: true });
                }
            } catch (err) {
                if (err?.mfaRequired) throw err;
                const status = err?.status;
                if (status === 401) {
                    setAuthError('Invalid credentials.');
                } else if (status === 429) {
                    setAuthError('Too many login attempts. Please wait a minute and try again.');
                } else if (status === 404 || status === 502 || status === 0 || !status) {
                    setAuthError(
                        'Admin service unavailable. Start the FastAPI backend and ensure /api is proxied.'
                    );
                } else {
                    setAuthError('Unable to sign in. Please try again.');
                }
                throw err;
            }
        },
        [navigate]
    );

    const handleLogout = useCallback(async () => {
        try {
            await api.logout();
        } catch {
            /* clear local auth regardless */
        }
        setUser(null);
        navigate('/admin', { replace: true });
    }, [navigate]);

    const handleSessionExpired = useCallback(() => {
        setUser(null);
        setSessionExpired(true);
        setAuthError('Your admin session expired. Please sign in again.');
    }, []);

    const value = useMemo(
        () => ({
            user,
            refreshMe,
            logout: handleLogout,
            login: handleLogin,
            authError,
            setAuthError,
            sessionExpired,
            onSessionExpired: handleSessionExpired,
        }),
        [user, refreshMe, handleLogout, handleLogin, authError, sessionExpired, handleSessionExpired]
    );

    if (bootstrapping) {
        return (
            <div className="min-h-screen bg-ivory flex items-center justify-center" aria-busy="true">
                <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-mute">Loading admin…</p>
            </div>
        );
    }

    if (!user) {
        return (
            <AdminAuthContext.Provider value={value}>
                <AdminLogin onSubmit={handleLogin} error={authError} />
            </AdminAuthContext.Provider>
        );
    }

    if (user.mustChangePassword) {
        return (
            <AdminAuthContext.Provider value={value}>
                <AdminChangePassword />
            </AdminAuthContext.Provider>
        );
    }

    return (
        <AdminAuthContext.Provider value={value}>
            <Routes>
                <Route element={<AdminShell />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="blogs/new" element={<AdminBlogEditor />} />
                    <Route path="blogs/import" element={<AdminBlogImport />} />
                    <Route path="blogs/calendar" element={<AdminBlogCalendar />} />
                    <Route path="blogs/:id" element={<AdminBlogEditor />} />
                    <Route path="blogs/:id/preview" element={<AdminBlogPreview />} />
                    <Route path="enquiries" element={<AdminEnquiries />} />
                    <Route path="quotes" element={<AdminQuotes />} />
                    <Route path="careers" element={<AdminCareers />} />
                    <Route path="seo" element={<AdminSeo />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="audit" element={<AdminAudit />} />
                    <Route path="system" element={<AdminSystem />} />
                    <Route path="change-password" element={<AdminChangePassword />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
            </Routes>
        </AdminAuthContext.Provider>
    );
}
