'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { Request } from '@/types';
import { ShipmentFilter, FilterState } from '@/components/shared/shipment-filter';
import { isWithinInterval, parseISO, startOfDay, endOfDay, addHours, isBefore } from 'date-fns';

export function ShipmentsView() {
    const router = useRouter();
    const { requests, linkedAgents } = useImporterStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({});

    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            req.billNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.bayanNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.portOfShipment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.portOfDestination?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        // Apply filters
        if (filters.type && filters.type !== 'all') {
            if (req.type.toLowerCase() !== filters.type.toLowerCase()) return false;
        }

        if (filters.agentId) {
            if (req.agentId !== filters.agentId) return false;
        }

        if (filters.dateRange?.from) {
            const reqDate = parseISO(req.createdAt);
            const from = startOfDay(filters.dateRange.from);
            const to = filters.dateRange.to ? endOfDay(filters.dateRange.to) : endOfDay(from);

            if (!isWithinInterval(reqDate, { start: from, end: to })) return false;
        }

        return true;
    });

    // Helper function to check if shipment is at port (based on updates)
    const isAtPort = (shipment: Request) => {
        return shipment.updates?.some(update =>
            update.note.toLowerCase().includes('at the port') ||
            update.note.toLowerCase().includes('at port')
        ) || false;
    };

    // Helper function to check if shipment is upcoming (arriving within 24 hours)
    const isUpcoming = (shipment: Request) => {
        if (!shipment.expectedArrival && !shipment.expectedArrivalDate) return false;
        const arrivalDate = parseISO(shipment.expectedArrival || shipment.expectedArrivalDate || '');
        const now = new Date();
        const next24Hours = addHours(now, 24);
        return isBefore(arrivalDate, next24Hours) && isBefore(now, arrivalDate);
    };

    const assignedShipments = filteredRequests.filter(r => r.status === 'ASSIGNED');
    const confirmedShipments = filteredRequests.filter(r => r.status === 'CONFIRMED');
    const completedShipments = filteredRequests.filter(r => r.status === 'COMPLETED');
    const atPortShipments = filteredRequests.filter(r => r.status === 'ASSIGNED' && isAtPort(r));
    const upcomingShipments = filteredRequests.filter(r => r.status === 'ASSIGNED' && isUpcoming(r) && !isAtPort(r));

    const ShipmentCard = ({ shipment }: { shipment: Request }) => (
        <Card className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => {
            router.push(`/importer/shipments/${shipment.id}`);
        }}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base font-medium">{shipment.billNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground">Bayan: {shipment.bayanNumber}</p>
                    </div>
                    <Badge variant={
                        shipment.status === 'COMPLETED' ? 'default' :
                            shipment.status === 'CONFIRMED' ? 'secondary' : 'outline'
                    }>
                        {shipment.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-muted-foreground">Type:</span> {shipment.type}
                    </div>
                    <div>
                        <span className="text-muted-foreground">Arrival:</span> {shipment.expectedArrivalDate}
                    </div>
                    <div>
                        <span className="text-muted-foreground">From:</span> {shipment.portOfShipment}
                    </div>
                    <div>
                        <span className="text-muted-foreground">To:</span> {shipment.portOfDestination}
                    </div>
                    {shipment.agentName && (
                        <div className="col-span-2">
                            <span className="text-muted-foreground">Agent:</span> {shipment.agentName}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

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

            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
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
                />
            </div>

            <Tabs defaultValue="assigned" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="at_port">At Port ({atPortShipments.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming ({upcomingShipments.length})</TabsTrigger>
                    <TabsTrigger value="assigned">Assigned ({assignedShipments.length})</TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmed ({confirmedShipments.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedShipments.length})</TabsTrigger>
                    <TabsTrigger value="all">All Shipments ({filteredRequests.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="at_port" className="space-y-4">
                    {atPortShipments.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No shipments at port found.</div>
                    ) : (
                        atPortShipments.map(req => <ShipmentCard key={req.id} shipment={req} />)
                    )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                    {upcomingShipments.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No upcoming shipments found.</div>
                    ) : (
                        upcomingShipments.map(req => <ShipmentCard key={req.id} shipment={req} />)
                    )}
                </TabsContent>

                <TabsContent value="assigned" className="space-y-4">
                    {assignedShipments.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No assigned shipments found.</div>
                    ) : (
                        assignedShipments.map(req => <ShipmentCard key={req.id} shipment={req} />)
                    )}
                </TabsContent>

                <TabsContent value="confirmed" className="space-y-4">
                    {confirmedShipments.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No confirmed shipments found.</div>
                    ) : (
                        confirmedShipments.map(req => <ShipmentCard key={req.id} shipment={req} />)
                    )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {completedShipments.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No completed shipments found.</div>
                    ) : (
                        completedShipments.map(req => <ShipmentCard key={req.id} shipment={req} />)
                    )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No shipments found.</div>
                    ) : (
                        filteredRequests.map(req => <ShipmentCard key={req.id} shipment={req} />)
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
