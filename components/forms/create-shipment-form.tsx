'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { useLoader } from '../providers/loader-provider';

export interface TruckDetails {
    id: string;
    vehicleNumber: string;
    driverName: string;
    driverMobileOrigin: string;
    driverMobileDestination: string;
}

export enum ShipmentType {
    Air = 'Air',
    Sea = 'Sea',
    Land = 'Land',
}

export interface CreateShipmentFormData {
    type: ShipmentType;
    portOfShipment: string;
    portOfDestination: string;
    expectedArrivalDate: string;
    billNumber: string;
    bayanNumber: string;
    bayanFile: string | null; // base64
    commercialInvoiceNumber: string;
    commercialInvoiceFile: string | null; // base64
    packingListFile: string | null; // base64
    purchaseOrderNumber: string;
    otherDocuments: string[]; // base64 array
    dutyCharges: string;
    comments: string;
    partnerId: string; // agentId or importerId (for non-admin)
    importerId?: string; // for admin
    agentId?: string; // for admin
    paymentPartner: string;
    numberOfPallets?: number;
    trucks?: TruckDetails[];
}

interface CreateShipmentFormProps {
    role: 'agent' | 'importer' | 'admin';
    // currentUserId: string; // Passed from parent
    onSubmit: (data: CreateShipmentFormData) => Promise<void>; // Callback after successful submission
    onCancel: () => void;
}

interface Partner {
    id: string;
    name: string;
}

