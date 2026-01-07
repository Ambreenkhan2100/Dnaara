'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { ImporterAgentLinkForm } from '@/components/forms/importer-agent-link-form';
import { Plus, ArrowUpRight } from 'lucide-react';
import { AgentDetailsDrawer } from './agent-details-drawer';
import { useLoader } from '@/components/providers/loader-provider';
import { ConnectedUser, RelationshipStatus } from '@/types/invite';
import { toast } from 'sonner';

export function AgentsView() {
    const { fetchFn } = useLoader();
    const [linkedAgents, setLinkedAgents] = useState<ConnectedUser[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerAgentId, setDrawerAgentId] = useState<string | null>(null);

    const fetchAgents = useCallback(async () => {
        try {
            const response = await fetchFn('/api/relationship');
            const result = await response.json();
            if (result.data) {
                setLinkedAgents(result.data);
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    }, [fetchFn]);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const AddAgent = async (email: string) => {
        try {
            setDialogOpen(false);
            const response = await fetchFn('/api/relationship/invite', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
            const result = await response.json();
            if (response.ok) {
                toast.success('Invitation sent successfully');
                fetchAgents();
            } else {
                toast.error(result.error || 'Failed to add agent');
            }
        } catch (error) {
            console.error('Error adding agent:', error);
            toast.error('An unexpected error occurred');
        }
    }

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
                        <ImporterAgentLinkForm
                            onSubmit={AddAgent}
                            onSuccess={() => setDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <DataTable
                data={linkedAgents}
                columns={[
                    {
                        header: 'Company Name',
                        accessor: (row) => row.legal_business_name || '-',
                    },
                    {
                        header: 'Agent Name',
                        accessor: (row) => row.full_name || '-',
                    },
                    {
                        header: 'Email',
                        accessor: (row) => row.company_email || '-',
                    },
                    {
                        header: 'Phone',
                        accessor: (row) => row.phone_number || '-',
                    },
                    {
                        header: 'Minimum Balance',
                        accessor: () => '-',
                    },
                    {
                        header: 'Wallet',
                        accessor: () => '-',
                    },
                    {
                        header: 'Status',
                        accessor: (row) => (
                            <div className="flex items-center justify-between group">
                                <StatusBadge status={row.relationship_status === RelationshipStatus.ACTIVE ? 'active' : 'pending'} />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => {
                                        setDrawerAgentId(row.agent_id || row.id);
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
