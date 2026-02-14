'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';
import { RoleKey } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const ALLOWED_ROLES: RoleKey[] = ['agent'];

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouterWithLoader()

    const path = usePathname()

    const [tab, setTab] = useState('shipments')

    useEffect(() => {
        const tab = path.split('/').pop() as string;
        console.log('tab: ', tab);

        if (tab?.length && tab != ALLOWED_ROLES[0]) {
            setTab(tab);
        }
    }, [path]);

    const onTabChange = (tab: string) => {
        router.push(`/agent/${tab}`)
    }

    return (
        <AuthGuard allowedRoles={ALLOWED_ROLES}>
            <div className="flex">
                <div className="flex-1">
                    <div className="container max-w-7xl px-6 py-6 mx-auto">
                        {/* {children} */}
                        <div className="space-y-6">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/agent">Agent</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">Agent Dashboard</h1>
                                    <p className="text-muted-foreground">Manage your shipments and operations</p>
                                </div>
                            </div>

                            <Tabs value={tab} onValueChange={onTabChange} className="space-y-6">
                                <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                                    <TabsTrigger value="shipments">SHIPMENTS</TabsTrigger>
                                    <TabsTrigger value="importers">IMPORTERS</TabsTrigger>
                                    <TabsTrigger value="payments">PAYMENTS</TabsTrigger>
                                    <TabsTrigger value="notifications">NOTIFICATIONS</TabsTrigger>
                                    <TabsTrigger value="reports">REPORTS</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}


