'use client';

import { useState } from 'react';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { RequestsTable } from '@/components/tables/requests-table';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import type { Request } from '@/types';
import { format } from 'date-fns';

export default function AgentUpcomingPage() {
    const { upcoming, acceptRequest, rejectRequest } = useAgentStore();
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: () => void;
        title: string;
        description: string;
        variant?: 'default' | 'destructive';
    }>({
        open: false,
        action: () => {},
        title: '',
        description: '',
        variant: 'default',
    });

    const handleView = (request: Request) => {
        setSelectedRequest(request);
        setViewDialogOpen(true);
    };

    const handleAccept = (request: Request) => {
        setConfirmDialog({
            open: true,
            action: () => {
                acceptRequest(request.id);
                toast.success('Request accepted successfully');
                setViewDialogOpen(false);
            },
            title: 'Accept Request',
            description: `Are you sure you want to accept request ${request.id} from ${request.importerName}?`,
            variant: 'default',
        });
    };

    const handleReject = (request: Request) => {
        setConfirmDialog({
            open: true,
            action: () => {
                rejectRequest(request.id);
                toast.success('Request rejected');
                setViewDialogOpen(false);
            },
            title: 'Reject Request',
            description: `Are you sure you want to reject request ${request.id} from ${request.importerName}?`,
            variant: 'destructive',
        });
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent">Agent</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Upcoming</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Upcoming Requests</h1>
                <p className="text-muted-foreground">Review and manage new requests from importers</p>
            </div>

            <RequestsTable
                data={upcoming}
                onView={handleView}
                actions={(request) => (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAccept(request)}
                            title="Accept Request"
                        >
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(request)}
                            title="Reject Request"
                        >
                            <XCircle className="h-4 w-4" />
                        </Button>
                    </>
                )}
                emptyMessage="No upcoming requests"
            />

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                        <DialogDescription>
                            View request information and uploaded documents
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Request ID</p>
                                    <p className="text-sm">{selectedRequest.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Importer</p>
                                    <p className="text-sm">{selectedRequest.importerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pre-Bayan Number</p>
                                    <p className="text-sm">{selectedRequest.preBayanNumber || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Waybill Number</p>
                                    <p className="text-sm">{selectedRequest.waybillNumber || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                                    <p className="text-sm">{format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <p className="text-sm">{selectedRequest.status}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <p className="text-sm font-medium">Uploaded Documents</p>
                                <div className="space-y-2">
                                    {selectedRequest.preBayanFileName && (
                                        <div className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">Pre-Bayan: {selectedRequest.preBayanFileName}</span>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    {selectedRequest.waybillFileName && (
                                        <div className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">Waybill: {selectedRequest.waybillFileName}</span>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    {!selectedRequest.preBayanFileName && !selectedRequest.waybillFileName && (
                                        <p className="text-sm text-muted-foreground">No documents uploaded</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={() => handleAccept(selectedRequest)}
                                    className="flex-1"
                                    style={{ backgroundColor: '#0bad85' }}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Accept Request
                                </Button>
                                <Button
                                    onClick={() => handleReject(selectedRequest)}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject Request
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                title={confirmDialog.title}
                description={confirmDialog.description}
                onConfirm={confirmDialog.action}
                variant={confirmDialog.variant}
            />
        </div>
    );
}

