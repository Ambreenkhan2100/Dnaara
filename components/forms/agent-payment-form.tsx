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
        },
    });

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
