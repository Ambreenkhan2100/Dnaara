'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Plus, Calendar, MapPin, Ship, Plane, Truck, FileText, Banknote } from 'lucide-react';
import Link from 'next/link';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, addDays, isAfter, isBefore } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AdminShipmentForm } from '@/components/forms/admin-shipment-form';
import { ShipmentFilter, FilterState } from '@/components/shared/shipment-filter';
import type { Shipment } from '@/types/shipment';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/components/providers/loader-provider';

// Helper for icons
const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'air': return <Plane className="h-4 w-4" />;
        case 'sea': return <Ship className="h-4 w-4" />;
        case 'land': return <Truck className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
    }
};

// SaudiRiyal component (inline if not available, or try to import if it was working)
// Since I can't verify if SaudiRiyal is in lucide-react (it likely isn't), I'll create a simple SVG component here to be safe.
const SaudiRiyal = ({ className }: { className?: string }) => (
    <span className={`font-sans font-bold ${className}`}>SAR</span>
);

export default function AdminShipmentsPage() {
    const router = useRouter();
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({});
    const { fetchFn } = useLoader();

    const fetchShipments = async () => {
        try {
            const res = await fetchFn('/api/admin/shipment', {
                headers: {
                    'x-user-role': 'admin'
                }
            });
            if (!res.ok) throw new Error('Failed to fetch shipments');
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

    // Derive agents from shipments for the filter
    const agents = useMemo(() => {
        const agentMap = new Map();
        shipments.forEach(s => {
            if (s.agent) {
                agentMap.set(s.agent.id, { id: s.agent.id, name: s.agent.name, type: 'agent' });
            }
        });
        return Array.from(agentMap.values());
    }, [shipments]);

    const filteredShipments = useMemo(() => {
        return shipments.filter((s) => {
            const matchesSearch =
                s.bill_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.bayan_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.importer?.name.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Apply filters
            if (filters.type && filters.type !== 'all') {
                if (s.type.toLowerCase() !== filters.type.toLowerCase()) return false;
            }

            if (filters.agentId) {
                if (s.agent_id !== filters.agentId) return false;
            }

            if (filters.dateRange?.from) {
                const reqDate = parseISO(s.created_at);
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

    const atPortShipments = filteredShipments.filter(s => s.status === 'AT_PORT');
    const upcomingShipments = filteredShipments.filter(s => {
        if (!s.expected_arrival_date) return false;
        const arrivalDate = parseISO(s.expected_arrival_date);
        const now = new Date();
        const next7Days = addDays(now, 7);
        return isAfter(arrivalDate, now) && isBefore(arrivalDate, next7Days);
    });
    const assignedShipments = filteredShipments.filter(s => s.status === 'ASSIGNED');
    const confirmedShipments = filteredShipments.filter(s => s.status === 'CONFIRMED');
    const completedShipments = filteredShipments.filter(s => s.status === 'COMPLETED');

    const ShipmentCard = ({ request }: { request: Shipment }) => (
        <Card key={request.id} className="mb-4 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {getIcon(request.type)}
                            {request.importer?.name || 'Unknown Importer'}
                        </CardTitle>
                        <CardDescription>ID: {request.shipment_id ?? 'N/A'} • B/L: {request.bill_number}</CardDescription>
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
                <Button size="sm" onClick={() => { router.push(`/admin/shipments/${request.id}`); }}>Open</Button>
            </CardFooter>
        </Card>
    );

    const ShipmentList = ({ data }: { data: Shipment[] }) => (
        <div className="space-y-4">
            {data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No shipments found</div>
            ) : (
                data.map((shipment) => (
                    <ShipmentCard
                        key={shipment.id}
                        request={shipment}
                    />
                ))
            )}
        </div>
    );

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
                        <ShipmentList data={atPortShipments} />
                    </TabsContent>
                    <TabsContent value="upcoming">
                        <ShipmentList data={upcomingShipments} />
                    </TabsContent>
                    <TabsContent value="assigned">
                        <ShipmentList data={assignedShipments} />
                    </TabsContent>
                    <TabsContent value="confirmed">
                        <ShipmentList data={confirmedShipments} />
                    </TabsContent>
                    <TabsContent value="completed">
                        <ShipmentList data={completedShipments} />
                    </TabsContent>
                    <TabsContent value="all">
                        <ShipmentList data={filteredShipments} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
