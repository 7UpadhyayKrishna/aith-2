import { createContext, useContext } from 'react';

export const AdminAuthContext = createContext(null);

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error('useAdminAuth requires AdminApp');
    return ctx;
}
