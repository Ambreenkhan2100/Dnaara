'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileInput } from '@/components/shared/file-input';
import { finalBayanSchema, type FinalBayanInput } from '@/lib/schemas';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { toast } from 'sonner';

interface AgentFinalBayanFormProps {
    requestId: string;
    onSuccess?: () => void;
}

export function AgentFinalBayanForm({ requestId, onSuccess }: AgentFinalBayanFormProps) {
    const submitFinalBayan = useAgentStore((state) => state.submitFinalBayan);

    const form = useForm<FinalBayanInput>({
        resolver: zodResolver(finalBayanSchema),
        defaultValues: {
            finalBayanNumber: '',
            finalBayanFileName: undefined,
            dutyAmount: 0,
            notes: '',
        },
    });

    const onSubmit = (data: FinalBayanInput) => {
        submitFinalBayan(requestId, {
            finalBayanNumber: data.finalBayanNumber,
            finalBayanFileName: data.finalBayanFileName,
            dutyAmount: data.dutyAmount,
            notes: data.notes,
        });
        toast.success('Final Bayan submitted successfully');
        form.reset();
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="finalBayanNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Final Bayan Number</FormLabel>
                            <FormControl>
                                <Input placeholder="FB-2024-001" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="finalBayanFileName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FileInput
                                    label="Final Bayan Copy"
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
                    name="dutyAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duty Amount (AED)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Additional notes..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    Submit Final Bayan
                </Button>
            </form>
        </Form>
    );
}

