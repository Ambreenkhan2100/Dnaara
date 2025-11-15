'use client';

import { format } from 'date-fns';
import { DataTable } from './data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import type { Importer, Agent, Admin } from '@/types';

type User = Importer | Agent | Admin;

interface UsersTableProps {
    data: User[];
    onView?: (user: User) => void;
    onViewDocs?: (user: User) => void;
    actions?: (user: User) => React.ReactNode;
    searchPlaceholder?: string;
    filterSlot?: React.ReactNode;
}

export function UsersTable({
    data,
    onView,
    onViewDocs,
    actions,
    searchPlaceholder = 'Search users...',
    filterSlot,
}: UsersTableProps) {
    const getUserDisplayName = (user: User): string => {
        if ('businessName' in user) return user.businessName;
        if ('companyName' in user) return user.companyName;
        return user.name;
    };

    const getUserType = (user: User): string => {
        if ('role' in user && user.role === 'admin') return 'Admin';
        if ('businessName' in user) return 'Importer';
        if ('companyName' in user) return 'Agent';
        return 'Unknown';
    };

    return (
        <DataTable
            data={data}
            columns={[
                {
                    header: 'Name / Company',
                    accessor: (row) => getUserDisplayName(row),
                },
                {
                    header: 'Email',
                    accessor: 'email',
                },
                {
                    header: 'Type',
                    accessor: (row) => getUserType(row),
                },
                {
                    header: 'Status',
                    accessor: (row) => <StatusBadge status={row.status} />,
                },
                {
                    header: 'Created',
                    accessor: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy'),
                },
            ]}
            searchKey="email"
            searchPlaceholder={searchPlaceholder}
            filterSlot={filterSlot}
            actionsSlot={(row) => (
                <>
                    {onView && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(row)}
                            aria-label="View user"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                    {onViewDocs && ('documents' in row) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDocs(row)}
                            aria-label="View documents"
                        >
                            <FileText className="h-4 w-4" />
                        </Button>
                    )}
                    {actions && actions(row)}
                </>
            )}
            emptyMessage="No users found"
        />
    );
}

