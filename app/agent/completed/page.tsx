'use client';

import { useState } from 'react';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { RequestsTable } from '@/components/tables/requests-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import type { Request } from '@/types';
import { format } from 'date-fns';

export default function AgentCompletedPage() {
    const { completed } = useAgentStore();
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    const handleView = (request: Request) => {
        setSelectedRequest(request);
        setViewDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent">Agent</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Completed</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Completed Requests</h1>
                <p className="text-muted-foreground">View all completed and closed requests</p>
            </div>

            <RequestsTable
                data={completed}
                onView={handleView}
            />

            {completed.length === 0 && (
                <div className="text-center text-muted-foreground my-8">
                    No completed requests
                </div>
            )}

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                        <DialogDescription>
                            View completed request information and documents
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
                                    <p className="text-sm font-medium text-muted-foreground">Final Bayan Number</p>
                                    <p className="text-sm">{selectedRequest.finalBayanNumber || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Duty Amount</p>
                                    <p className="text-sm">
                                        {selectedRequest.dutyAmount !== undefined
                                            ? `AED ${selectedRequest.dutyAmount.toLocaleString()}`
                                            : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                                    <p className="text-sm">{format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Completed Date</p>
                                    <p className="text-sm">{format(new Date(selectedRequest.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <p className="text-sm">{selectedRequest.status}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <p className="text-sm font-medium">Documents</p>
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
                                    {selectedRequest.finalBayanFileName && (
                                        <div className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">Final Bayan: {selectedRequest.finalBayanFileName}</span>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedRequest.notes && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="text-sm">{selectedRequest.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

