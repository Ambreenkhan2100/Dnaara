'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Truck, Clock, MapPin, User, DollarSign, Calendar } from 'lucide-react';
import type { Shipment } from '@/types/shipment';
import { useLoader } from '@/components/providers/loader-provider';

export default function AgentShipmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { fetchFn } = useLoader();

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

    if (error || !shipment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-destructive font-medium">{error || 'Shipment not found'}</p>
                <Button onClick={() => router.push('/agent')}>Go Back</Button>
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
                                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                                    {shipment.duty_charges?.toLocaleString() || '-'} SAR
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
                                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
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
                                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
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
                                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        <span className="text-sm truncate">Packing List</span>
                                    </div>
                                    <a href={shipment.packing_list_file_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            )}
                            {shipment.other_documents_urls && shipment.other_documents_urls.map((url, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        <span className="text-sm truncate">Other Doc #{idx + 1}</span>
                                    </div>
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            ))}

                            {(!shipment.bayan_file_url && !shipment.commercial_invoice_file_url && !shipment.packing_list_file_url) && (
                                <div className="text-sm text-muted-foreground italic text-center py-2">
                                    No documents attached
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
