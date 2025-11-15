'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileInput } from '@/components/shared/file-input';
import { createUpcomingRequestSchema, type CreateUpcomingRequestInput } from '@/lib/schemas';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface CreateRequestDrawerProps {
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function CreateRequestDrawer({ trigger, onSuccess }: CreateRequestDrawerProps) {
    const [open, setOpen] = React.useState(false);
    const createUpcomingRequest = useImporterStore((state) => state.createUpcomingRequest);
    const linkedAgents = useImporterStore((state) => state.linkedAgents);

    const form = useForm<CreateUpcomingRequestInput>({
        resolver: zodResolver(createUpcomingRequestSchema),
        defaultValues: {
            preBayanNumber: '',
            preBayanFileName: undefined,
            waybillNumber: '',
            waybillFileName: undefined,
            agentId: undefined,
        },
    });

    const onSubmit = (data: CreateUpcomingRequestInput) => {
        createUpcomingRequest({
            preBayanNumber: data.preBayanNumber,
            preBayanFileName: data.preBayanFileName,
            waybillNumber: data.waybillNumber,
            waybillFileName: data.waybillFileName,
            agentId: data.agentId,
        });
        toast.success('Request created successfully');
        form.reset();
        setOpen(false);
        onSuccess?.();
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {trigger || (
                    <Button style={{ backgroundColor: '#0bad85' }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Request
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Create New Request</DrawerTitle>
                        <DrawerDescription>Add pre-bayan and waybill details</DrawerDescription>
                    </DrawerHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
                            <FormField
                                control={form.control}
                                name="preBayanNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pre-Bayan Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="PB-2024-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="preBayanFileName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileInput
                                                label="Pre-Bayan Copy"
                                                value={field.value}
                                                onChange={field.onChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="waybillNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Airway Bill/BOL/Waybill Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="WB-2024-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="waybillFileName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileInput
                                                label="Document Copy"
                                                value={field.value}
                                                onChange={field.onChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="agentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign Agent (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an agent" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {linkedAgents
                                                    .filter((a) => a.status === 'linked')
                                                    .map((agent) => (
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
                            <DrawerFooter>
                                <Button type="submit" style={{ backgroundColor: '#0bad85' }}>
                                    Create Request
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </Form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

