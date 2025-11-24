'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';

export default function NewShipmentPage() {
    const router = useRouter();
    const { createShipment, linkedAgents } = useImporterStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        type: 'Sea' as 'Air' | 'Sea' | 'Land',
        portOfShipment: '',
        portOfDestination: '',
        expectedArrivalDate: '',
        billNumber: '',
        bayanNumber: '',
        bayanFile: '',
        dutyCharges: '',
        comments: '',
        agentId: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            createShipment({
                ...formData,
                dutyCharges: formData.dutyCharges ? Number(formData.dutyCharges) : undefined,
            });
            toast.success('Shipment created successfully');
            router.push('/importer');
        } catch (error) {
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

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer">Importer</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>New Shipment</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Create New Shipment</h1>
                    <p className="text-muted-foreground">Enter shipment details to assign to an agent</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Shipment Details</CardTitle>
                    <CardDescription>All fields marked with * are required</CardDescription>
                </CardHeader>
                <CardContent>
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
                                <Label htmlFor="agent">Assign Agent *</Label>
                                <Select
                                    value={formData.agentId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, agentId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {linkedAgents.map(agent => (
                                            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                                        ))}
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
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="portOfDestination">Port of Destination *</Label>
                                <Input
                                    id="portOfDestination"
                                    required
                                    value={formData.portOfDestination}
                                    onChange={e => setFormData(prev => ({ ...prev, portOfDestination: e.target.value }))}
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
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bayanNumber">Bayan No *</Label>
                                <Input
                                    id="bayanNumber"
                                    required
                                    value={formData.bayanNumber}
                                    onChange={e => setFormData(prev => ({ ...prev, bayanNumber: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bayanFile">Upload Bayan Copy</Label>
                                <Input
                                    id="bayanFile"
                                    type="file"
                                    className="cursor-pointer"
                                    onChange={e => {
                                        // In a real app, handle file upload here
                                        // For now, just set a dummy path
                                        if (e.target.files?.[0]) {
                                            setFormData(prev => ({ ...prev, bayanFile: e.target.files![0].name }))
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dutyCharges">Expected Duty Charges</Label>
                                <Input
                                    id="dutyCharges"
                                    type="number"
                                    placeholder="SAR"
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
                            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#0bad85' }}>
                                {isSubmitting ? 'Creating...' : 'Create Shipment'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