export function CreateShipmentForm({ role, onSubmit, onCancel }: CreateShipmentFormProps) {
    const [formData, setFormData] = useState<CreateShipmentFormData>({
        type: ShipmentType.Sea,
        portOfShipment: '',
        portOfDestination: '',
        expectedArrivalDate: '',
        billNumber: '',
        bayanNumber: '',
        bayanFile: null,
        commercialInvoiceNumber: '',
        commercialInvoiceFile: null,
        packingListFile: null,
        purchaseOrderNumber: '',
        otherDocuments: [],
        dutyCharges: '',
        comments: '',
        partnerId: '',
        importerId: '',
        agentId: '',
        paymentPartner: '',
        numberOfPallets: undefined,
        trucks: [],
    });

    const { fetchFn: fetchWithLoader } = useLoader();


    const currentUserId = useRoleStore((state) => state.currentUserId);

    const [partners, setPartners] = useState<Partner[]>([]);
    const [importers, setImporters] = useState<Partner[]>([]);
    const [agents, setAgents] = useState<Partner[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [truckDialogOpen, setTruckDialogOpen] = useState(false);
    const [currentTruck, setCurrentTruck] = useState<TruckDetails | null>(null);
    const [truckForm, setTruckForm] = useState<Omit<TruckDetails, 'id'>>({
        vehicleNumber: '',
        driverName: '',
        driverMobileOrigin: '',
        driverMobileDestination: '',
    });

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                if (role === 'admin') {
                    const [importersRes, agentsRes] = await Promise.all([
                        fetch('/api/users?role=importer'),
                        fetch('/api/users?role=agent')
                    ]);
                    const importersData = await importersRes.json();
                    const agentsData = await agentsRes.json();
                    setImporters(importersData);
                    setAgents(agentsData);
                } else {
                    const targetRole = role === 'importer' ? 'agent' : 'importer';
                    const res = await fetch(`/api/users?role=${targetRole}`);
                    const data = await res.json();
                    setPartners(data);
                }
            } catch (error) {
                console.error('Error fetching partners:', error);
                toast.error('Failed to load partners');
            }
        };

        fetchPartners();
    }, [role]);

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                role,
                createdById: currentUserId,
            };

            const token = localStorage.getItem('token');
            const response = await fetchWithLoader('/api/shipment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to create shipment');
            }

            toast.success('Shipment created successfully');
            onSubmit(payload);
        } catch (error) {
            console.error('Error creating shipment:', error);
            toast.error('Failed to create shipment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getBillLabel = () => {
        switch (formData.type) {
            case 'Air': return 'Airway Bill No';
            case 'Sea': return 'Bill of Lading (B/L) No';
            case 'Land': return 'Waybill No';
            default: return 'Bill No';
        }
    };

    const handleAddTruck = () => {
        setCurrentTruck(null);
        setTruckForm({
            vehicleNumber: '',
            driverName: '',
            driverMobileOrigin: '',
            driverMobileDestination: '',
        });
        setTruckDialogOpen(true);
    };

    const handleEditTruck = (truck: TruckDetails) => {
        setCurrentTruck(truck);
        setTruckForm({
            vehicleNumber: truck.vehicleNumber,
            driverName: truck.driverName,
            driverMobileOrigin: truck.driverMobileOrigin,
            driverMobileDestination: truck.driverMobileDestination,
        });
        setTruckDialogOpen(true);
    };

    const handleDeleteTruck = (id: string) => {
        setFormData(prev => ({
            ...prev,
            trucks: prev.trucks?.filter(t => t.id !== id) || []
        }));
    };

    const handleSaveTruck = () => {
        if (currentTruck) {
            // Update
            setFormData(prev => ({
                ...prev,
                trucks: prev.trucks?.map(t => t.id === currentTruck.id ? { ...truckForm, id: currentTruck.id } : t) || []
            }));
        } else {
            // Add
            setFormData(prev => ({
                ...prev,
                trucks: [...(prev.trucks || []), { ...truckForm, id: Math.random().toString(36).substr(2, 9) }]
            }));
        }
        setTruckDialogOpen(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="type">Shipment Type *</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(val: ShipmentType) => setFormData(prev => ({ ...prev, type: val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ShipmentType.Air}>Air</SelectItem>
                            <SelectItem value={ShipmentType.Sea}>Sea</SelectItem>
                            <SelectItem value={ShipmentType.Land}>Land</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {role === 'admin' ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="importer">Importer *</Label>
                            <Select
                                value={formData.importerId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, importerId: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Importer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {importers?.map(importer => (
                                        <SelectItem key={importer.id} value={importer.id}>{importer.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agent">Agent *</Label>
                            <Select
                                value={formData.agentId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, agentId: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Agent" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agents?.map(agent => (
                                        <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="partner">{role === 'importer' ? 'Assign Agent' : 'Importer'} *</Label>
                        <Select
                            value={formData.partnerId}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, partnerId: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={`Select ${role === 'importer' ? 'Agent' : 'Importer'}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {partners?.map(partner => (
                                    <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="paymentPartner">Payment Partner *</Label>
                    <Select
                        value={formData.paymentPartner}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, paymentPartner: val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select payment partner" />
                        </SelectTrigger>
                        <SelectContent>
                            {role === 'admin' ? (
                                <>
                                    <SelectItem value="importer">Importer</SelectItem>
                                    <SelectItem value="agent">Agent</SelectItem>
                                </>
                            ) : (
                                <SelectItem value={role === 'importer' ? 'agent' : 'importer'}>
                                    {role === 'importer' ? 'Agent' : 'Importer'}
                                </SelectItem>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <SelectItem value="dnaara" disabled>
                                                Dnaara
                                            </SelectItem>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Coming Soon!</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <SelectItem value="self">Self</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="portOfShipment">Port of Shipment *</Label>
                    <Input
                        id="portOfShipment"
                        required
                        value={formData.portOfShipment}
                        onChange={e => setFormData(prev => ({ ...prev, portOfShipment: e.target.value }))}
                        placeholder="e.g. Dubai"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="portOfDestination">Port of Destination *</Label>
                    <Input
                        id="portOfDestination"
                        required
                        value={formData.portOfDestination}
                        onChange={e => setFormData(prev => ({ ...prev, portOfDestination: e.target.value }))}
                        placeholder="e.g. Riyadh"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="expectedArrivalDate">Expected Date of Arrival *</Label>
                    <Input
                        id="expectedArrivalDate"
                        type="date"
                        required
                        value={formData.expectedArrivalDate}
                        onChange={e => setFormData(prev => ({ ...prev, expectedArrivalDate: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="billNumber">{getBillLabel()} *</Label>
                    <Input
                        id="billNumber"
                        required
                        value={formData.billNumber}
                        onChange={e => setFormData(prev => ({ ...prev, billNumber: e.target.value }))}
                        placeholder="Enter bill number"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bayanNumber">Bayan No</Label>
                    <Input
                        id="bayanNumber"
                        value={formData.bayanNumber}
                        onChange={e => setFormData(prev => ({ ...prev, bayanNumber: e.target.value }))}
                        placeholder="Enter Bayan number"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bayanFile">Upload Bayan Copy</Label>
                    <Input
                        id="bayanFile"
                        type="file"
                        className="cursor-pointer"
                        onChange={async e => {
                            if (e.target.files?.[0]) {
                                const base64 = await convertFileToBase64(e.target.files[0]);
                                setFormData(prev => ({ ...prev, bayanFile: base64 }));
                            }
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="commercialInvoiceNumber">Commercial Invoice No</Label>
                    <Input
                        id="commercialInvoiceNumber"
                        value={formData.commercialInvoiceNumber}
                        onChange={e => setFormData(prev => ({ ...prev, commercialInvoiceNumber: e.target.value }))}
                        placeholder="Enter Commercial Invoice No"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="commercialInvoiceFile">Upload Commercial Invoice</Label>
                    <Input
                        id="commercialInvoiceFile"
                        type="file"
                        className="cursor-pointer"
                        onChange={async e => {
                            if (e.target.files?.[0]) {
                                const base64 = await convertFileToBase64(e.target.files[0]);
                                setFormData(prev => ({ ...prev, commercialInvoiceFile: base64 }));
                            }
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="packingListFile">Upload Packing List *</Label>
                    <Input
                        id="packingListFile"
                        type="file"
                        required
                        className="cursor-pointer"
                        onChange={async e => {
                            if (e.target.files?.[0]) {
                                const base64 = await convertFileToBase64(e.target.files[0]);
                                setFormData(prev => ({ ...prev, packingListFile: base64 }));
                            }
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="purchaseOrderNumber">Purchase Order No</Label>
                    <Input
                        id="purchaseOrderNumber"
                        value={formData.purchaseOrderNumber}
                        onChange={e => setFormData(prev => ({ ...prev, purchaseOrderNumber: e.target.value }))}
                        placeholder="Enter Purchase Order No"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="otherDocuments">Other Documents</Label>
                    <Input
                        id="otherDocuments"
                        type="file"
                        multiple
                        className="cursor-pointer"
                        onChange={async e => {
                            if (e.target.files) {
                                const files = Array.from(e.target.files);
                                const base64s = await Promise.all(files.map(convertFileToBase64));
                                setFormData(prev => ({ ...prev, otherDocuments: base64s }));
                            }
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dutyCharges">Expected Duty Charges</Label>
                    <Input
                        id="dutyCharges"
                        type="number"
                        placeholder="SAR 0.00"
                        value={formData.dutyCharges}
                        onChange={e => setFormData(prev => ({ ...prev, dutyCharges: e.target.value }))}
                    />
                </div>

                {formData.type === 'Land' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="numberOfPallets">No. of Pallets</Label>
                            <Input
                                id="numberOfPallets"
                                type="number"
                                placeholder="Enter number of pallets"
                                value={formData.numberOfPallets || ''}
                                onChange={e => setFormData(prev => ({ ...prev, numberOfPallets: parseInt(e.target.value) || undefined }))}
                            />
                        </div>

                        <div className="col-span-full space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Truck Details</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddTruck}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Truck
                                </Button>
                            </div>

                            {formData.trucks && formData.trucks.length > 0 ? (
                                <div className="border rounded-md overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="p-3 text-left font-medium">Vehicle No</th>
                                                <th className="p-3 text-left font-medium">Driver</th>
                                                <th className="p-3 text-left font-medium">Mobile (Origin)</th>
                                                <th className="p-3 text-left font-medium">Mobile (Dest)</th>
                                                <th className="p-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.trucks.map((truck) => (
                                                <tr key={truck.id} className="border-t">
                                                    <td className="p-3">{truck.vehicleNumber}</td>
                                                    <td className="p-3">{truck.driverName}</td>
                                                    <td className="p-3">{truck.driverMobileOrigin}</td>
                                                    <td className="p-3">{truck.driverMobileDestination}</td>
                                                    <td className="p-3 text-right space-x-2">
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTruck(truck)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTruck(truck.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 border rounded-md border-dashed text-muted-foreground">
                                    No trucks added yet
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea
                    id="comments"
                    placeholder="Any specific instructions..."
                    value={formData.comments}
                    onChange={e => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                />
            </div>

            <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} style={role === 'importer' || role === 'admin' ? { backgroundColor: '#0bad85' } : undefined}>
                    {isSubmitting ? 'Creating...' : 'Create Shipment'}
                </Button>
            </div>

            <Dialog open={truckDialogOpen} onOpenChange={setTruckDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentTruck ? 'Edit Truck' : 'Add Truck'}</DialogTitle>
                        <DialogDescription>
                            Enter the truck and driver details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                            <Input
                                id="vehicleNumber"
                                value={truckForm.vehicleNumber}
                                onChange={e => setTruckForm(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                                placeholder="e.g. ABC 1234"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="driverName">Driver Name</Label>
                            <Input
                                id="driverName"
                                value={truckForm.driverName}
                                onChange={e => setTruckForm(prev => ({ ...prev, driverName: e.target.value }))}
                                placeholder="Driver's full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="driverMobileOrigin">Driver Mobile (Origin)</Label>
                            <Input
                                id="driverMobileOrigin"
                                value={truckForm.driverMobileOrigin}
                                onChange={e => setTruckForm(prev => ({ ...prev, driverMobileOrigin: e.target.value }))}
                                placeholder="Mobile number in origin country"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="driverMobileDestination">Driver Mobile (Destination)</Label>
                            <Input
                                id="driverMobileDestination"
                                value={truckForm.driverMobileDestination}
                                onChange={e => setTruckForm(prev => ({ ...prev, driverMobileDestination: e.target.value }))}
                                placeholder="Mobile number in destination country"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTruckDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTruck} style={{ backgroundColor: '#0bad85' }}>
                            {currentTruck ? 'Update Truck' : 'Add Truck'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    );
}
