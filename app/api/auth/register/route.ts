import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            role,
            legalBusinessName,
            tradeRegistrationNumber,
            nationalAddress,
            fullName,
            position,
            phoneNumber,
            nationalId,
            companyEmail,
            password,
            otp,
        } = body;

        // Verify OTP
        const otpResult = await query(
            'SELECT * FROM verification_otps WHERE email = $1 AND otp = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [companyEmail, otp]
        );

        if (otpResult.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Start transaction
        await query('BEGIN');

        try {
            // Create user
            const userResult = await query(
                'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [fullName, companyEmail, hashedPassword, role.toLowerCase()]
            );
            const userId = userResult.rows[0].id;

            // Create user profile
            await query(
                `INSERT INTO user_profiles (
          user_id, legal_business_name, trade_registration_number, national_address,
          full_name, position, phone_number, national_id, company_email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    userId,
                    legalBusinessName,
                    tradeRegistrationNumber,
                    nationalAddress,
                    fullName,
                    position,
                    phoneNumber,
                    nationalId,
                    companyEmail,
                ]
            );

            // Delete used OTPs
            await query('DELETE FROM verification_otps WHERE email = $1', [companyEmail]);

            await query('COMMIT');

            // Generate token
            const token = generateToken({ userId, role: role.toLowerCase(), email: companyEmail });

            return NextResponse.json({
                message: 'Registration successful',
                token,
                user: { id: userId, email: companyEmail, role: role.toLowerCase() },
            });
        } catch (err) {
            await query('ROLLBACK');
            throw err;
        }
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
