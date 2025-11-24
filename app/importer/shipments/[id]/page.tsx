'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { FileText, Upload } from 'lucide-react';
import type { Request } from '@/types';

export default function ShipmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { requests, updateShipment } = useImporterStore();
    const [shipment, setShipment] = useState<Request | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Request>>({});

    useEffect(() => {
        const found = requests.find(r => r.id === params.id);
        if (found) {
            setShipment(found);
            setFormData(found);
        } else {
            // Handle not found
        }
    }, [params.id, requests]);

    if (!shipment) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    const handleSave = () => {
        updateShipment(shipment.id, formData);
        setIsEditing(false);
        toast.success('Shipment updated successfully');
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would append to a comments array.
        // For now, we just update the 'comments' field or show a toast.
        toast.success('Comment added');
    };

    const isAssigned = shipment.status === 'ASSIGNED';
    const isConfirmed = shipment.status === 'CONFIRMED';
    const isCompleted = shipment.status === 'COMPLETED';

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer">Importer</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Shipment {shipment.billNumber}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Shipment Details
                        <Badge variant={isCompleted ? 'default' : isConfirmed ? 'secondary' : 'outline'}>
                            {shipment.status}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground">
                        {shipment.type} Shipment • {shipment.portOfShipment} to {shipment.portOfDestination}
                    </p>
                </div>
                {isAssigned && (
                    <div className="space-x-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSave}>Save Changes</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit Details</Button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Bill Number</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.billNumber}
                                            onChange={e => setFormData({ ...formData, billNumber: e.target.value })}
                                        />
                                    ) : (
                                        <div className="font-medium">{shipment.billNumber}</div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Bayan Number</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.bayanNumber}
                                            onChange={e => setFormData({ ...formData, bayanNumber: e.target.value })}
                                        />
                                    ) : (
                                        <div className="font-medium">{shipment.bayanNumber}</div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Expected Arrival</Label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={formData.expectedArrivalDate}
                                            onChange={e => setFormData({ ...formData, expectedArrivalDate: e.target.value })}
                                        />
                                    ) : (
                                        <div className="font-medium">{shipment.expectedArrivalDate}</div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Duty Charges (SAR)</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={formData.dutyCharges}
                                            onChange={e => setFormData({ ...formData, dutyCharges: Number(e.target.value) })}
                                        />
                                    ) : (
                                        <div className="font-medium">{shipment.dutyCharges?.toLocaleString() || '-'}</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comments Section for Confirmed Shipments */}
                    {(isConfirmed || isCompleted) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Communication</CardTitle>
                                <CardDescription>Comments and updates from the agent</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg text-sm">
                                    <p className="font-semibold mb-1">{shipment.agentName}</p>
                                    <p>Shipment is currently being processed at customs. Will update shortly.</p>
                                    <span className="text-xs text-muted-foreground mt-2 block">Today at 10:30 AM</span>
                                </div>

                                {isConfirmed && (
                                    <div className="flex gap-2 mt-4">
                                        <Input placeholder="Type a message..." />
                                        <Button size="icon" onClick={handleCommentSubmit}>
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="outline">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="font-medium">{shipment.agentName}</div>
                                <div className="text-sm text-muted-foreground">ID: {shipment.agentId}</div>
                                <Button variant="outline" className="w-full mt-2" size="sm">Contact Agent</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">Bayan Copy</span>
                                </div>
                                <Button variant="ghost" size="sm">View</Button>
                            </div>
                            {shipment.waybillFileName && (
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm">Waybill</span>
                                    </div>
                                    <Button variant="ghost" size="sm">View</Button>
                                </div>
                            )}
                            {isConfirmed && (
                                <Button variant="outline" className="w-full border-dashed">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Document
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
