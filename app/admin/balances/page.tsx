'use client';

import { useState } from 'react';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { importers } from '@/lib/mock/users';
import { format } from 'date-fns';

export default function AdminBalancesPage() {
    const { balances, adjustBalance } = useAdminStore();
    const [adjustDialog, setAdjustDialog] = useState<{
        open: boolean;
        importerId: string | null;
        amount: string;
    }>({
        open: false,
        importerId: null,
        amount: '',
    });

    const balanceData = balances.map((bal) => {
        const importer = importers.find((i) => i.id === bal.importerId);
        return {
            ...bal,
            importerName: importer?.name || 'Unknown',
            businessName: importer?.businessName || '—',
        };
    });

    const handleAdjust = () => {
        if (adjustDialog.importerId && adjustDialog.amount) {
            adjustBalance(adjustDialog.importerId, parseFloat(adjustDialog.amount));
            toast.success('Balance adjusted');
            setAdjustDialog({ open: false, importerId: null, amount: '' });
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Balances</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Importer Balances</h1>
                <p className="text-muted-foreground">View and manage importer wallet balances</p>
            </div>

            <DataTable
                data={balanceData}
                columns={[
                    {
                        header: 'Importer',
                        accessor: 'importerName',
                    },
                    {
                        header: 'Business Name',
                        accessor: 'businessName',
                    },
                    {
                        header: 'Available Balance',
                        accessor: (row) => `AED ${row.available.toLocaleString()}`,
                    },
                    {
                        header: 'Last Updated',
                        accessor: (row) => format(new Date(row.lastUpdated), 'MMM dd, yyyy HH:mm'),
                    },
                ]}
                actionsSlot={(row) => (
                    <Dialog
                        open={adjustDialog.open && adjustDialog.importerId === row.importerId}
                        onOpenChange={(open) =>
                            setAdjustDialog({ open, importerId: open ? row.importerId : null, amount: '' })
                        }
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                Adjust Balance
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Adjust Balance</DialogTitle>
                                <DialogDescription>
                                    Update balance for {row.importerName}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>New Balance (AED)</Label>
                                    <Input
                                        type="number"
                                        value={adjustDialog.amount}
                                        onChange={(e) =>
                                            setAdjustDialog({ ...adjustDialog, amount: e.target.value })
                                        }
                                        placeholder="0.00"
                                    />
                                </div>
                                <Button
                                    onClick={handleAdjust}
                                    className="w-full"
                                    style={{ backgroundColor: '#0bad85' }}
                                >
                                    Update Balance
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
                emptyMessage="No balances found"
            />
        </div>
    );
}

