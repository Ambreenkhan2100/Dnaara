'use client';

import { useRoleStore } from '@/lib/store/useRoleStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SideNav } from '@/components/nav/side-nav';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentRole } = useRoleStore();
    const router = useRouter();

    useEffect(() => {
        if (currentRole !== 'admin') {
            router.push('/');
        }
    }, [currentRole, router]);

    if (currentRole !== 'admin') {
        return null;
    }

    return (
        <div className="flex">
            <SideNav role="admin" />
            <div className="flex-1">
                <div className="container max-w-7xl px-6 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

