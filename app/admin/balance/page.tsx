'use client';

import { useState } from 'react';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { importers, agents } from '@/lib/mock/users';
import { format } from 'date-fns';

export default function AdminBalancePage() {
    const { balances, agentBalances, adjustBalance, adjustAgentBalance } = useAdminStore();
    const [adjustDialog, setAdjustDialog] = useState<{
        open: boolean;
        userId: string | null;
        amount: string;
        type: 'importer' | 'agent';
    }>({
        open: false,
        userId: null,
        amount: '',
        type: 'importer',
    });

    const balanceData = balances.map((bal) => {
        const importer = importers.find((i) => i.id === bal.importerId);
        return {
            ...bal,
            userId: bal.importerId,
            importerName: importer?.name || 'Unknown',
            businessName: importer?.businessName || '—',
        };
    });

    const agentBalanceData = agentBalances.map((bal) => {
        const agent = agents.find((a) => a.id === bal.agentId);
        return {
            ...bal,
            userId: bal.agentId,
            agentName: agent?.name || 'Unknown',
            companyName: agent?.companyName || '—',
        };
    });

    const handleAdjust = () => {
        if (adjustDialog.userId && adjustDialog.amount) {
            if (adjustDialog.type === 'importer') {
                adjustBalance(adjustDialog.userId, parseFloat(adjustDialog.amount));
            } else {
                adjustAgentBalance(adjustDialog.userId, parseFloat(adjustDialog.amount));
            }
            toast.success('Balance adjusted');
            setAdjustDialog({ open: false, userId: null, amount: '', type: 'importer' });
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
                <h1 className="text-3xl font-bold">Balances</h1>
                <p className="text-muted-foreground">View and manage wallet balances</p>
            </div>

            <Tabs defaultValue="importers" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="importers">Importer Balances</TabsTrigger>
                    <TabsTrigger value="agents">Agent Balances</TabsTrigger>
                </TabsList>

                <TabsContent value="importers" className="space-y-4">
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
                                accessor: (row) => `SAR ${row.available.toLocaleString()}`,
                            },
                            {
                                header: 'Last Updated',
                                accessor: (row) => format(new Date(row.lastUpdated), 'MMM dd, yyyy HH:mm'),
                            },
                        ]}
                        actionsSlot={(row) => (
                            <Dialog
                                open={adjustDialog.open && adjustDialog.userId === row.userId && adjustDialog.type === 'importer'}
                                onOpenChange={(open) =>
                                    setAdjustDialog({ open, userId: open ? row.userId : null, amount: '', type: 'importer' })
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
                                            <Label>New Balance (SAR)</Label>
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
                </TabsContent>

                <TabsContent value="agents" className="space-y-4">
                    <DataTable
                        data={agentBalanceData}
                        columns={[
                            {
                                header: 'Agent',
                                accessor: 'agentName',
                            },
                            {
                                header: 'Company Name',
                                accessor: 'companyName',
                            },
                            {
                                header: 'Available Balance',
                                accessor: (row) => `SAR ${row.available.toLocaleString()}`,
                            },
                            {
                                header: 'Last Updated',
                                accessor: (row) => format(new Date(row.lastUpdated), 'MMM dd, yyyy HH:mm'),
                            },
                        ]}
                        actionsSlot={(row) => (
                            <Dialog
                                open={adjustDialog.open && adjustDialog.userId === row.userId && adjustDialog.type === 'agent'}
                                onOpenChange={(open) =>
                                    setAdjustDialog({ open, userId: open ? row.userId : null, amount: '', type: 'agent' })
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
                                            Update balance for {row.agentName}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>New Balance (SAR)</Label>
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
                        emptyMessage="No agent balances found"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
