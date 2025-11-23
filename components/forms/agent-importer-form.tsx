'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { addImporterSchema, type AddImporterInput } from '@/lib/schemas';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { toast } from 'sonner';

interface AgentImporterFormProps {
    onSuccess?: () => void;
}

export function AgentImporterForm({ onSuccess }: AgentImporterFormProps) {
    const addImporter = useAgentStore((state) => state.addImporter);

    const form = useForm<AddImporterInput>({
        resolver: zodResolver(addImporterSchema),
        defaultValues: {
            companyName: '',
            name: '',
            email: '',
            phone: '',
            linkAccount: false,
        },
    });

    const onSubmit = (data: AddImporterInput) => {
        addImporter(data);
        toast.success('Importer added successfully');
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
                            <FormLabel>Importer Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Importer Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Importer Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="importer@example.com" {...field} />
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
                            <FormLabel>Importer Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="+966..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="linkAccount"
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
                                    Link Account
                                </FormLabel>
                                <FormDescription>
                                    Send an invitation to link this email to an existing account.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    Add Importer
                </Button>
            </form>
        </Form>
    );
}
