'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createAdminPaymentSchema, type CreateAdminPaymentInput } from '@/lib/schemas';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { PaymentStatus } from '@/types/enums/PaymentStatus';

interface AdminPaymentFormProps {
    onSuccess?: () => void;
}

export function AdminPaymentForm({ onSuccess }: AdminPaymentFormProps) {
    const { shipments, createPayment } = useAdminStore();
    const [selectedType, setSelectedType] = useState<'air' | 'sea' | 'land'>('sea');

    const form = useForm<CreateAdminPaymentInput>({
        resolver: zodResolver(createAdminPaymentSchema) as any,
        defaultValues: {
            shipmentType: 'sea',
            shipmentId: '',
            billNumber: '',
            bayanNumber: '',
            amount: 0,
            paymentDeadline: '',
            comments: '',
        },
    });

    // Watch for shipment selection to auto-fill bill/bayan numbers if available
    const selectedShipmentId = form.watch('shipmentId');

    useEffect(() => {
        if (selectedShipmentId) {
            const shipment = shipments.find(s => s.id === selectedShipmentId);
            if (shipment) {
                form.setValue('billNumber', shipment.billNumber || '');
                form.setValue('bayanNumber', shipment.bayanNumber || '');
                form.setValue('shipmentType', shipment.type as any);
                setSelectedType(shipment.type as any);
            }
        }
    }, [selectedShipmentId, shipments, form]);

    const onSubmit = (data: CreateAdminPaymentInput) => {
        const shipment = shipments.find(s => s.id === data.shipmentId);

        createPayment({
            shipmentId: data.shipmentId,
            agentId: shipment?.agentId || 'unknown',
            agentName: shipment?.agentName || 'Unknown Agent',
            importerId: shipment?.importerId || 'unknown',
            amount: data.amount,
            description: `Payment for ${data.shipmentId}`,
            billNumber: data.billNumber,
            bayanNumber: data.bayanNumber,
            paymentDeadline: data.paymentDeadline,
            status: PaymentStatus.REQUESTED,
        });

        toast.success('Payment request created successfully');
        form.reset();
        onSuccess?.();
    };

    const getBillLabel = () => {
        switch (selectedType) {
            case 'air': return 'Airway Bill Number';
            case 'sea': return 'Bill of Lading Number';
            case 'land': return 'Waybill Number';
            default: return 'Bill Number';
        }
    };

    const filteredShipments = shipments.filter(s => s.type === selectedType);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="shipmentType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipment Type</FormLabel>
                            <Select
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    setSelectedType(val as any);
                                    form.setValue('shipmentId', ''); // Reset shipment selection on type change
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="sea">Sea Freight</SelectItem>
                                    <SelectItem value="air">Air Freight</SelectItem>
                                    <SelectItem value="land">Land Freight</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="shipmentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipment</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Shipment" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {filteredShipments.map((shipment) => (
                                        <SelectItem key={shipment.id} value={shipment.id}>
                                            {shipment.id} - {shipment.billNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="billNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{getBillLabel()}</FormLabel>
                                <FormControl>
                                    <Input placeholder={getBillLabel()} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bayanNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bayan Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Bayan Number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Final Amount Payable</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="paymentDeadline"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Deadline</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Additional Comments</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Add any comments here..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    Create Payment Request
                </Button>
            </form>
        </Form>
    );
}
