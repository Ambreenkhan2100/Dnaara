'use client';

import { useImporterStore } from '@/lib/store/useImporterStore';
import { KPIGrid } from '@/components/shared/kpi-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useMemo } from 'react';

export default function ImporterDashboard() {
    const { requests, linkedAgents, walletBalance } = useImporterStore();

    const requestsByStatus = useMemo(() => {
        return {
            UPCOMING: requests.filter((r) => r.status === 'UPCOMING').length,
            PENDING: requests.filter((r) => r.status === 'PENDING').length,
            CONFIRMED: requests.filter((r) => r.status === 'CONFIRMED').length,
            COMPLETED: requests.filter((r) => r.status === 'COMPLETED').length,
        };
    }, [requests]);

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer">Importer</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Importer Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your import requests</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Wallet Balance</div>
                    <div className="text-2xl font-bold">AED {walletBalance.toLocaleString()}</div>
                </div>
            </div>

            <KPIGrid>
                <StatCard title="Upcoming Requests" value={requestsByStatus.UPCOMING} />
                <StatCard title="Pending Requests" value={requestsByStatus.PENDING} />
                <StatCard title="Confirmed Requests" value={requestsByStatus.CONFIRMED} />
                <StatCard title="Completed Requests" value={requestsByStatus.COMPLETED} />
            </KPIGrid>

            <KPIGrid>
                <StatCard title="Total Agents" value={linkedAgents.length} />
            </KPIGrid>
        </div>
    );
}

