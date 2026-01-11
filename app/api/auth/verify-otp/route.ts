import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email, otp, type = 'reset-password' } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        const otpResult = await query(
            `SELECT * FROM verification_otps 
             WHERE email = $1 
             AND otp = $2 
             AND purpose = $3
             AND expires_at > NOW() 
             AND used_at IS NULL
             ORDER BY created_at DESC 
             LIMIT 1`,
            [email, otp, type === 'reset-password' ? 'reset-password' : 'register']
        );

        if (otpResult.rows.length === 0) {
            return NextResponse.json(
                { message: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        await query(
            'UPDATE verification_otps SET used_at = NOW() WHERE id = $1',
            [otpResult.rows[0].id]
        );

        return NextResponse.json({
            message: 'OTP verified successfully',
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json(
            { error: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}