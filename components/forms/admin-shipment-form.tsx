'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { createAdminShipmentSchema, type CreateAdminShipmentInput } from '@/lib/schemas';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { toast } from 'sonner';
import { useMemo } from 'react';

interface AdminShipmentFormProps {
    onSuccess?: () => void;
    initialData?: any; // Replace with proper type later
}

export function AdminShipmentForm({ onSuccess, initialData }: AdminShipmentFormProps) {
    const { createShipment, updateShipment, users } = useAdminStore();

    const importers = useMemo(() => users.filter(u => u.type === 'importer' && u.status === 'active'), [users]);
    const agents = useMemo(() => users.filter(u => u.type === 'agent' && u.status === 'active'), [users]);

    const form = useForm<CreateAdminShipmentInput>({
        resolver: zodResolver(createAdminShipmentSchema) as any,
        defaultValues: {
            importerId: initialData?.importerId || '',
            agentId: initialData?.agentId || '',
            type: initialData?.type || 'sea',
            portOfShipment: initialData?.portOfShipment || '',
            portOfDestination: initialData?.portOfDestination || '',
            expectedArrival: initialData?.expectedArrival || '',
            billNumber: initialData?.billNumber || '',
            bayanNumber: initialData?.bayanNumber || '',
            dutyAmount: initialData?.dutyAmount || 0,
            comments: initialData?.comments || '',
            notifyImporter: initialData?.notifyImporter || false,
            notifyAgent: initialData?.notifyAgent || false,
        },
    });

    const selectedType = form.watch('type');

    const getBillLabel = () => {
        switch (selectedType) {
            case 'air': return 'Airway Bill Number';
            case 'sea': return 'Bill of Lading Number';
            case 'land': return 'Waybill Number';
            default: return 'Bill Number';
        }
    };

    const onSubmit = (data: CreateAdminShipmentInput) => {
        if (initialData) {
            updateShipment(initialData.id, data);
            toast.success('Shipment updated successfully');
        } else {
            createShipment(data);
            toast.success('Shipment created successfully');
        }
        form.reset();
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="importerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Client" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {importers.map((importer) => (
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

                    <FormField
                        control={form.control}
                        name="agentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agent</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Agent" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="air">Air</SelectItem>
                                    <SelectItem value="sea">Sea</SelectItem>
                                    <SelectItem value="land">Land</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="portOfShipment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Port of Shipment</FormLabel>
                                <FormControl>
                                    <Input placeholder="Port of Shipment" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="portOfDestination"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Port of Destination</FormLabel>
                                <FormControl>
                                    <Input placeholder="Port of Destination" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="expectedArrival"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Expected Arrival</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dutyAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Expected Duty Charges (SAR)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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

                <FormField
                    control={form.control}
                    name="bayanFile"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Upload Bayan Copy</FormLabel>
                            <FormControl>
                                <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Additional Comments</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any additional comments..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-6">
                    <FormField
                        control={form.control}
                        name="notifyImporter"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Notify Client</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="notifyAgent"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Notify Agent</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    {initialData ? 'Update Shipment' : 'Create Shipment'}
                </Button>
            </form>
        </Form>
    );
}
