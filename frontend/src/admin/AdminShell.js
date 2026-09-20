import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import { dashboard as fetchDashboard } from '@/services/adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { btnCopper } from './adminUi';

const NAV = [
    {
        section: 'Overview',
        items: [{ to: '/admin', label: 'Dashboard', end: true }],
    },
    {
        section: 'Content',
        items: [
            { to: '/admin/blogs', label: 'Blogs' },
            { to: '/admin/blogs/calendar', label: 'Calendar' },
        ],
    },
    {
        section: 'Operations',
        adminOnly: true,
        items: [
            { to: '/admin/enquiries', label: 'Enquiries' },
            { to: '/admin/quotes', label: 'Quote Requests' },
            { to: '/admin/careers', label: 'Careers' },
        ],
    },
    {
        section: 'SEO',
        items: [{ to: '/admin/seo', label: 'SEO Health' }],
    },
    {
        section: 'System',
        adminOnly: true,
        items: [
            { to: '/admin/users', label: 'Users' },
            { to: '/admin/audit', label: 'Audit Log' },
            { to: '/admin/system', label: 'System Health' },
        ],
    },
];

function crumbFromPath(pathname) {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/blogs/calendar')) return 'Blogs / Calendar';
    if (pathname.startsWith('/admin/blogs/new')) return 'Blogs / New';
    if (pathname.includes('/preview')) return 'Blogs / Preview';
    if (pathname.includes('/import')) return 'Blogs / Import';
    if (/\/admin\/blogs\/[^/]+$/.test(pathname) && !pathname.endsWith('/blogs')) return 'Blogs / Editing';
    if (pathname.startsWith('/admin/blogs')) return 'Blogs';
    if (pathname.startsWith('/admin/enquiries')) return 'Enquiries';
    if (pathname.startsWith('/admin/quotes')) return 'Quote Requests';
    if (pathname.startsWith('/admin/careers')) return 'Careers';
    if (pathname.startsWith('/admin/seo')) return 'SEO Health';
    if (pathname.startsWith('/admin/users')) return 'Users';
    if (pathname.startsWith('/admin/audit')) return 'Audit Log';
    if (pathname.startsWith('/admin/system')) return 'System Health';
    return 'Admin';
}

