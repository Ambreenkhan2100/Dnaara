'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { SideNav } from '@/components/nav/side-nav';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="flex">
                <SideNav role="admin" />
                <div className="flex-1">
                    <div className="container max-w-7xl px-6 py-6">
                        {children}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}


