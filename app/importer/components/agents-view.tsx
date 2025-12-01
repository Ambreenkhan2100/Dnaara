'use client';

import { useState } from 'react';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { ImporterAgentLinkForm } from '@/components/forms/importer-agent-link-form';
import { Plus, Pencil, Check, X, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AgentDetailsDrawer } from './agent-details-drawer';

function MinimumBalanceCell({ agentId, initialBalance }: { agentId: string, initialBalance?: number }) {
    const { updateAgentMinimumBalance } = useImporterStore();
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialBalance?.toString() || '');

    const handleSave = () => {
        updateAgentMinimumBalance(agentId, parseFloat(value) || 0);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setValue(initialBalance?.toString() || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-8 w-24"
                    autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="group flex items-center gap-2 min-h-[32px]">
            <span>{initialBalance ? `SAR ${initialBalance.toLocaleString()}` : '-'}</span>
            <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditing(true)}
            >
                <Pencil className="h-3 w-3" />
            </Button>
        </div>
    );
}

export function AgentsView() {
    const { linkedAgents } = useImporterStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerAgentId, setDrawerAgentId] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <AgentDetailsDrawer
                agentId={drawerAgentId}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Agents</h2>
                    <p className="text-muted-foreground">Manage your linked agents</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button style={{ backgroundColor: '#0bad85' }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Agent
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Link Agent</DialogTitle>
                            <DialogDescription>
                                Enter the agent's email address to link them to your account
                            </DialogDescription>
                        </DialogHeader>
                        <ImporterAgentLinkForm onSuccess={() => setDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Payment</DialogTitle>
                        <DialogDescription>
                            Add funds to the agent's wallet
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={(e) => {
                        e.preventDefault();
                        setPaymentDialogOpen(false);
                    }}>
                        <div className="space-y-2">
                            <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Payment Amount</label>
                            <input
                                id="amount"
                                type="number"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter amount"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Payment Date</label>
                            <input
                                id="date"
                                type="date"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="receipt" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Payment Receipt</label>
                            <input
                                id="receipt"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                            Submit Payment
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            <DataTable
                data={linkedAgents}
                columns={[
                    {
                        header: 'Company Name',
                        accessor: (row) => row.companyName || '-',
                    },
                    {
                        header: 'Agent Name',
                        accessor: 'name',
                    },
                    {
                        header: 'Email',
                        accessor: 'email',
                    },
                    {
                        header: 'Phone',
                        accessor: (row) => row.phone || '-',
                    },
                    {
                        header: 'Minimum Balance',
                        accessor: (row) => (
                            <MinimumBalanceCell agentId={row.id} initialBalance={row.minimumBalance} />
                        ),
                    },
                    {
                        header: 'Wallet',
                        accessor: (row) => (
                            <div className="flex items-center gap-2">
                                <span>SAR 5,000.00</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
                                    onClick={() => {
                                        setSelectedAgentId(row.id);
                                        setPaymentDialogOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ),
                    },
                    {
                        header: 'Status',
                        accessor: (row) => (
                            <div className="flex items-center justify-between group">
                                <StatusBadge status={row.status === 'linked' ? 'active' : 'pending'} />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => {
                                        setDrawerAgentId(row.id);
                                        setDrawerOpen(true);
                                    }}
                                >
                                    Open
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ),
                    },
                ]}
                emptyMessage="No agents linked yet"
            />
        </div>
    );
}
