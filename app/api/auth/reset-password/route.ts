import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { error: 'Email, OTP, and new password are required' }, 
                { status: 400 }
            );
        }

        // Verify OTP first
        const otpResult = await query(
            `SELECT * FROM verification_otps 
             WHERE email = $1 
             AND otp = $2 
             AND purpose = 'reset-password'
             AND expires_at > NOW() 
             AND used_at IS NOT NULL
             ORDER BY created_at DESC 
             LIMIT 1`,
            [email, otp]
        );

        if (otpResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid, expired, or unverified OTP' }, 
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        await query('BEGIN');
        
        try {
            const result = await query(
                'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id',
                [hashedPassword, email]
            );

            if (result.rowCount === 0) {
                await query('ROLLBACK');
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            await query('COMMIT');

            return NextResponse.json({ 
                message: 'Password reset successfully' 
            });
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' }, 
            { status: 500 }
        );
    }
}