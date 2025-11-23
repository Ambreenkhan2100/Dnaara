'use client';

import { useState } from 'react';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { AgentImporterForm } from '@/components/forms/agent-importer-form';
import { Plus } from 'lucide-react';

export function ImportersView() {
    const { linkedImporters } = useAgentStore();
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Importers</h2>
                    <p className="text-muted-foreground">Manage your linked importers</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button style={{ backgroundColor: '#0bad85' }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Importer
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Importer</DialogTitle>
                            <DialogDescription>
                                Enter the importer's details to add them to your list.
                            </DialogDescription>
                        </DialogHeader>
                        <AgentImporterForm onSuccess={() => setDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                data={linkedImporters}
                columns={[
                    {
                        header: 'Company Name',
                        accessor: (row) => row.companyName || '-',
                    },
                    {
                        header: 'Importer Name',
                        accessor: 'name',
                    },
                    {
                        header: 'Importer Email',
                        accessor: 'email',
                    },
                    {
                        header: 'Importer Phone',
                        accessor: (row) => row.phone || '-',
                    },
                    {
                        header: 'Status',
                        accessor: (row) => (
                            <StatusBadge status={row.status === 'active' ? 'active' : 'pending'} />
                        ),
                    },
                ]}
                emptyMessage="No importers linked yet"
            />
        </div>
    );
}
