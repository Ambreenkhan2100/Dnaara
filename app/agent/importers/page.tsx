'use client';

import { useAgentStore } from '@/lib/store/useAgentStore';
import { DataTable } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';

export default function AgentImportersPage() {
    const { linkedImporters } = useAgentStore();

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent">Agent</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Importers</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Linked Importers</h1>
                <p className="text-muted-foreground">View your linked importers</p>
            </div>

            <DataTable
                data={linkedImporters}
                columns={[
                    {
                        header: 'Name',
                        accessor: 'name',
                    },
                    {
                        header: 'CR Number',
                        accessor: 'crNumber',
                    },
                    {
                        header: 'Status',
                        accessor: (row) => <StatusBadge status={row.status} />,
                    },
                ]}
                emptyMessage="No importers linked"
            />
        </div>
    );
}