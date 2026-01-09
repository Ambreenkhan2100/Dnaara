'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { linkAgentSchema, type LinkAgentInput } from '@/lib/schemas';

interface ImporterAgentLinkFormProps {
    onSuccess?: () => void;
    onSubmit?: (email: string) => Promise<void>;
}

export function ImporterAgentLinkForm({ onSuccess, onSubmit: parentOnSubmit }: ImporterAgentLinkFormProps) {
    const form = useForm<LinkAgentInput>({
        resolver: zodResolver(linkAgentSchema),
        defaultValues: {
            email: '',
        },
    });

    const handleSubmit = async (data: LinkAgentInput) => {
        if (parentOnSubmit) {
            await parentOnSubmit(data.email);
        }
        form.reset();
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Agent Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="agent@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    Link Agent
                </Button>
            </form>
        </Form>
    );
}

