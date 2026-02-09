'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Upload, Truck, Clock, MapPin, User, DollarSign, Calendar, SaudiRiyal, Banknote } from 'lucide-react';
import type { Shipment } from '@/types/shipment';
import { useLoader } from '@/components/providers/loader-provider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShipmentStatusEnum } from '@/types/shipment';
import { useUserStore } from '@/lib/store/useUserStore';

export default function ShipmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Action States
    const [actionNote, setActionNote] = useState('');
    const [updateFile, setUpdateFile] = useState<File | null>(null);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const [completeNote, setCompleteNote] = useState('');

    const { userProfile } = useUserStore()

    const { fetchFn } = useLoader()

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
    }, [params.id]);

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

    const handleUpdate = async () => {
        if (!shipment) return;

        const hasNote = actionNote.trim().length > 0;

        // Importer can only add notes, cannot change status
        if (!hasNote) {
            toast.error('Please add a note');
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

            const res = await fetchFn('/api/shipment/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipmentId: shipment.id,
                    status: shipment.status,
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
            setUpdateDialogOpen(false);
            fetchShipments();
        } catch (error) {
            console.error('Error updating shipment status:', error);
            toast.error('Failed to update shipment status');
        }
    };

    const handleComplete = async () => {
        if (!shipment) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const res = await fetchFn('/api/shipment/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shipmentId: shipment.id,
                    note: completeNote.trim() || undefined
                })
            });

            if (!res.ok) {
                throw new Error('Failed to complete shipment');
            }

            toast.success('Shipment marked as completed successfully');
            setCompleteNote('');
            setCompleteDialogOpen(false);
            fetchShipments();
        } catch (error) {
            console.error('Error completing shipment:', error);
            toast.error('Failed to complete shipment');
        }
    };

    if (error || !shipment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-destructive font-medium">{error || 'Shipment not found'}</p>
                <Button onClick={() => router.push('/importer')}>Go Back</Button>
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
                        <BreadcrumbLink href="/importer">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer/shipments">Shipments</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Shipment: {shipment.shipment_id}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Shipment Details
                        <Badge variant={shipment.status === ShipmentStatusEnum.COMPLETED ? 'default' : shipment.status === ShipmentStatusEnum.CONFIRMED ? 'secondary' : 'outline'}>
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
                <div className="flex gap-2">
                    {shipment.status !== 'COMPLETED' && (
                        <Button onClick={() => setCompleteDialogOpen(true)}>Mark as Completed</Button>
                    )}
                    <Button onClick={() => setUpdateDialogOpen(true)}>Add Update</Button>
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

                    {shipment.comments && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Additional Comments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{shipment.comments}</p>
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
                                                                    ? `Created by ${shipment.importer?.name}`
                                                                    : `Created by ${shipment.agent?.name}`}
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
                    {/* Agent Details */}
                    {shipment.agent && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Agent Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Name</Label>
                                        <div className="font-medium">{shipment.agent.name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Email</Label>
                                        <div className="font-medium break-all">{shipment.agent.email}</div>
                                    </div>
                                    <Button variant="outline" className="w-full mt-2" size="sm">Contact Agent</Button>
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

            <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Shipment</DialogTitle>
                        <DialogDescription>Do you want to mark this shipment as completed?</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Note (Optional)</Label>
                            <Textarea
                                placeholder="Add any final notes..."
                                value={completeNote}
                                onChange={(e) => setCompleteNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>No</Button>
                        <Button onClick={handleComplete}>Yes, Complete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
