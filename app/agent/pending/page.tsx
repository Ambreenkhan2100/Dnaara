'use client';

import { useState } from 'react';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { RequestsTable } from '@/components/tables/requests-table';
import { AgentFinalBayanForm } from '@/components/forms/agent-final-bayan-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import type { Request } from '@/types';
import { format } from 'date-fns';

export default function AgentPendingPage() {
    const { pending } = useAgentStore();
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [formDialogOpen, setFormDialogOpen] = useState(false);

    const handleView = (request: Request) => {
        setSelectedRequest(request);
        setViewDialogOpen(true);
    };

    const handleSubmitFinalBayan = (request: Request) => {
        setSelectedRequest(request);
        setViewDialogOpen(false);
        setFormDialogOpen(true);
    };

    const handleFormSuccess = () => {
        setFormDialogOpen(false);
        setSelectedRequest(null);
    };

    // Filter to show only CONFIRMED requests (accepted by agent, waiting for final bayan submission)
    const confirmedRequests = pending.filter((r) => r.status === 'CONFIRMED');

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent">Agent</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Pending</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Pending Requests</h1>
                <p className="text-muted-foreground">Manage accepted requests and submit final Bayan details</p>
            </div>

            <RequestsTable
                data={confirmedRequests}
                onView={handleView}
                actions={(request) => {
                    // Only show submit button for CONFIRMED requests
                    if (request.status === 'CONFIRMED') {
                        return (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleSubmitFinalBayan(request)}
                                style={{ backgroundColor: '#0bad85' }}
                                title="Submit Final Bayan"
                            >
                                Submit Final Bayan
                            </Button>
                        );
                    }
                    return null;
                }}
                emptyMessage="No pending requests"
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
                                {selectedRequest.finalBayanNumber && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Final Bayan Number</p>
                                        <p className="text-sm">{selectedRequest.finalBayanNumber}</p>
                                    </div>
                                )}
                                {selectedRequest.dutyAmount !== undefined && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Duty Amount</p>
                                        <p className="text-sm">AED {selectedRequest.dutyAmount.toLocaleString()}</p>
                                    </div>
                                )}
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

                            {selectedRequest.status === 'CONFIRMED' && (
                                <div className="pt-4">
                                    <Button
                                        onClick={() => handleSubmitFinalBayan(selectedRequest)}
                                        className="w-full"
                                        style={{ backgroundColor: '#0bad85' }}
                                    >
                                        Submit Final Bayan
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Submit Final Bayan</DialogTitle>
                        <DialogDescription>
                            Enter final Bayan number, upload copy, and provide customs duty details
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <AgentFinalBayanForm requestId={selectedRequest.id} onSuccess={handleFormSuccess} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

