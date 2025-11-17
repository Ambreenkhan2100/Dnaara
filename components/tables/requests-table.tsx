'use client';

import { format } from 'date-fns';
import { DataTable } from './data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { Request } from '@/types';

interface RequestsTableProps {
    data: Request[];
    onView?: (request: Request) => void;
    actions?: (request: Request) => React.ReactNode;
    searchPlaceholder?: string;
    filterSlot?: React.ReactNode;
    emptyMessage?: string;
}

export function RequestsTable({
    data,
    onView,
    actions,
    searchPlaceholder = 'Search requests...',
    filterSlot,
    emptyMessage = 'No requests found',
}: RequestsTableProps) {
    return (
        <DataTable
            data={data}
            columns={[
                {
                    header: 'ID',
                    accessor: 'id',
                },
                {
                    header: 'Importer',
                    accessor: 'importerName',
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
            searchKey="id"
            searchPlaceholder={searchPlaceholder}
            filterSlot={filterSlot}
            actionsSlot={(row) => (
                <>
                    {onView && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(row)}
                            aria-label="View request"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                    {actions && actions(row)}
                </>
            )}
            emptyMessage={emptyMessage}
        />
    );
}

