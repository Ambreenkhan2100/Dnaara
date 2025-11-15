'use client';

import { useImporterStore } from '@/lib/store/useImporterStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/tables/data-table';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { format } from 'date-fns';

const mockActivity = [
    {
        id: 'act1',
        type: 'Payment',
        amount: -15000,
        description: 'Payment for request req-001',
        date: '2024-01-25T14:30:00Z',
    },
    {
        id: 'act2',
        type: 'Deposit',
        amount: 50000,
        description: 'Wallet top-up',
        date: '2024-01-20T10:00:00Z',
    },
];

export default function ImporterWalletPage() {
    const { walletBalance } = useImporterStore();

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer">Importer</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Wallet</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Wallet</h1>
                <p className="text-muted-foreground">View your wallet balance and activity</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">AED {walletBalance.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground mt-2">Read-only (backend integration pending)</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={mockActivity}
                        columns={[
                            {
                                header: 'Date',
                                accessor: (row) => format(new Date(row.date), 'MMM dd, yyyy HH:mm'),
                            },
                            {
                                header: 'Type',
                                accessor: 'type',
                            },
                            {
                                header: 'Description',
                                accessor: 'description',
                            },
                            {
                                header: 'Amount',
                                accessor: (row) => (
                                    <span className={row.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {row.amount > 0 ? '+' : ''}AED {row.amount.toLocaleString()}
                                    </span>
                                ),
                            },
                        ]}
                        emptyMessage="No activity found"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

