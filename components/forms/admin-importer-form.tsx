'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { addAdminImporterSchema, type AddAdminImporterInput } from '@/lib/schemas';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { toast } from 'sonner';

interface AdminImporterFormProps {
    onSuccess?: () => void;
}

export function AdminImporterForm({ onSuccess }: AdminImporterFormProps) {
    const { createUser } = useAdminStore();

    const form = useForm<AddAdminImporterInput>({
        resolver: zodResolver(addAdminImporterSchema) as any,
        defaultValues: {
            companyName: '',
            name: '',
            email: '',
            phone: '',
            sendInvite: false,
        },
    });

    const onSubmit = (data: AddAdminImporterInput) => {
        createUser({
            ...data,
            type: 'importer',
            status: data.sendInvite ? 'pending' : 'active',
        } as any);

        toast.success(data.sendInvite ? 'Client invited successfully' : 'Client added successfully');
        form.reset();
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Company Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Client Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email Address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="Phone Number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="sendInvite"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Send Invite via Email
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    The client will receive an email to set up their account.
                                </p>
                            </div>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    Add Client
                </Button>
            </form>
        </Form>
    );
}
