'use client';

import { AuthGuard } from '@/components/auth/auth-guard';

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard allowedRoles={['agent']}>
            <div className="flex">
                <div className="flex-1">
                    <div className="container max-w-7xl px-6 py-6 mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}


