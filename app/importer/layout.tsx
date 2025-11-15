'use client';

import { useRoleStore } from '@/lib/store/useRoleStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SideNav } from '@/components/nav/side-nav';

export default function ImporterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentRole } = useRoleStore();
    const router = useRouter();

    useEffect(() => {
        if (currentRole !== 'importer') {
            router.push('/');
        }
    }, [currentRole, router]);

    if (currentRole !== 'importer') {
        return null;
    }

    return (
        <div className="flex">
            <SideNav role="importer" />
            <div className="flex-1">
                <div className="container max-w-7xl px-6 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

