'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addImporterSchema, type AddImporterInput } from '@/lib/schemas';
import { toast } from 'sonner';

interface AgentImporterFormProps {
    onSubmit: (email: string) => void;
}

export function AgentImporterForm({ onSubmit }: AgentImporterFormProps) {
    const form = useForm<AddImporterInput>({
        resolver: zodResolver(addImporterSchema),
        defaultValues: {
            email: '',
        },
    });

    const handleSubmission = (data: AddImporterInput) => {
        onSubmit(data.email);
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmission)} className="space-y-4">
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
                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    Add Importer
                </Button>
            </form>
        </Form>
    );
}
