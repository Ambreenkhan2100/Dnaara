'use client';

import { useImporterStore } from '@/lib/store/useImporterStore';
import { DataTable } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { CreateRequestDrawer } from '@/components/forms/create-request-drawer';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { format } from 'date-fns';

export default function ImporterUpcomingPage() {
    const { requests } = useImporterStore();
    const upcomingRequests = requests.filter((r) => r.status === 'UPCOMING');

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer">Importer</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Upcoming</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Upcoming Requests</h1>
                    <p className="text-muted-foreground">Create and manage upcoming import requests</p>
                </div>
                <CreateRequestDrawer />
            </div>

            <DataTable
                data={upcomingRequests}
                columns={[
                    {
                        header: 'ID',
                        accessor: 'id',
                    },
                    {
                        header: 'Pre-Bayan Number',
                        accessor: (row) => row.preBayanNumber || '—',
                    },
                    {
                        header: 'Waybill Number',
                        accessor: (row) => row.waybillNumber || '—',
                    },
                    {
                        header: 'Agent',
                        accessor: (row) => row.agentName || '—',
                    },
                    {
                        header: 'Date',
                        accessor: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy'),
                    },
                    {
                        header: 'Status',
                        accessor: (row) => <StatusBadge status={row.status} />,
                    },
                ]}
                emptyMessage="No upcoming requests"
            />
        </div>
    );
}

