'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AgentImporterForm } from '@/components/forms/agent-importer-form';
import { Plus } from 'lucide-react';
import { useLoader } from '@/components/providers/loader-provider';
import { ConnectedUser, RelationshipStatus } from '@/types/invite';
import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';

export function ImportersView() {
    const { fetchWithLoader } = useLoader();
    const [importers, setImporters] = useState<ConnectedUser[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchImporters = useCallback(async () => {
        try {
            const response = await fetchWithLoader('/api/relationship?fetch=importers');
            const result = await response.json();
            if (result.data) {
                setImporters(result.data);
            }
        } catch (error) {
            console.error('Error fetching importers:', error);
        }
    }, [fetchWithLoader]);

    useEffect(() => {
        fetchImporters();
    }, [fetchImporters]);

    const AddImporter = async (email: string) => {
        try {
            setDialogOpen(false);
            const response = await fetchWithLoader('/api/relationship/invite', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
            const result = await response.json();
            if (response.ok) {
                toast.success('Invitation sent successfully');
                fetchImporters();
            } else {
                toast.error(result.error || 'Failed to add importer');
            }
        } catch (error) {
            console.error('Error adding importer:', error);
            toast.error('An unexpected error occurred');
        }
    }
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
                        <AgentImporterForm onSubmit={AddImporter} />
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                data={importers}
                columns={[
                    {
                        header: 'Company Name',
                        accessor: 'legal_business_name',
                    },
                    {
                        header: 'Importer Name',
                        accessor: 'full_name',
                    },
                    {
                        header: 'Importer Email',
                        accessor: 'company_email',
                    },
                    {
                        header: 'Importer Phone',
                        accessor: 'phone_number',
                    },
                    {
                        header: 'Status',
                        accessor: (row) => {
                            return (
                                <Badge
                                    variant={row.relationship_status === RelationshipStatus.ACTIVE ? 'default' : 'destructive'}
                                >
                                    {row.relationship_status}
                                </Badge>
                            );
                        },
                    },
                ]}
                emptyMessage="No importers linked yet"
            />
        </div>
    );
}
