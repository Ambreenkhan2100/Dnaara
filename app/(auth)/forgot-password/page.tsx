'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouterWithLoader();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    type: 'reset-password' // Explicitly requested by user
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            toast.success('OTP sent to your email');
            setStep(2);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp,
                    type: 'reset-password'
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid OTP');
            }

            toast.success('OTP verified successfully');
            setStep(3);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp, // Required by the API to verify the session/token again
                    newPassword: password
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            toast.success('Password reset successfully');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        {step === 1 && 'Forgot Password'}
                        {step === 2 && 'Verify OTP'}
                        {step === 3 && 'Reset Password'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {step === 1 && 'Enter your email to receive a verification code'}
                        {step === 2 && `Enter the code sent to ${email}`}
                        {step === 3 && 'Create a new password for your account'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Sending Code...' : 'Send Verification Code'}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Verification Code</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="123456"
                                        className="pl-9 tracking-widest"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </Button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-blue-600 hover:underline"
                                    disabled={loading}
                                >
                                    Change email
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link
                        href="/login"
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
