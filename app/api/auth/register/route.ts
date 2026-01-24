import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { RelationshipStatus } from '@/types/invite';
import { uploadBase64ToSupabase } from '@/lib/utils/fileupload';

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
            commercialRegistration,
            vatCertificate,
            nationalAddressDoc,
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

            let commercialRegistrationUrl = null;
            if (commercialRegistration) commercialRegistrationUrl = await uploadBase64ToSupabase(commercialRegistration);

            let vatCertificateUrl = null;
            if (vatCertificate) vatCertificateUrl = await uploadBase64ToSupabase(vatCertificate);

            let nationalAddressDocUrl = null;
            if (nationalAddressDoc) nationalAddressDocUrl = await uploadBase64ToSupabase(nationalAddressDoc);

            // Create user profile
            await query(
                `INSERT INTO user_profiles (
                    user_id, legal_business_name, trade_registration_number, national_address,
                    full_name, position, phone_number, national_id, company_email,
                    commercial_registration_url, vat_certificate_url, national_address_doc_url
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
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
                    commercialRegistrationUrl,
                    vatCertificateUrl,
                    nationalAddressDocUrl,
                ]
            );

            //Check any pending invitations and update relationships.
            const pendingRelationships = await query(
                `SELECT id, agent_id, importer_id 
                    FROM importer_agent_relationship iar
                    WHERE iar.invited_email = $1 
                    AND iar.relationship_status = '${RelationshipStatus.INVITED}'`,
                [companyEmail]
            );

            if (pendingRelationships.rows.length > 0) {
                for (const rel of pendingRelationships.rows) {
                    const updateField = role.toUpperCase() === 'AGENT' ? 'agent_id' : 'importer_id';

                    await query(
                        `UPDATE importer_agent_relationship 
                        SET ${updateField} = $1,
                        relationship_status = '${RelationshipStatus.ACTIVE}',
                        updated_at = NOW()
                        WHERE id = $2`,
                        [userId, rel.id]
                    );
                }
            }

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
