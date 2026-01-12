'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { signupSchema, type SignupInput } from '@/lib/schemas';

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isInvite, setIsInvite] = useState(false)

    useEffect(() => {
        const email = new URLSearchParams(window.location.search).get('email');
        if (email) {
            setIsInvite(true);
            form.setValue('companyEmail', email);
        }
    }, [])

    const form = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: undefined,
            legalBusinessName: '',
            tradeRegistrationNumber: '',
            nationalAddress: '',
            fullName: '',
            position: '',
            phoneNumber: '',
            nationalId: '',
            companyEmail: '',
            password: '',
            otp: '',
        },
    });

    const sendOtp = async () => {
        const step1Fields: (keyof SignupInput)[] = [
            'role',
            'legalBusinessName',
            'tradeRegistrationNumber',
            'nationalAddress',
            'fullName',
            'position',
            'phoneNumber',
            'nationalId',
            'companyEmail',
            'password'
        ];

        const isValid = await form.trigger(step1Fields);

        if (!isValid) {
            return;
        }

        const email = form.getValues('companyEmail');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('OTP sent to your email');
            setStep(2);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: SignupInput) => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            toast.success('Registration successful');

            if (result.user.role === 'importer') router.push('/importer');
            else if (result.user.role === 'agent') router.push('/agent');
            else router.push('/');

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
                    <CardDescription className="text-center">
                        {step === 1 && 'Enter your business details'}
                        {step === 2 && 'Verify your email'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>I am a...</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Role" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Importer">Importer</SelectItem>
                                                            <SelectItem value="Agent">Agent</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="legalBusinessName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Legal Business Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tradeRegistrationNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Trade Registration Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="nationalAddress"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>National Address (Saudi Arabia)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="position"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Position/Role</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="nationalId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>National ID / Iqama Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="companyEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company Email</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isInvite} type="email" {...field} suppressHydrationWarning className={isInvite ? 'bg-gray-100 pointer-events-none' : ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? 'text' : 'password'}
                                                            {...field}
                                                            suppressHydrationWarning
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-gray-500" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* <div className="flex flex-row w-full gap-2 mt-4 col-span-2"> */}
                                    <Button type="button" onClick={sendOtp} className="w-full col-span-2" disabled={loading}>
                                        {loading ? 'Sending OTP...' : 'Next'}
                                    </Button>

                                    {/* </div> */}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 flex flex-col items-stretch">
                                    <FormField
                                        control={form.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Enter OTP sent to {form.getValues('companyEmail')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="123456" maxLength={6} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" className='w-1/2' variant="outline" onClick={() => setStep(1)}>Back</Button>
                                    <Button type="submit" className='w-1/2' disabled={loading}>
                                        {loading ? 'Verifying...' : 'Register'}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
