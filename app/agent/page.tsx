'use client';

import { useAgentStore } from '@/lib/store/useAgentStore';
import { KPIGrid } from '@/components/shared/kpi-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useMemo } from 'react';

export default function AgentDashboard() {
    const { upcoming, pending, completed } = useAgentStore();

    const requestsByStatus = useMemo(() => {
        return {
            UPCOMING: upcoming.length,
            PENDING: pending.filter((r) => r.status === 'PENDING').length,
            CONFIRMED: pending.filter((r) => r.status === 'CONFIRMED').length,
            COMPLETED: completed.length,
        };
    }, [upcoming, pending, completed]);

    return (
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

            <div>
                <h1 className="text-3xl font-bold">Agent Dashboard</h1>
                <p className="text-muted-foreground">Overview of your requests</p>
            </div>

            <KPIGrid>
                <StatCard title="Upcoming Requests" value={requestsByStatus.UPCOMING} />
                <StatCard title="Pending Requests" value={requestsByStatus.PENDING} />
                <StatCard title="Confirmed Requests" value={requestsByStatus.CONFIRMED} />
                <StatCard title="Completed Requests" value={requestsByStatus.COMPLETED} />
            </KPIGrid>
        </div>
    );
}

