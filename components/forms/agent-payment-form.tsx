'use client';

import { useState } from 'react';
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
import { format } from 'date-fns';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

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
    prefilledImporterId?: string;
    prefilledShipmentId?: string;
    shipment: Shipment;
    onSubmit: (data: CreatePaymentInput) => void;
}

export function AgentPaymentForm({ prefilledImporterId, prefilledShipmentId, shipment, onSubmit }: AgentPaymentFormProps) {
    // const [documentFile, setDocumentFile] = useState<string | null>(null);
    const [documentFileName, setDocumentFileName] = useState<string>('');

    const form = useForm<CreatePaymentInput>({
        resolver: zodResolver(createPaymentSchema) as any,
        defaultValues: {
            amount: '',
            description: '',
            shipmentId: prefilledShipmentId || shipment?.id || '',
            importerId: prefilledImporterId || shipment?.importer_id || '',
            billNumber: shipment.bill_number,
            bayanNumber: '',
            paymentDeadline: '',
            paymentType: '',
            otherPaymentName: '',
            payment_document_url: '',
        },
    });

    const paymentType = form.watch('paymentType');

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 10MB limit.`);
            return;
        }

        setDocumentFileName(file.name);

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            // setDocumentFile(base64);
            form.setValue('payment_document_url', base64);
        };
        reader.readAsDataURL(file);
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
                        disabled={true}
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

                <FormField
                    control={form.control}
                    name="payment_document_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Document</FormLabel>
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    id="payment-document-upload"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="payment-document-upload"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:bg-muted/20 transition-colors"
                                >
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {documentFileName || 'Click to upload document'}
                                    </span>
                                </label>
                                {documentFileName && (
                                    <p className="text-xs text-muted-foreground">
                                        Selected: {documentFileName}
                                    </p>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    {'Create Payment'}
                </Button>
            </form>
        </Form>
    );
}
