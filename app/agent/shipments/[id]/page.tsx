'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Truck, Clock, MapPin, User, DollarSign, Calendar, Banknote, SaudiRiyal } from 'lucide-react';
import type { Shipment } from '@/types/shipment';
import { useLoader } from '@/components/providers/loader-provider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { ShipmentStatusEnum } from '@/types/shipment';
import { PaymentStatus } from '@/types/enums/PaymentStatus';
import { AgentPaymentForm } from '@/components/forms/agent-payment-form';
import { CreatePaymentInput } from '@/lib/schemas';
import { uploadBase64ToSupabase } from '@/lib/utils/fileupload';
import { useUserStore } from '@/lib/store/useUserStore';

export default function AgentShipmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Action States
    const { rejectRequest } = useAgentStore();
    const currentUserId = useRoleStore((state) => state.currentUserId);
    const [actionNote, setActionNote] = useState('');
    const [updateFile, setUpdateFile] = useState<File | null>(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    const { fetchFn } = useLoader();

    const { userProfile } = useUserStore()


    useEffect(() => {
        const fetchShipment = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetchFn(`/api/shipment/${params.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch shipment');
                }

                const data = await response.json();
                setShipment(data.shipment);
            } catch (err) {
                console.error(err);
                setError('Failed to load shipment details');
                toast.error('Failed to load shipment details');
            }
        };

        if (params.id) {
            fetchShipment();
        }
    }, [params.id, fetchFn]);

    const fetchShipments = async () => {
        // Re-fetch current shipment
        try {
            const token = localStorage.getItem('token');
            const response = await fetchFn(`/api/shipment/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch shipment');
            }

            const data = await response.json();
            setShipment(data.shipment);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAccept = async () => {
        if (!shipment) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const res = await fetchFn('/api/shipment/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipmentId: shipment.id,
                    note: actionNote
                })
            });

            if (!res.ok) {
                throw new Error('Failed to accept shipment');
            }

            toast.success('Shipment accepted successfully');
            setActionNote('');
            setReviewDialogOpen(false);
            fetchShipments();
        } catch (error) {
            console.error('Error accepting shipment:', error);
            toast.error('Failed to accept shipment');
        }
    };

    const handleReject = () => {
        if (!shipment) return;
        rejectRequest(shipment.id, actionNote);
        setActionNote('');
        setReviewDialogOpen(false);
        // Optimistic update or refetch might receive update from store/socket or manual refetch
        setTimeout(fetchShipments, 1000);
    };

    const handleUpdate = async () => {
        if (!shipment) return;
        if (!updateStatus) {
            toast.error('Please select a status');
            return;
        }

        const statusChanged = updateStatus !== shipment.status;
        const hasNote = actionNote.trim().length > 0;

        // If no status change and no note, don't submit
        if (!statusChanged && !hasNote) {
            toast.error('Please add a note or change the status');
            return;
        }

        // Build the final note based on status change
        let finalNote = actionNote;
        if (statusChanged) {
            if (hasNote) {
                finalNote = `Status changed to ${updateStatus} | ${actionNote}`;
            } else {
                finalNote = `Status changed to ${updateStatus}`;
            }
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            let fileBase64 = null;
            if (updateFile) {
                const reader = new FileReader();
                fileBase64 = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target?.result);
                    reader.readAsDataURL(updateFile);
                });
            }

            const res = await fetchFn('/api/shipment/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipmentId: shipment.id,
                    status: updateStatus,
                    note: finalNote,
                    file: fileBase64
                })
            });

            if (!res.ok) {
                throw new Error('Failed to update shipment status');
            }

            toast.success('Shipment status updated successfully');
            setActionNote('');
            setUpdateFile(null);
            setUpdateStatus('');
            setUpdateDialogOpen(false);
            fetchShipments();
        } catch (error) {
            console.error('Error updating shipment status:', error);
            toast.error('Failed to update shipment status');
        }
    };

    const createPayment = async (data: CreatePaymentInput) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            if (!currentUserId) {
                toast.error('User session not found');
                return;
            }

            const payload = {
                shipment_id: data.shipmentId,
                payment_type: data.paymentType === 'other' ? data.otherPaymentName : data.paymentType,
                agent_id: currentUserId,
                importer_id: data.importerId,
                bayan_number: data.bayanNumber,
                bill_number: data.billNumber,
                amount: data.amount,
                payment_deadline: data.paymentDeadline,
                description: data.description,
                payment_status: PaymentStatus.REQUESTED,
                payment_invoice_url: data.payment_document_url || null
            };

            const res = await fetchFn('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create payment');
            }

            toast.success('Payment request created successfully');
            setPaymentDialogOpen(false);
        } catch (error) {
            console.error('Error creating payment:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create payment');
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-destructive font-medium">{error || 'Shipment not found'}</p>
                <Button onClick={() => router.push('/agent')}>Go Back</Button>
            </div>
        );
    }

    if (!shipment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-muted-foreground font-medium">Loading...</p>
            </div>
        );
    }

    const isCompleted = shipment.status === 'COMPLETED';
    const isConfirmed = shipment.status === 'CONFIRMED';

    return (
        <div className="space-y-6 p-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent/shipments">Shipments</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Shipment {shipment.bill_number}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-row items-stretch w-full justify-between">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            Shipment Details
                            <Badge variant={isCompleted ? 'default' : isConfirmed ? 'secondary' : 'outline'}>
                                {shipment.status}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <span className="font-medium">{shipment.type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {shipment.port_of_shipment}</span>
                            <span>→</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {shipment.port_of_destination}</span>
                        </p>
                    </div>
                </div>
                {/* Here add the actions */}
                <div className="flex gap-2">
                    {(!shipment.is_accepted && !shipment.is_completed) && (
                        <Button onClick={() => setReviewDialogOpen(true)}>Review Request</Button>
                    )}
                    {(shipment.is_accepted && !shipment.is_completed) && (
                        <>
                            <Button variant="outline" onClick={() => setPaymentDialogOpen(true)}>Add Payment</Button>
                            <Button onClick={() => setUpdateDialogOpen(true)}>Add Update</Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Key Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Bill Number</Label>
                                <div className="font-medium text-lg">{shipment.bill_number}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Bayan Number</Label>
                                <div className="font-medium text-lg">{shipment.bayan_number || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Expected Arrival</Label>
                                <div className="font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    {new Date(shipment.expected_arrival_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Duty Charges</Label>
                                <div className="font-medium flex items-center gap-2">
                                    <Banknote className="w-4 h-4 text-muted-foreground" />
                                    {shipment.duty_charges?.toLocaleString() || '-'} <SaudiRiyal className='size-3' />
                                </div>
                            </div>
                            {shipment.number_of_pallets && (
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Number of Pallets</Label>
                                    <div className="font-medium">{shipment.number_of_pallets}</div>
                                </div>
                            )}
                            {shipment.payment_partner && (
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Payment Partner</Label>
                                    <div className="font-medium">{shipment.payment_partner}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Comments Section */}
                    {shipment.comments && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Additional Comments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{shipment.comments}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Trucks Section (Only for Land shipments) */}
                    {shipment.type === 'Land' && shipment.trucks && shipment.trucks.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="w-5 h-5" />
                                    Truck Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {shipment.trucks.map((truck, index) => (
                                        <div key={truck.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-muted/20">
                                            <div className="space-y-1">
                                                <div className="font-semibold">Truck #{index + 1}</div>
                                                <div className="text-sm text-muted-foreground">Vehicle: {truck.vehicle_number}</div>
                                            </div>
                                            <div className="space-y-1 mt-2 md:mt-0">
                                                <div className="text-sm">Driver: {truck.driver_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {truck.driver_mobile_origin} / {truck.driver_mobile_destination}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Updates / Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Timeline & Updates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6 relative pl-4 border-l-2 border-muted">
                                {shipment.updates && shipment.updates.length > 0 ? (
                                    shipment.updates.map((update) => (
                                        <div key={update.id} className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary" />
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(update.created_at).toLocaleString()}
                                                    <span className="mx-1">•</span>
                                                    {userProfile &&
                                                        <span>
                                                            {update.created_by === userProfile.user_id
                                                                ? 'Created by you'
                                                                : userProfile?.role?.toLowerCase() === 'agent'
                                                                    ? 'Created by Importer'
                                                                    : 'Created by Agent'}
                                                        </span>
                                                    }
                                                </p>
                                                <p className="font-medium">{update.update_text}</p>
                                                {update.document_url && (
                                                    <a
                                                        href={update.document_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        View Attachment
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground italic">No updates yet.</div>
                                )}
                                {/* Creation event */}
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-muted-foreground" />
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(shipment.created_at).toLocaleString()}
                                        </p>
                                        <p className="font-medium">Shipment Created</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Importer Details (Instead of Agent Details) */}
                    {shipment.importer && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Importer Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Name</Label>
                                        <div className="font-medium">{shipment.importer.name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Email</Label>
                                        <div className="font-medium break-all">{shipment.importer.email}</div>
                                    </div>
                                    <Button variant="outline" className="w-full mt-2" size="sm">Contact Importer</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {shipment.bayan_file_url && (
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="text-sm truncate">Bayan Document</span>
                                    </div>
                                    <a href={shipment.bayan_file_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            )}
                            {shipment.commercial_invoice_file_url && (
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="text-sm truncate">Commercial Invoice</span>
                                    </div>
                                    <a href={shipment.commercial_invoice_file_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            )}
                            {shipment.packing_list_file_url && (
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="text-sm truncate">Packing List</span>
                                    </div>
                                    <a href={shipment.packing_list_file_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            )}
                            {shipment.certificate_of_confirmity_url && (
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="text-sm truncate">Certificate of Confirmity</span>
                                    </div>
                                    <a href={shipment.certificate_of_confirmity_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            )}
                            {shipment.certificate_of_origin_url && (
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="text-sm truncate">Certificate of Origin</span>
                                    </div>
                                    <a href={shipment.certificate_of_origin_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            )}
                            {shipment.saber_certificate_url && (
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="text-sm truncate">Saber Certificate</span>
                                    </div>
                                    <a href={shipment.saber_certificate_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            )}
                            {shipment.other_documents_urls && shipment.other_documents_urls.map((url, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="text-sm truncate">Other Doc #{idx + 1}</span>
                                    </div>
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            ))}

                            {shipment.updates && shipment.updates.some(u => u.document_url) && (
                                <>
                                    <div className="border-t my-4" />
                                    <div className="text-sm font-medium text-muted-foreground mb-2">Update Documents</div>
                                    {shipment.updates.filter(u => u.document_url).map((update, idx) => (
                                        <div key={`update-doc-${idx}`} className="flex flex-col p-2 border rounded hover:bg-accent/50 transition-colors gap-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                                    <span className="text-sm truncate">Update Attachment</span>
                                                </div>
                                                <a href={update.document_url} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </a>
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground gap-2 pl-6">
                                                <span>{new Date(update.created_at).toLocaleString()}</span>
                                                <span>•</span>
                                                {userProfile && (
                                                    <span>
                                                        {update.created_by === userProfile.user_id
                                                            ? 'Uploaded by you'
                                                            : userProfile?.role?.toLowerCase() === 'agent'
                                                                ? `Uploaded by ${shipment.importer?.name}`
                                                                : `Uploaded by ${shipment.agent?.name}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Dialogs */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Shipment Request</DialogTitle>
                        <DialogDescription>Accept or reject this shipment request.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Comments (Optional)</Label>
                            <Textarea
                                placeholder="Add a note..."
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleReject}>Reject</Button>
                        <Button onClick={handleAccept}>Accept</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogContent onPointerDownOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[role="listbox"]') || target.closest('[data-radix-select-viewport]')) {
                        e.preventDefault();
                    }
                }}>
                    <DialogHeader>
                        <DialogTitle>Update Shipment Status</DialogTitle>
                        <DialogDescription>Add a note or file to update the status.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={updateStatus} onValueChange={setUpdateStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ShipmentStatusEnum.AT_PORT}>At the port</SelectItem>
                                    <SelectItem value={ShipmentStatusEnum.CLEARING_IN_PROGRESS}>Clearing in progress</SelectItem>
                                    <SelectItem value={ShipmentStatusEnum.ON_HOLD_BY_CUSTOMS}>On Hold by customs</SelectItem>
                                    <SelectItem value={ShipmentStatusEnum.COMPLETED_BY_CUSTOMS}>Completed by customs</SelectItem>
                                    <SelectItem value={ShipmentStatusEnum.REJECTED_BY_CUSTOMS}>Rejected by customs</SelectItem>
                                    <SelectItem value={ShipmentStatusEnum.OTHER}>Other</SelectItem>
                                    <SelectItem value={ShipmentStatusEnum.ADDITIONAL_DOCUMENT_REQUIRED}>Additional document required</SelectItem>
                                    <SelectItem value={ShipmentStatusEnum.IN_TRANSIT}>In Transit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Update Note</Label>
                            <Textarea
                                placeholder="What's the latest status?"
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Attachment (Optional)</Label>
                            <Input type="file" onChange={(e) => setUpdateFile(e.target.files?.[0] || null)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdate}>Submit Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Payment Request</DialogTitle>
                        <DialogDescription>
                            Create a payment request for {shipment.importer?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <AgentPaymentForm
                        prefilledImporterId={shipment.importer?.id}
                        prefilledShipmentId={shipment.id}
                        shipment={shipment}
                        onSubmit={createPayment}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
