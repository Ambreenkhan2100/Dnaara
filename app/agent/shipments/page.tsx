'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoader } from "@/components/providers/loader-provider";
import { FilterState } from "@/components/shared/shipment-filter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouterWithLoader } from "@/hooks/use-router-with-loader";
import { Shipment, ShipmentStatusEnum } from "@/types/shipment";
import { parseISO, addDays, isAfter, isBefore, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Plane, Ship, Truck, FileText, MapPin, Calendar, Banknote, SaudiRiyal, Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AgentShipmentsPage() {
    const router = useRouterWithLoader();
    const [searchQuery, setSearchQuery] = useState('');
    // const [filters, setFilters] = useState<FilterState>({});
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

    const assignedShipments = shipments.filter(s => !s.is_accepted && !s.is_completed && s.status !== ShipmentStatusEnum.REJECTED);
    const confirmedShipments = shipments.filter(s => s.is_accepted && !s.is_completed);
    const completedShipments = shipments.filter(s => s.is_completed);
    const rejectedShipments = shipments.filter(s => s.status === ShipmentStatusEnum.REJECTED);

    const filteredShipments = (list: Shipment[]) => {
        return list.filter(s => {
            const matchesSearch =
                (s.importer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.bayan_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;
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
    const ShipmentCard = ({ request, showActions = false, showUpdate = false }: { request: Shipment, showActions?: boolean, showUpdate?: boolean }) => (
        <Card key={request.id} className="mb-4 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {getIcon(request.type)}
                            {request.importer?.name || 'Unknown Client'}
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
                <Button size="sm" onClick={() => { router.push(`/agent/shipments/${request.id}`); }}>Open</Button>
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
                {/* <ShipmentFilter
                    agents={[]}
                    onFilterChange={setFilters}
                    initialFilters={filters}
                    entityLabel="Client"
                /> */}
                <Button onClick={() => router.push('/agent/shipments/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create new shipment
                </Button>
            </div>

            <Tabs defaultValue="assigned" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="at_port">AT PORT ({atPortShipments.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">UPCOMING ({upcomingShipments.length})</TabsTrigger>
                    <TabsTrigger value="assigned">ASSIGNED ({assignedShipments.length})</TabsTrigger>
                    <TabsTrigger value="confirmed">CONFIRMED ({confirmedShipments.length})</TabsTrigger>
                    <TabsTrigger value="completed">COMPLETED ({completedShipments.length})</TabsTrigger>
                    <TabsTrigger value="rejected">REJECTED ({rejectedShipments.length})</TabsTrigger>
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

                <TabsContent value="rejected" className="space-y-4">
                    {filteredShipments(rejectedShipments).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No rejected shipments found.</div>
                    ) : (
                        filteredShipments(rejectedShipments).map(req => (
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
