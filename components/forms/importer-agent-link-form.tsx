'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { linkAgentSchema, type LinkAgentInput } from '@/lib/schemas';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { toast } from 'sonner';

interface ImporterAgentLinkFormProps {
    onSuccess?: () => void;
}

export function ImporterAgentLinkForm({ onSuccess }: ImporterAgentLinkFormProps) {
    const linkAgentByEmail = useImporterStore((state) => state.linkAgentByEmail);

    const form = useForm<LinkAgentInput>({
        resolver: zodResolver(linkAgentSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = (data: LinkAgentInput) => {
        linkAgentByEmail(data.email);
        toast.success('Agent linked successfully');
        form.reset();
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

