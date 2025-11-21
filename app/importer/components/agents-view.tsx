'use client';

import { useState } from 'react';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { ImporterAgentLinkForm } from '@/components/forms/importer-agent-link-form';
import { Plus } from 'lucide-react';

export function AgentsView() {
    const { linkedAgents } = useImporterStore();
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="space-y-6">
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
                        header: 'Status',
                        accessor: (row) => (
                            <StatusBadge status={row.status === 'linked' ? 'active' : 'pending'} />
                        ),
                    },
                ]}
                emptyMessage="No agents linked yet"
            />
        </div>
    );
}
