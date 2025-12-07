'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: '',
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
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (value: string) => {
        setFormData({ ...formData, role: value });
    };

    const sendOtp = async () => {
        if (!formData.companyEmail) {
            toast.error('Please enter your company email');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.companyEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('OTP sent to your email');
            setStep(3);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Registration successful');

            if (data.user.role === 'importer') router.push('/importer');
            else if (data.user.role === 'agent') router.push('/agent');
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
                        {step === 1 && 'Select your role to get started'}
                        {step === 2 && 'Enter your business details'}
                        {step === 3 && 'Verify your email'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>I am a...</Label>
                                <Select onValueChange={handleRoleSelect} value={formData.role}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Importer">Importer</SelectItem>
                                        <SelectItem value="Agent">Agent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => formData.role ? setStep(2) : toast.error('Please select a role')}
                            >
                                Next
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Legal Business Name</Label>
                                <Input name="legalBusinessName" value={formData.legalBusinessName} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Trade Registration Number</Label>
                                <Input name="tradeRegistrationNumber" value={formData.tradeRegistrationNumber} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>National Address (Saudi Arabia)</Label>
                                <Input name="nationalAddress" value={formData.nationalAddress} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input name="fullName" value={formData.fullName} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Position/Role</Label>
                                <Input name="position" value={formData.position} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>National ID / Iqama Number</Label>
                                <Input name="nationalId" value={formData.nationalId} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Company Email</Label>
                                <Input type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input type="password" name="password" value={formData.password} onChange={handleChange} required />
                            </div>
                            <div className="md:col-span-2 flex gap-2 mt-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="w-full">Back</Button>
                                <Button onClick={sendOtp} className="w-full" disabled={loading}>
                                    {loading ? 'Sending OTP...' : 'Next'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Enter OTP sent to {formData.companyEmail}</Label>
                                <Input name="otp" value={formData.otp} onChange={handleChange} placeholder="123456" required maxLength={6} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full">Back</Button>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Register'}
                                </Button>
                            </div>
                        </form>
                    )}
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