export default function AdminShell() {
    const { user, logout } = useAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const [headerActions, setHeaderActions] = useState(null);
    const [health, setHealth] = useState(null);
    const [navOpen, setNavOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    useEffect(() => {
        setNavOpen(false);
        setAccountOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        let cancelled = false;
        fetchDashboard()
            .then((d) => {
                if (!cancelled) setHealth(d.system || null);
            })
            .catch(() => {
                if (!cancelled) setHealth(null);
            });
        return () => {
            cancelled = true;
        };
    }, [location.pathname]);

    const breadcrumb = useMemo(() => crumbFromPath(location.pathname), [location.pathname]);
    const dbOk = health?.database === 'CONNECTED';
    const apiOk = health?.api === 'ONLINE';
    const showNewBlog = location.pathname.startsWith('/admin') && !location.pathname.includes('/blogs/new');

    const linkCls = ({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 font-mono text-[11px] tracking-[0.14em] uppercase border-l-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-copper ${
            isActive
                ? 'border-copper text-ivory bg-ivory/5'
                : 'border-transparent text-ivory/65 hover:text-ivory hover:bg-ivory/5'
        }`;

    const sidebar = (
        <aside
            className={`bg-forest text-ivory flex flex-col h-full ${
                collapsed ? 'w-[4.25rem]' : 'w-56'
            } transition-[width] duration-150`}
            data-testid="admin-sidebar"
        >
            <div className={`border-b border-ivory/10 ${collapsed ? 'px-2 py-4' : 'px-4 py-5'}`}>
                <Link to="/admin" className="font-mono text-[11px] tracking-[0.24em] uppercase text-copper">
                    {collapsed ? 'AITH' : 'AITH Admin'}
                </Link>
                {!collapsed && <p className="mt-2 text-xs text-ivory/45 leading-snug">Content & operations</p>}
            </div>
            <nav className="flex-1 overflow-y-auto py-3" aria-label="Admin">
                {NAV.filter((group) => !group.adminOnly || user?.role === 'admin').map((group) => (
                    <div key={group.section} className="mb-3">
                        {!collapsed && (
                            <p className="px-4 mb-1 font-mono text-[9px] tracking-[0.28em] uppercase text-ivory/35">
                                {group.section}
                            </p>
                        )}
                        {group.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={linkCls}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className={collapsed ? 'mx-auto' : ''}>{collapsed ? item.label.slice(0, 1) : item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
            <div className={`border-t border-ivory/10 ${collapsed ? 'p-2' : 'px-4 py-4'} space-y-2`}>
                <button
                    type="button"
                    className="hidden lg:block w-full text-left font-mono text-[9px] tracking-[0.16em] uppercase text-ivory/45 hover:text-ivory"
                    onClick={() => setCollapsed((v) => !v)}
                    aria-pressed={collapsed}
                >
                    {collapsed ? '»' : 'Collapse'}
                </button>
                <a href="/" className="block font-mono text-[10px] tracking-[0.12em] uppercase text-ivory/45 hover:text-ivory">
                    {collapsed ? '↗' : '← Public site'}
                </a>
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-ivory text-graphite flex" data-testid="admin-shell">
            <Seo title={`${pageTitle} - Admin`} path={location.pathname} noIndex />

            {/* Desktop sidebar */}
            <div className="hidden md:block sticky top-0 self-start h-screen">{sidebar}</div>

            {/* Mobile drawer */}
            {navOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Admin navigation">
                    <button
                        type="button"
                        className="absolute inset-0 bg-forest/40"
                        aria-label="Close navigation"
                        onClick={() => setNavOpen(false)}
                    />
                    <div className="relative z-10 h-full shadow-xl">{sidebar}</div>
                </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col">
                <header className="sticky top-0 z-20 bg-ivory/95 backdrop-blur-sm border-b border-graphite/15 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                        <button
                            type="button"
                            className="md:hidden border border-graphite/20 px-2 py-1 font-mono text-[10px] uppercase tracking-widest"
                            onClick={() => setNavOpen(true)}
                            aria-expanded={navOpen}
                        >
                            Menu
                        </button>
                        <div className="min-w-0">
                            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-mute truncate">{breadcrumb}</p>
                            <h1 className="font-sans text-base sm:text-lg font-extrabold tracking-tight truncate">{pageTitle}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {headerActions}
                        {showNewBlog && (
                            <button
                                type="button"
                                onClick={() => navigate('/admin/blogs/new')}
                                className={`${btnCopper} hidden sm:inline-flex`}
                            >
                                + New Blog
                            </button>
                        )}
                        <span
                            className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-mute"
                            title={apiOk && dbOk ? 'API and database reachable' : 'Check System Health'}
                        >
                            <span
                                className={`w-1.5 h-1.5 ${apiOk && dbOk ? 'bg-emerald-700' : 'bg-copper'}`}
                                aria-hidden
                            />
                            <span className="hidden sm:inline">API</span>
                        </span>
                        <div className="relative">
                            <button
                                type="button"
                                className="font-mono text-[10px] tracking-[0.12em] uppercase text-mute hover:text-graphite border border-graphite/15 px-2 py-1.5"
                                onClick={() => setAccountOpen((v) => !v)}
                                aria-expanded={accountOpen}
                                aria-haspopup="menu"
                            >
                                {(user?.displayName || user?.email || 'Admin').split('@')[0]} ▾
                            </button>
                            {accountOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 mt-1 w-48 border border-graphite/15 bg-white shadow-sm py-1 z-30"
                                >
                                    <p className="px-3 py-2 font-mono text-[10px] text-mute truncate border-b border-graphite/10">
                                        {user?.email}
                                    </p>
                                    <Link
                                        role="menuitem"
                                        to="/admin/system"
                                        className="block px-3 py-2 text-sm hover:bg-bone/60"
                                        onClick={() => setAccountOpen(false)}
                                    >
                                        System health
                                    </Link>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-bone/60 text-copper"
                                        onClick={() => logout()}
                                        data-testid="admin-logout"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 px-4 lg:px-8 py-5 lg:py-6">
                    <Outlet context={{ setPageTitle, setHeaderActions, health, breadcrumb }} />
                </main>
            </div>
        </div>
    );
}
