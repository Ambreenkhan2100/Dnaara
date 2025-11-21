'use client';

import { useAdminStore } from '@/lib/store/useAdminStore';
import { KPIGrid } from '@/components/shared/kpi-grid';
import { StatCard } from '@/components/shared/stat-card';
import { RequestsTable } from '@/components/tables/requests-table';
import { UsersTable } from '@/components/tables/users-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useMemo } from 'react';

export default function AdminDashboard() {
    const { users, requests, balances } = useAdminStore();

    const importers = useMemo(() => users.filter((u) => 'businessName' in u), [users]);
    const agents = useMemo(() => users.filter((u) => 'companyName' in u), [users]);
    const recentRequests = useMemo(() => requests.slice(0, 5), [requests]);
    const recentUsers = useMemo(() => users.slice(0, 5), [users]);

    const totalBalances = useMemo(
        () => balances.reduce((sum, b) => sum + b.available, 0),
        [balances]
    );

    const requestsByStatus = useMemo(() => {
        return {
            ASSIGNED: requests.filter((r) => r.status === 'ASSIGNED').length,
            CONFIRMED: requests.filter((r) => r.status === 'CONFIRMED').length,
            COMPLETED: requests.filter((r) => r.status === 'COMPLETED').length,
        };
    }, [requests]);

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of platform activity</p>
            </div>

            <KPIGrid>
                <StatCard title="Total Importers" value={importers.length} />
                <StatCard title="Total Agents" value={agents.length} />
                <StatCard title="Assigned Requests" value={requestsByStatus.ASSIGNED} />
                <StatCard title="Confirmed Requests" value={requestsByStatus.CONFIRMED} />
                <StatCard title="Completed Requests" value={requestsByStatus.COMPLETED} />
                <StatCard
                    title="Total Balances"
                    value={`AED ${totalBalances.toLocaleString()}`}
                />
            </KPIGrid>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RequestsTable data={recentRequests} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UsersTable data={recentUsers} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

