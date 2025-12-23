'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, FileText, MapPin, Calendar, DollarSign, Truck, Ship, Plane } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { Shipment } from '@/types/shipment';
import { ShipmentFilter, FilterState } from '@/components/shared/shipment-filter';
import { isWithinInterval, parseISO, startOfDay, endOfDay, addDays, isBefore, isAfter } from 'date-fns';
import { useLoader } from '@/components/providers/loader-provider';

export function ShipmentsView() {
    const router = useRouter();
    const { linkedAgents } = useImporterStore();
    const [searchQuery, setSearchQuery] = useState('');
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
                (s.agent?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.bayan_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase());

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
    };

    const getIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'air': return <Plane className="h-4 w-4" />;
            case 'sea': return <Ship className="h-4 w-4" />;
            case 'land': return <Truck className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const ShipmentCard = ({ request }: { request: Shipment }) => (
        <Card key={request.id} className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => {
            router.push(`/importer/shipments/${request.id}`);
        }}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {getIcon(request.type)}
                            {request.agent?.name || 'Unknown Agent'}
                        </CardTitle>
                        <CardDescription>ID: {request.id} • Bill: {request.bill_number}</CardDescription>
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
                        <DollarSign className="h-3 w-3" /> Duty: {request.duty_charges || 'N/A'}
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
        </Card>
    );

    if (loading) {
        return <div className="text-center py-8">Loading shipments...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Shipments</h2>
                    <p className="text-muted-foreground">Manage and track your shipments</p>
                </div>
                <Button onClick={() => router.push('/importer/new-shipment')} style={{ backgroundColor: '#0bad85' }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Shipment
                </Button>
            </div>

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
                    agents={linkedAgents}
                    onFilterChange={setFilters}
                    initialFilters={filters}
                    entityLabel="Agent"
                />
            </div>

            <Tabs defaultValue="assigned" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="at_port">AT PORT ({atPortShipments.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">UPCOMING ({upcomingShipments.length})</TabsTrigger>
                    <TabsTrigger value="assigned">ASSIGNED ({assignedShipments.length})</TabsTrigger>
                    <TabsTrigger value="confirmed">CONFIRMED ({confirmedShipments.length})</TabsTrigger>
                    <TabsTrigger value="completed">COMPLETED ({completedShipments.length})</TabsTrigger>
                    <TabsTrigger value="all">ALL SHIPMENTS</TabsTrigger>
                </TabsList>

                <TabsContent value="at_port" className="space-y-4">
                    {filteredShipments(atPortShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No shipments at port found.</div>
                    ) : (
                        filteredShipments(atPortShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                    {filteredShipments(upcomingShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No upcoming shipments found.</div>
                    ) : (
                        filteredShipments(upcomingShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="assigned" className="space-y-4">
                    {filteredShipments(assignedShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No assigned shipments found.</div>
                    ) : (
                        filteredShipments(assignedShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="confirmed" className="space-y-4">
                    {filteredShipments(confirmedShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No confirmed shipments found.</div>
                    ) : (
                        filteredShipments(confirmedShipments).map(req => (
                            <ShipmentCard key={req.id} request={req} />
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
