'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface CreateShipmentFormData {
    type: 'Air' | 'Sea' | 'Land';
    portOfShipment: string;
    portOfDestination: string;
    expectedArrivalDate: string;
    billNumber: string;
    bayanNumber: string;
    bayanFile: string;
    commercialInvoiceNumber: string;
    commercialInvoiceFile: string;
    packingListFile: string;
    purchaseOrderNumber: string;
    otherDocuments: string[];
    dutyCharges: string;
    comments: string;
    partnerId: string; // agentId or importerId
    paymentPartner: string;
}

interface CreateShipmentFormProps {
    role: 'agent' | 'importer';
    partners: { id: string; name: string }[];
    onSubmit: (data: CreateShipmentFormData) => Promise<void> | void;
    isSubmitting: boolean;
    onCancel: () => void;
}

export function CreateShipmentForm({ role, partners, onSubmit, isSubmitting, onCancel }: CreateShipmentFormProps) {
    const [formData, setFormData] = useState<CreateShipmentFormData>({
        type: 'Sea',
        portOfShipment: '',
        portOfDestination: '',
        expectedArrivalDate: '',
        billNumber: '',
        bayanNumber: '',
        bayanFile: '',
        commercialInvoiceNumber: '',
        commercialInvoiceFile: '',
        packingListFile: '',
        purchaseOrderNumber: '',
        otherDocuments: [],
        dutyCharges: '',
        comments: '',
        partnerId: '',
        paymentPartner: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getBillLabel = () => {
        switch (formData.type) {
            case 'Air': return 'Airway Bill No';
            case 'Sea': return 'Bill of Lading (B/L) No';
            case 'Land': return 'Waybill No';
            default: return 'Bill No';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="type">Shipment Type *</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(val: 'Air' | 'Sea' | 'Land') => setFormData(prev => ({ ...prev, type: val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Air">Air</SelectItem>
                            <SelectItem value="Sea">Sea</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

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
                            {partners.map(partner => (
                                <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

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
                            <SelectItem value={role === 'importer' ? 'agent' : 'importer'}>
                                {role === 'importer' ? 'Agent' : 'Importer'}
                            </SelectItem>
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
                        onChange={e => {
                            if (e.target.files?.[0]) {
                                setFormData(prev => ({ ...prev, bayanFile: e.target.files![0].name }))
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
                        onChange={e => {
                            if (e.target.files?.[0]) {
                                setFormData(prev => ({ ...prev, commercialInvoiceFile: e.target.files![0].name }))
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
                        onChange={e => {
                            if (e.target.files?.[0]) {
                                setFormData(prev => ({ ...prev, packingListFile: e.target.files![0].name }))
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
                        onChange={e => {
                            if (e.target.files) {
                                const files = Array.from(e.target.files).map(file => file.name);
                                setFormData(prev => ({ ...prev, otherDocuments: files }))
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
                <Button type="submit" disabled={isSubmitting} style={role === 'importer' ? { backgroundColor: '#0bad85' } : undefined}>
                    {isSubmitting ? 'Creating...' : 'Create Shipment'}
                </Button>
            </div>
        </form>
    );
}
