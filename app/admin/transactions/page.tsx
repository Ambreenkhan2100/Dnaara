'use client';

import { useState, useMemo } from 'react';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { RequestsTable } from '@/components/tables/requests-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import type { Request } from '@/types';

export default function AdminTransactionsPage() {
    const { requests, approveRequest, rejectRequest, returnRequest } = useAdminStore();
    const [statusFilter, setStatusFilter] = useState<string>('all');
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

    const filteredRequests = useMemo(() => {
        if (statusFilter === 'all') return requests;
        return requests.filter((r) => r.status === statusFilter);
    }, [requests, statusFilter]);

    const handleApprove = (request: Request) => {
        setConfirmDialog({
            open: true,
            action: () => {
                approveRequest(request.id);
                toast.success('Request approved');
            },
            title: 'Approve Request',
            description: `Are you sure you want to approve request ${request.id}?`,
        });
    };

    const handleReject = (request: Request) => {
        setConfirmDialog({
            open: true,
            action: () => {
                rejectRequest(request.id);
                toast.success('Request rejected');
            },
            title: 'Reject Request',
            description: `Are you sure you want to reject request ${request.id}?`,
        });
    };

    const handleReturn = (request: Request) => {
        setConfirmDialog({
            open: true,
            action: () => {
                returnRequest(request.id);
                toast.success('Request returned for revision');
            },
            title: 'Return for Revision',
            description: `Are you sure you want to return request ${request.id} for revision?`,
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
                        <BreadcrumbPage>Transactions</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground">Manage and review all requests</p>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="ASSIGNED">Assigned</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <RequestsTable
                data={filteredRequests}
                filterSlot={
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="ASSIGNED">Assigned</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                }
                actions={(request) => (
                    <>
                        {request.status === 'ASSIGNED' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprove(request)}
                                    title="Approve"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReturn(request)}
                                    title="Return for Revision"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleReject(request)}
                                    title="Reject"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </>
                )}
            />

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

