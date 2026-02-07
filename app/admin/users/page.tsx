'use client';

import { useState, useMemo } from 'react';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { UsersTable } from '@/components/tables/users-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCreateForm } from '@/components/forms/user-create-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import type { Importer, Agent, Admin } from '@/types';

type User = Importer | Agent | Admin;

export default function AdminUsersPage() {
    const { users, approveUser, deactivateUser } = useAdminStore();
    const [activeTab, setActiveTab] = useState<'importers' | 'agents'>('importers');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: () => void;
        title: string;
        description: string;
    }>({
        open: false,
        action: () => { },
        title: '',
        description: '',
    });

    const importers = useMemo(
        () => users.filter((u): u is Importer => 'businessName' in u),
        [users]
    );
    const agents = useMemo(
        () => users.filter((u): u is Agent => 'companyName' in u),
        [users]
    );

    const filteredImporters = useMemo(() => {
        if (statusFilter === 'all') return importers;
        return importers.filter((u) => u.status === statusFilter);
    }, [importers, statusFilter]);

    const filteredAgents = useMemo(() => {
        if (statusFilter === 'all') return agents;
        return agents.filter((u) => u.status === statusFilter);
    }, [agents, statusFilter]);

    const handleApprove = (user: User) => {
        setConfirmDialog({
            open: true,
            action: () => {
                approveUser(user.id);
                toast.success('User approved');
            },
            title: 'Approve User',
            description: `Are you sure you want to approve ${user.name}?`,
        });
    };

    const handleDeactivate = (user: User) => {
        setConfirmDialog({
            open: true,
            action: () => {
                deactivateUser(user.id);
                toast.success('User deactivated');
            },
            title: 'Deactivate User',
            description: `Are you sure you want to deactivate ${user.name}?`,
        });
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Users</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-muted-foreground">Manage clients and agents</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button style={{ backgroundColor: '#0bad85' }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>Add a new client or agent to the platform</DialogDescription>
                        </DialogHeader>
                        <UserCreateForm onSuccess={() => setCreateDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'importers' | 'agents')}>
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="importers">Clients</TabsTrigger>
                        <TabsTrigger value="agents">Agents</TabsTrigger>
                    </TabsList>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <TabsContent value="importers" className="mt-6">
                    <UsersTable
                        data={filteredImporters}
                        actions={(user) => (
                            <>
                                {user.status === 'pending' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleApprove(user)}
                                    >
                                        Approve
                                    </Button>
                                )}
                                {user.status !== 'disabled' && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeactivate(user)}
                                    >
                                        Deactivate
                                    </Button>
                                )}
                            </>
                        )}
                    />
                </TabsContent>

                <TabsContent value="agents" className="mt-6">
                    <UsersTable
                        data={filteredAgents}
                        actions={(user) => (
                            <>
                                {user.status === 'pending' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleApprove(user)}
                                    >
                                        Approve
                                    </Button>
                                )}
                                {user.status !== 'disabled' && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeactivate(user)}
                                    >
                                        Deactivate
                                    </Button>
                                )}
                            </>
                        )}
                    />
                </TabsContent>
            </Tabs>

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                title={confirmDialog.title}
                description={confirmDialog.description}
                onConfirm={confirmDialog.action}
                variant="default"
            />
        </div>
    );
}

