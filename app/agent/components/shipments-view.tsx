'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, MapPin, Calendar, DollarSign, Truck, Ship, Plane, Banknote, SaudiRiyal } from 'lucide-react';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { Shipment, ShipmentStatusEnum } from '@/types/shipment';
import { AgentPaymentForm } from '@/components/forms/agent-payment-form';
import { ShipmentFilter, FilterState } from '@/components/shared/shipment-filter';
import { isWithinInterval, parseISO, startOfDay, endOfDay, addDays, isBefore, isAfter } from 'date-fns';
import { toast } from 'sonner';
import { useLoader } from '@/components/providers/loader-provider';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';
import { CreatePaymentInput } from '@/lib/schemas';
import { PaymentStatus } from '@/types/enums/PaymentStatus';

export function ShipmentsView() {
    const router = useRouterWithLoader();
    const { rejectRequest, linkedImporters } = useAgentStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [actionNote, setActionNote] = useState('');
    const [updateFile, setUpdateFile] = useState<File | null>(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [updateDialogRequestId, setUpdateDialogRequestId] = useState<string | null>(null);
    const [paymentDialogRequestId, setPaymentDialogRequestId] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>({});
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);

    const { fetchFn: fetchWithLoader } = useLoader();
    const fetchShipments = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const res = await fetchWithLoader('/api/shipment', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch shipments');
            }

            const data = await res.json();
            setShipments(data.shipments || []);
        } catch (error) {
            console.error('Error fetching shipments:', error);
            toast.error('Failed to load shipments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    // Filter logic
    const atPortShipments = shipments.filter(s => s.status === 'AT_PORT');

    const upcomingShipments = shipments.filter(s => {
        if (!s.expected_arrival_date) return false;
        const arrivalDate = parseISO(s.expected_arrival_date);
        const now = new Date();
        const next7Days = addDays(now, 7);
        return isAfter(arrivalDate, now) && isBefore(arrivalDate, next7Days);
    });

    const assignedShipments = shipments.filter(s => !s.is_accepted && !s.is_completed);
    const confirmedShipments = shipments.filter(s => s.is_accepted && !s.is_completed);
    const completedShipments = shipments.filter(s => s.is_completed);

    const filteredShipments = (list: Shipment[]) => {
        return list.filter(s => {
            const matchesSearch =
                (s.importer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.bayan_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Apply filters
            if (filters.type && filters.type !== 'all') {
                if (s.type.toLowerCase() !== filters.type.toLowerCase()) return false;
            }

            if (filters.agentId) {
                if (s.importer_id !== filters.agentId) return false;
            }

            if (filters.dateRange?.from) {
                const reqDate = parseISO(s.created_at);
                const from = startOfDay(filters.dateRange.from);
                const to = filters.dateRange.to ? endOfDay(filters.dateRange.to) : endOfDay(from);

                if (!isWithinInterval(reqDate, { start: from, end: to })) return false;
            }

            return true;
        });
    };

    const getIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'air': return <Plane className="h-4 w-4" />;
            case 'sea': return <Ship className="h-4 w-4" />;
            case 'land': return <Truck className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const handleAccept = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const res = await fetchWithLoader('/api/shipment/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipmentId: id,
                    note: actionNote
                })
            });

            if (!res.ok) {
                throw new Error('Failed to accept shipment');
            }

            toast.success('Shipment accepted successfully');
            setActionNote('');
            fetchShipments(); // Refresh list
        } catch (error) {
            console.error('Error accepting shipment:', error);
            toast.error('Failed to accept shipment');
        }
    };

    const handleReject = (id: string) => {
        rejectRequest(id, actionNote);
        setActionNote('');
    };

    const handleUpdate = async (id: string) => {
        if (!updateStatus) {
            toast.error('Please select a status');
            return;
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

            const res = await fetchWithLoader('/api/shipment/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipmentId: id,
                    status: updateStatus,
                    note: actionNote,
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
            setUpdateDialogRequestId(null);
            fetchShipments(); // Refresh list
        } catch (error) {
            console.error('Error updating shipment status:', error);
            toast.error('Failed to update shipment status');
        }
    };

    const currentUserId = useRoleStore((state) => state.currentUserId);

    const createPayment = async (data: CreatePaymentInput) => {
        try {
            setPaymentDialogRequestId(null);

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
                payment_status: PaymentStatus.REQUESTED
            };

            const res = await fetchWithLoader('/api/payment', {
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
        } catch (error) {
            console.error('Error creating payment:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create payment');
        }
    };

    const ShipmentCard = ({ request, showActions = false, showUpdate = false }: { request: Shipment, showActions?: boolean, showUpdate?: boolean }) => (
        <Card key={request.id} className="mb-4 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2 cursor-pointer hover:text-primary"
                            onClick={() => {
                                router.push(`/agent/shipments/${request.id}`);
                            }}
                        >
                            {getIcon(request.type)}
                            {request.importer?.name || 'Unknown Importer'}
                        </CardTitle>
                        <CardDescription>ID: {request.id} • B/L: {request.bill_number}</CardDescription>
                    </div>
                    <Badge variant={request.status === 'ASSIGNED' ? 'secondary' : request.status === 'CONFIRMED' ? 'default' : 'outline'}>
                        {request.status || 'PENDING'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {request.port_of_shipment} → {request.port_of_destination}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" /> ETA: {request.expected_arrival_date ? new Date(request.expected_arrival_date).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="h-3 w-3" /> Bayan: {request.bayan_number || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Banknote className="h-3 w-3" /> Duty: {request.duty_charges || 'N/A'}<SaudiRiyal className='size-3' />
                    </div>
                </div>
                {request.updates && request.updates.length > 0 && (
                    <div className="mt-4 border-t pt-2">
                        <p className="text-xs font-semibold mb-1">Latest Update:</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(request.updates[request.updates.length - 1].created_at).toLocaleDateString()}: {request.updates[request.updates.length - 1].update_text}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
                {showActions && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Review</Button>
                        </DialogTrigger>
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
                                <Button variant="outline" onClick={() => handleReject(request.id)}>Reject</Button>
                                <Button onClick={() => handleAccept(request.id)}>Accept</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                {showUpdate && <>
                    <Button size="sm" onClick={() => setUpdateDialogRequestId(request.id)}>Add Update</Button>
                    <Dialog
                        open={updateDialogRequestId === request.id}
                        onOpenChange={(open) => {
                            if (!open) {
                                setUpdateDialogRequestId(null);
                            }
                        }}
                    >
                        {/* <DialogTrigger asChild>
                            <Button size="sm">Add Update</Button>
                        </DialogTrigger> */}
                        <DialogContent onPointerDownOutside={(e) => {
                            // Prevent closing when clicking on Select dropdown
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
                                <Button onClick={() => handleUpdate(request.id)}>Submit Update</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
                }
                {showUpdate && (
                    <Dialog
                        open={paymentDialogRequestId === request.id}
                        onOpenChange={(open) => setPaymentDialogRequestId(open ? request.id : null)}
                    >
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Add Payment</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create Payment Request</DialogTitle>
                                <DialogDescription>
                                    Create a payment request for {request.importer?.name}
                                </DialogDescription>
                            </DialogHeader>
                            <AgentPaymentForm
                                prefilledImporterId={request.importer_id}
                                prefilledShipmentId={request.id}
                                shipment={request}
                                onSubmit={createPayment}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </CardFooter>
        </Card>
    );

    if (loading) {
        return <div className="text-center py-8">Loading shipments...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search shipments..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <ShipmentFilter
                    agents={linkedImporters} // Passing importers as agents (generic entities)
                    onFilterChange={setFilters}
                    initialFilters={filters}
                    entityLabel="Importer"
                />
                <Button onClick={() => router.push('/agent/shipments/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create new shipment
                </Button>
            </div>

            <Tabs defaultValue="assigned" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="at_port">AT PORT ({atPortShipments.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">UPCOMING ({upcomingShipments.length})</TabsTrigger>
                    <TabsTrigger value="assigned">SHIPMENTS ASSIGNED ({assignedShipments.length})</TabsTrigger>
                    <TabsTrigger value="confirmed">SHIPMENTS CONFIRMED ({confirmedShipments.length})</TabsTrigger>
                    <TabsTrigger value="completed">SHIPMENTS COMPLETED ({completedShipments.length})</TabsTrigger>
                    <TabsTrigger value="all">ALL SHIPMENTS</TabsTrigger>
                </TabsList>

                <TabsContent value="at_port" className="space-y-4">
                    {filteredShipments(atPortShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No shipments at port found.</div>
                    ) : (
                        filteredShipments(atPortShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} showUpdate />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                    {filteredShipments(upcomingShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No upcoming shipments found.</div>
                    ) : (
                        filteredShipments(upcomingShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} showUpdate />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="assigned" className="space-y-4">
                    {filteredShipments(assignedShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No assigned shipments found.</div>
                    ) : (
                        filteredShipments(assignedShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} showActions />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="confirmed" className="space-y-4">
                    {filteredShipments(confirmedShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No confirmed shipments found.</div>
                    ) : (
                        filteredShipments(confirmedShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} showUpdate />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {filteredShipments(completedShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No completed shipments found.</div>
                    ) : (
                        filteredShipments(completedShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                    {filteredShipments(shipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No shipments found.</div>
                    ) : (
                        filteredShipments(shipments).map(req => (
                            <ShipmentCard key={req.id} request={req} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
