'use client';

import { useRoleStore } from '@/lib/store/useRoleStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SideNav } from '@/components/nav/side-nav';

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentRole } = useRoleStore();
    const router = useRouter();

    useEffect(() => {
        if (currentRole !== 'agent') {
            router.push('/');
        }
    }, [currentRole, router]);

    if (currentRole !== 'agent') {
        return null;
    }

    return (
        <div className="flex">
            <SideNav role="agent" />
            <div className="flex-1">
                <div className="container max-w-7xl px-6 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

