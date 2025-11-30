'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, MapPin, Calendar, DollarSign, Truck, Ship, Plane } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAgentStore } from '@/lib/store/useAgentStore';
import type { Request } from '@/types';
import { AgentPaymentForm } from '@/components/forms/agent-payment-form';
import { ShipmentFilter, FilterState } from '@/components/shared/shipment-filter';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

export function ShipmentsView() {
    const router = useRouter();
    const { upcoming, pending, completed, acceptRequest, rejectRequest, updateShipment, linkedImporters } = useAgentStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [actionNote, setActionNote] = useState('');
    const [updateFile, setUpdateFile] = useState<File | null>(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [updateDialogRequestId, setUpdateDialogRequestId] = useState<string | null>(null);
    const [paymentDialogRequestId, setPaymentDialogRequestId] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>({});

    const allShipments = [...upcoming, ...pending, ...completed];

    const filteredShipments = (shipments: Request[]) => {
        return shipments.filter(s => {
            const matchesSearch =
                s.importerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.billNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.bayanNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Apply filters
            if (filters.type && filters.type !== 'all') {
                if (s.type.toLowerCase() !== filters.type.toLowerCase()) return false;
            }

            if (filters.agentId) { // Using agentId field for importer filtering as per generic component design
                if (s.importerId !== filters.agentId) return false;
            }

            if (filters.dateRange?.from) {
                const reqDate = parseISO(s.createdAt);
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

    const handleAccept = (id: string) => {
        acceptRequest(id, actionNote);
        setActionNote('');
    };

    const handleReject = (id: string) => {
        rejectRequest(id, actionNote);
        setActionNote('');
    };

    const handleUpdate = (id: string) => {
        if (!actionNote) return;
        updateShipment(id, actionNote, updateFile || undefined);
        setActionNote('');
        setUpdateFile(null);
        setUpdateStatus('');
        setUpdateFile(null);
        setUpdateStatus('');
        setUpdateDialogRequestId(null);
    };

    const ShipmentCard = ({ request, showActions = false, showUpdate = false }: { request: Request, showActions?: boolean, showUpdate?: boolean }) => (
        <Card key={request.id} className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {getIcon(request.type)}
                            {request.importerName}
                        </CardTitle>
                        <CardDescription>ID: {request.id} • Bill: {request.billNo}</CardDescription>
                    </div>
                    <Badge variant={request.status === 'ASSIGNED' ? 'secondary' : request.status === 'CONFIRMED' ? 'default' : 'outline'}>
                        {request.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {request.portOfShipment} → {request.portOfDestination}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" /> ETA: {request.expectedArrival}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="h-3 w-3" /> Bayan: {request.bayanNo}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" /> Duty: {request.dutyCharges || request.dutyAmount}
                    </div>
                </div>
                {request.updates && request.updates.length > 0 && (
                    <div className="mt-4 border-t pt-2">
                        <p className="text-xs font-semibold mb-1">Latest Update:</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(request.updates[request.updates.length - 1].date).toLocaleDateString()}: {request.updates[request.updates.length - 1].note}
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
                {showUpdate && (
                    <Dialog
                        open={updateDialogRequestId === request.id}
                        onOpenChange={(open) => setUpdateDialogRequestId(open ? request.id : null)}
                    >
                        <DialogTrigger asChild>
                            <Button size="sm">Add Update</Button>
                        </DialogTrigger>
                        <DialogContent>
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
                                            <SelectItem value="At the port">At the port</SelectItem>
                                            <SelectItem value="Clearing in progress">Clearing in progress</SelectItem>
                                            <SelectItem value="On Hold by customs">On Hold by customs</SelectItem>
                                            <SelectItem value="Completed by customs">Completed by customs</SelectItem>
                                            <SelectItem value="Rejected by customs">Rejected by customs</SelectItem>
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
                )}
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
                                    Create a payment request for {request.importerName}
                                </DialogDescription>
                            </DialogHeader>
                            <AgentPaymentForm
                                prefilledImporterId={request.importerId}
                                prefilledShipmentId={request.id}
                                onSuccess={() => setPaymentDialogRequestId(null)}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </CardFooter>
        </Card>
    );

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
                    <TabsTrigger value="assigned">SHIPMENTS ASSIGNED ({upcoming.length})</TabsTrigger>
                    <TabsTrigger value="confirmed">SHIPMENTS CONFIRMED ({pending.length})</TabsTrigger>
                    <TabsTrigger value="completed">SHIPMENTS COMPLETED ({completed.length})</TabsTrigger>
                    <TabsTrigger value="all">ALL SHIPMENTS</TabsTrigger>
                </TabsList>

                <TabsContent value="assigned" className="space-y-4">
                    {filteredShipments(upcoming).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No assigned shipments found.</div>
                    ) : (
                        filteredShipments(upcoming).map(req => (
                            <ShipmentCard key={req.id} request={req} showActions />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="confirmed" className="space-y-4">
                    {filteredShipments(pending).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No confirmed shipments found.</div>
                    ) : (
                        filteredShipments(pending).map(req => (
                            <ShipmentCard key={req.id} request={req} showUpdate />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {filteredShipments(completed).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No completed shipments found.</div>
                    ) : (
                        filteredShipments(completed).map(req => (
                            <ShipmentCard key={req.id} request={req} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                    {filteredShipments(allShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No shipments found.</div>
                    ) : (
                        filteredShipments(allShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
