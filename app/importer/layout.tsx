'use client';

import { useRoleStore } from '@/lib/store/useRoleStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
            <div className="flex-1">
                <div className="container max-w-7xl px-6 py-6 mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

