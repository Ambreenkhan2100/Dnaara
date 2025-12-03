'use client';

import { useState, useMemo } from 'react';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit, Trash2, Calendar, MapPin, Ship, Plane, Truck } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AdminShipmentForm } from '@/components/forms/admin-shipment-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ShipmentFilter, FilterState } from '@/components/shared/shipment-filter';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import type { Request as ShipmentRequest } from '@/types';

export default function AdminShipmentsPage() {
    const { shipments, deleteShipment, users } = useAdminStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedShipment, setSelectedShipment] = useState<ShipmentRequest | null>(null);
    // const [createDialogOpen, setCreateDialogOpen] = useState(false); // Removed
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({});

    const agents = useMemo(() => users.filter(u => (u as { type: string }).type === 'agent'), [users]);

    const filteredShipments = useMemo(() => {
        return shipments.filter((s) => {
            const matchesSearch =
                s.billNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.bayanNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Apply filters
            if (filters.type && filters.type !== 'all') {
                if (s.type.toLowerCase() !== filters.type.toLowerCase()) return false;
            }

            if (filters.agentId) {
                if (s.agentId !== filters.agentId) return false;
            }

            if (filters.dateRange?.from) {
                const reqDate = parseISO(s.createdAt || s.expectedArrival); // Fallback if createdAt missing
                const from = startOfDay(filters.dateRange.from);
                const to = filters.dateRange.to ? endOfDay(filters.dateRange.to) : endOfDay(from);

                if (!isWithinInterval(reqDate, { start: from, end: to })) return false;
            }

            return true;
        });
    }, [shipments, searchQuery, filters]);

    const getShipmentsByStatus = (status: string) => {
        return filteredShipments.filter((s) => s.status === status);
    };

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.stopPropagation();
        deleteShipment(id);
        toast.success('Shipment deleted');
    };

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, shipment: ShipmentRequest) => {
        e.stopPropagation();
        setSelectedShipment(shipment);
        setEditDialogOpen(true);
    };

    const getImporterName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown Importer';
    const getAgentName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown Agent';

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Shipments</h2>
                    <p className="text-muted-foreground">
                        Manage all shipments across the platform.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                        <Link href="/admin/shipments/create">
                            <Button style={{ backgroundColor: '#0bad85' }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Shipment
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search shipments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <ShipmentFilter
                    agents={agents}
                    onFilterChange={setFilters}
                    initialFilters={filters}
                />

                <Tabs defaultValue="at_port" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="at_port">AT PORT</TabsTrigger>
                        <TabsTrigger value="upcoming">UPCOMING</TabsTrigger>
                        <TabsTrigger value="assigned">ASSIGNED</TabsTrigger>
                        <TabsTrigger value="confirmed">CONFIRMED</TabsTrigger>
                        <TabsTrigger value="completed">COMPLETED</TabsTrigger>
                        <TabsTrigger value="all">ALL SHIPMENTS</TabsTrigger>
                    </TabsList>

                    <TabsContent value="at_port">
                        <ShipmentList
                            data={getShipmentsByStatus('AT_PORT')}
                            getImporterName={getImporterName}
                            getAgentName={getAgentName}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSelect={setSelectedShipment}
                        />
                    </TabsContent>
                    <TabsContent value="upcoming">
                        <ShipmentList
                            data={getShipmentsByStatus('UPCOMING')}
                            getImporterName={getImporterName}
                            getAgentName={getAgentName}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSelect={setSelectedShipment}
                        />
                    </TabsContent>
                    <TabsContent value="assigned">
                        <ShipmentList
                            data={getShipmentsByStatus('ASSIGNED')}
                            getImporterName={getImporterName}
                            getAgentName={getAgentName}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSelect={setSelectedShipment}
                        />
                    </TabsContent>
                    <TabsContent value="confirmed">
                        <ShipmentList
                            data={getShipmentsByStatus('CONFIRMED')}
                            getImporterName={getImporterName}
                            getAgentName={getAgentName}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSelect={setSelectedShipment}
                        />
                    </TabsContent>
                    <TabsContent value="completed">
                        <ShipmentList
                            data={getShipmentsByStatus('COMPLETED')}
                            getImporterName={getImporterName}
                            getAgentName={getAgentName}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSelect={setSelectedShipment}
                        />
                    </TabsContent>
                    <TabsContent value="all">
                        <ShipmentList
                            data={filteredShipments}
                            getImporterName={getImporterName}
                            getAgentName={getAgentName}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSelect={setSelectedShipment}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Shipment</DialogTitle>
                        <DialogDescription>
                            Update the shipment details.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedShipment && (
                        <AdminShipmentForm
                            initialData={selectedShipment}
                            onSuccess={() => {
                                setEditDialogOpen(false);
                                setSelectedShipment(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={!!selectedShipment && !editDialogOpen} onOpenChange={(open) => !open && setSelectedShipment(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Shipment Details</DialogTitle>
                    </DialogHeader>
                    {selectedShipment && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium">Bill Number</p>
                                <p>{selectedShipment.billNumber}</p>
                            </div>
                            <div>
                                <p className="font-medium">Bayan Number</p>
                                <p>{selectedShipment.bayanNumber}</p>
                            </div>
                            <div>
                                <p className="font-medium">Importer</p>
                                <p>{getImporterName(selectedShipment.importerId)}</p>
                            </div>
                            <div>
                                <p className="font-medium">Agent</p>
                                <p>{getAgentName(selectedShipment.agentId || '')}</p>
                            </div>
                            <div>
                                <p className="font-medium">Origin</p>
                                <p>{selectedShipment.portOfShipment}</p>
                            </div>
                            <div>
                                <p className="font-medium">Destination</p>
                                <p>{selectedShipment.portOfDestination}</p>
                            </div>
                            <div>
                                <p className="font-medium">ETA</p>
                                <p>{selectedShipment.expectedArrival ? format(new Date(selectedShipment.expectedArrival), 'PPP') : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="font-medium">Duty Amount</p>
                                <p>SAR {selectedShipment.dutyAmount?.toLocaleString()}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="font-medium">Comments</p>
                                <p className="text-muted-foreground">{selectedShipment.comments || 'No comments'}</p>
                            </div>
                            {/* Notification flags removed as they are not in Request type */}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}

const ShipmentCard = ({
    shipment,
    getImporterName,
    getAgentName,
    onEdit,
    onDelete,
    onSelect
}: {
    shipment: ShipmentRequest;
    getImporterName: (id: string) => string;
    getAgentName: (id: string) => string;
    onEdit: (e: React.MouseEvent<HTMLButtonElement>, shipment: ShipmentRequest) => void;
    onDelete: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
    onSelect: (shipment: ShipmentRequest) => void;
}) => (
    <Card
        className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors relative group"
        onClick={() => onSelect(shipment)}
    >
        <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        {shipment.type === 'air' && <Plane className="h-4 w-4" />}
                        {shipment.type === 'sea' && <Ship className="h-4 w-4" />}
                        {shipment.type === 'land' && <Truck className="h-4 w-4" />}
                        {shipment.billNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">ID: {shipment.id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{shipment.status}</Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => onEdit(e, shipment)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => e.stopPropagation()}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the shipment.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={(e) => onDelete(e, shipment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground text-xs">Importer</p>
                    <p className="font-medium">{getImporterName(shipment.importerId)}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Agent</p>
                    <p className="font-medium">{getAgentName(shipment.agentId || '')}</p>
                </div>
                <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {shipment.portOfShipment} → {shipment.portOfDestination}
                </div>
                <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    ETA: {shipment.expectedArrival ? format(new Date(shipment.expectedArrival), 'MMM dd, yyyy') : 'N/A'}
                </div>
            </div>
        </CardContent>
    </Card>
);

const ShipmentList = ({
    data,
    getImporterName,
    getAgentName,
    onEdit,
    onDelete,
    onSelect
}: {
    data: ShipmentRequest[];
    getImporterName: (id: string) => string;
    getAgentName: (id: string) => string;
    onEdit: (e: React.MouseEvent<HTMLButtonElement>, shipment: ShipmentRequest) => void;
    onDelete: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
    onSelect: (shipment: ShipmentRequest) => void;
}) => (
    <div className="space-y-4">
        {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No shipments found</div>
        ) : (
            data.map((shipment) => (
                <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    getImporterName={getImporterName}
                    getAgentName={getAgentName}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSelect={onSelect}
                />
            ))
        )}
    </div>
);
