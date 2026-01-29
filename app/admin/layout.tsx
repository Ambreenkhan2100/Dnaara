'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { SideNav } from '@/components/nav/side-nav';
import { RoleKey } from '@/lib/constants';

const ALLOWED_ROLES: RoleKey[] = ['admin'];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // <AuthGuard allowedRoles={ALLOWED_ROLES}>
        <div className="flex">
            <SideNav role="admin" />
            <div className="flex-1">
                <div className="container max-w-7xl px-6 py-6">
                    {children}
                </div>
            </div>
        </div>
        // </AuthGuard>
    );
}


