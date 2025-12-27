'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createPaymentSchema, type CreatePaymentInput } from '@/lib/schemas';
import type { PaymentRequest } from '@/types';
import { Shipment } from '@/types/shipment';
import { ShipmentType } from './create-shipment-form';

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
    initialData?: PaymentRequest;
    prefilledImporterId?: string;
    prefilledShipmentId?: string;
    shipment: Shipment;
    onSubmit: (data: CreatePaymentInput) => void;
}

export function AgentPaymentForm({ initialData, prefilledImporterId, prefilledShipmentId, shipment, onSubmit }: AgentPaymentFormProps) {
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

    const selectedShipmentId = shipment?.id;
    // const selectedShipment = allShipments.find(s => s.id === selectedShipmentId);

    const getBillLabel = () => {
        if (!shipment) return 'Bill Number';
        switch (shipment?.type) {
            case ShipmentType.Air: return 'Airway Bill Number';
            case ShipmentType.Sea: return 'Bill of Lading Number';
            case ShipmentType.Land: return 'Waybill Number';
            default: return 'Bill Number';
        }
    };

    const getPaymentOptions = () => {
        if (!shipment) return [];
        switch (shipment?.type) {
            case ShipmentType.Sea: return SEA_PAYMENT_OPTIONS;
            case ShipmentType.Air: return AIR_PAYMENT_OPTIONS;
            case ShipmentType.Land: return LAND_PAYMENT_OPTIONS;
            default: return [];
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                {/* )} */}

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
