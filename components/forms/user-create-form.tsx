'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserSchema, type CreateUserInput } from '@/lib/schemas';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { toast } from 'sonner';

interface UserCreateFormProps {
    onSuccess?: () => void;
}

export function UserCreateForm({ onSuccess }: UserCreateFormProps) {
    const createUser = useAdminStore((state) => state.createUser);

    const form = useForm<CreateUserInput>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            type: 'importer',
            businessName: '',
            crNumber: '',
            companyName: '',
            commercialLicenseNumber: '',
        },
    });

    const userType = form.watch('type');

    const onSubmit = (data: CreateUserInput) => {
        if (data.type === 'importer') {
            createUser({
                name: data.name,
                email: data.email,
                phone: data.phone,
                businessName: data.businessName || '',
                crNumber: data.crNumber || '',
                status: 'pending',
            } as any);
        } else {
            createUser({
                name: data.name,
                email: data.email,
                phone: data.phone,
                companyName: data.companyName || '',
                commercialLicenseNumber: data.commercialLicenseNumber || '',
                status: 'pending',
            } as any);
        }
        toast.success('User created successfully');
        form.reset();
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>User Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="importer">Client</SelectItem>
                                    <SelectItem value="agent">Agent</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="user@example.com" {...field} />
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
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="+966501234567" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {userType === 'importer' && (
                    <>
                        <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Business Name LLC" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="crNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CR Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="CR-12345" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
                {userType === 'agent' && (
                    <>
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Company Name LLC" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="commercialLicenseNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Commercial License Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="CL-1001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
                <Button type="submit" className="w-full" style={{ backgroundColor: '#0bad85' }}>
                    Create User
                </Button>
            </form>
        </Form>
    );
}

