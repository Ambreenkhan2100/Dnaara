import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { addMinutes } from 'date-fns';

export async function POST(req: Request) {
    try {
        const { email, type = 'register' } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if email exists based on the operation type
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        
        if (type === 'register') {
            // For registration, email should not exist
            if (existingUser.rows.length > 0) {
                return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
            }
        } else if (type === 'reset-password') {
            // For password reset, email must exist
            if (existingUser.rows.length === 0) {
                // Don't reveal that the email doesn't exist for security
                return NextResponse.json({ message: 'OTP sent successfully' });
            }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = addMinutes(new Date(), 10); // OTP expires in 10 minutes
        const purpose = type === 'reset-password' ? 'reset-password' : 'register';

        // Delete any existing OTPs for this email and purpose
        await query(
            'DELETE FROM verification_otps WHERE email = $1 AND purpose = $2',
            [email, purpose]
        );

        // Store new OTP in database
        await query(
            'INSERT INTO verification_otps (email, otp, expires_at, purpose) VALUES ($1, $2, $3, $4)',
            [email, otp, expiresAt, purpose]
        );

        // Send OTP via email
        const emailSubject = type === 'reset-password' 
            ? 'Password Reset Code - Dnaara'
            : 'Your Verification Code - Dnaara';
            
            console.log('sending mail')
        await sendEmail(
            email,
            emailSubject,
            `<p>Your ${type === 'reset-password' ? 'password reset' : 'verification'} code is: <strong>${otp}</strong></p>
             <p>This code expires in 10 minutes.</p>`
        );

        return NextResponse.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
