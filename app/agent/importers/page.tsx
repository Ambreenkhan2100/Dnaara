'use client'

import { useLoader } from "@/components/providers/loader-provider";
import { AgentImporterForm } from "@/components/forms/agent-importer-form";
import { DataTable } from "@/components/tables/data-table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConnectedUser, RelationshipStatus } from "@/types/invite";
import { Plus, ArrowUpRight } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionHistoryDrawer } from "@/components/shared/transaction-history-drawer";
import { TransactionHistory, PaginationMeta } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";

export default function AgentImportersPage() {
    const { fetchFn } = useLoader();
    const [importers, setImporters] = useState<ConnectedUser[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerUser, setDrawerUser] = useState<ConnectedUser | null>(null);
    const [transactions, setTransactions] = useState<TransactionHistory>([]);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchImporters = useCallback(async () => {
        try {
            const response = await fetchFn('/api/relationship');
            const result = await response.json();
            if (result.data) {
                setImporters(result.data);
            }
        } catch (error) {
            console.error('Error fetching importers:', error);
        }
    }, [fetchFn]);

    useEffect(() => {
        fetchImporters();
    }, [fetchImporters]);

    const AddImporter = async (email: string) => {
        try {
            setDialogOpen(false);
            const response = await fetchFn('/api/relationship/invite', {
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

    async function showTransactionHistory(importer: ConnectedUser, page: number = 1) {
        try {
            const res = await fetchFn(`/api/payment/transaction-history?importer_id=${importer.user_id}&page=${page}&limit=5`);
            if (!res.ok) throw new Error('Failed to fetch transaction history');

            const result = await res.json();
            setTransactions(result.data);
            setPaginationMeta(result.pagination);
            setCurrentPage(page);
            setDrawerUser(importer);
            setDrawerOpen(true);
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            toast.error('Failed to load transaction history');
        }
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
                    <p className="text-muted-foreground">Manage your linked clients</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button style={{ backgroundColor: '#0bad85' }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Client
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Client</DialogTitle>
                            <DialogDescription>
                                Enter the client's details to add them to your list.
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
                        header: 'Client Name',
                        accessor: 'full_name',
                    },
                    {
                        header: 'Client Email',
                        accessor: 'company_email',
                    },
                    {
                        header: 'Client Phone',
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
                    {
                        header: 'Actions',
                        accessor: (row) => (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => showTransactionHistory(row)}
                            >
                                Open
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        ),
                    },
                ]}

                emptyMessage="No clients linked yet"
            />

            {(drawerUser && drawerOpen) && (<TransactionHistoryDrawer
                user={drawerUser as ConnectedUser}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                transactions={transactions}
                pagination={paginationMeta}
                onPageChange={(page) => showTransactionHistory(drawerUser, page)}
                title="Client Details"
                description="View details and transaction history for"
            />)}
        </div>
    );
}