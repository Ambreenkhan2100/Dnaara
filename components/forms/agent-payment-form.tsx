'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createPaymentSchema, type CreatePaymentInput } from '@/lib/schemas';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { toast } from 'sonner';
import { useEffect } from 'react';
import type { PaymentRequest } from '@/types';

const SEA_PAYMENT_OPTIONS = [
    'Customs Duty',
    'Port & Handling Fee',
    'Demurrage',
    'Detention',
    'Shipping Line Charges',
    'Broker & Clearance Fee',
    'Other Charges',
];

const AIR_PAYMENT_OPTIONS = [
    'Customs Duty',
    'Handling & Carrier Charges',
    'SAL Charges',
    'Inspection Fee',
    'Broker & Clearance Fee',
    'Delivery Fee',
    'Other Charges',
];

const LAND_PAYMENT_OPTIONS = [
    'Customs Duty',
    'Customs Service Fee',
    'Border Fee',
    'Transport & Carrier Fee',
    'Broker & Clearance Fee',
    'Other Charges',
];

interface AgentPaymentFormProps {
    onSuccess?: () => void;
    initialData?: PaymentRequest;
    prefilledImporterId?: string;
    prefilledShipmentId?: string;
}

export function AgentPaymentForm({ onSuccess, initialData, prefilledImporterId, prefilledShipmentId }: AgentPaymentFormProps) {
    const { createPayment, updatePayment, linkedImporters, upcoming, pending, completed } = useAgentStore();

    // Combine all shipments for selection
    const allShipments = [...upcoming, ...pending, ...completed];

    const form = useForm<CreatePaymentInput>({
        resolver: zodResolver(createPaymentSchema) as any,
        defaultValues: {
            amount: initialData?.amount || 0,
            description: initialData?.description || '',
            shipmentId: initialData?.shipmentId || prefilledShipmentId || '',
            importerId: initialData?.importerId || prefilledImporterId || '',
            billNumber: initialData?.billNumber || '',
            bayanNumber: initialData?.bayanNumber || '',
            paymentDeadline: initialData?.paymentDeadline || '',
            paymentType: initialData?.paymentType || '',
            otherPaymentName: initialData?.otherPaymentName || '',
        },
    });

    const paymentType = form.watch('paymentType');

    const selectedShipmentId = form.watch('shipmentId');
    const selectedShipment = allShipments.find(s => s.id === selectedShipmentId);

    const getBillLabel = () => {
        if (!selectedShipment) return 'Bill Number';
        switch (selectedShipment.type) {
            case 'air': return 'Airway Bill Number';
            case 'sea': return 'Bill of Lading Number';
            case 'land': return 'Waybill Number';
            default: return 'Bill Number';
        }
    };

    const getPaymentOptions = () => {
        if (!selectedShipment) return [];
        switch (selectedShipment.type) {
            case 'sea': return SEA_PAYMENT_OPTIONS;
            case 'air': return AIR_PAYMENT_OPTIONS;
            case 'land': return LAND_PAYMENT_OPTIONS;
            default: return [];
        }
    };

    const onSubmit = (data: CreatePaymentInput) => {
        if (initialData) {
            updatePayment(initialData.id, data);
            toast.success('Payment updated successfully');
        } else {
            createPayment(data);
            toast.success('Payment created successfully');
        }
        form.reset();
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!prefilledImporterId && (
                    <FormField
                        control={form.control}
                        name="importerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Importer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Importer" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {linkedImporters.map((importer) => (
                                            <SelectItem key={importer.id} value={importer.id}>
                                                {importer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {!prefilledShipmentId && (
                    <FormField
                        control={form.control}
                        name="shipmentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Shipment</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Shipment" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {allShipments.map((shipment) => (
                                            <SelectItem key={shipment.id} value={shipment.id}>
                                                {shipment.id} - {shipment.type} ({shipment.status})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {selectedShipment && (
                    <FormField
                        control={form.control}
                        name="paymentType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Payment Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {getPaymentOptions().map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {paymentType === 'Other Charges' && (
                    <FormField
                        control={form.control}
                        name="otherPaymentName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Other Payment Name (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter payment name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

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
                                <FormLabel>Amount (SAR)</FormLabel>
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
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Payment description..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    {initialData ? 'Update Payment' : 'Create Payment'}
                </Button>
            </form>
        </Form>
    );
}
