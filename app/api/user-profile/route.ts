import { uploadBase64ToSupabase } from '@/lib/utils/fileupload';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function PUT(request: Request) {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return new NextResponse('User ID is required', { status: 400 });
    }

    let body;
    try {
        body = await request.json();
    } catch (error) {
        return new NextResponse('Invalid JSON payload', { status: 400 });
    }

    const {
        legalBusinessName,
        tradeRegistrationNumber,
        nationalAddress,
        fullName,
        position,
        phoneNumber,
        nationalId,
        companyEmail,
        profilePhoto,
        commercialRegistration,
        vatCertificate,
        nationalAddressDoc
    } = body;

    const profilePhotoUrl = profilePhoto.startsWith('http') ? profilePhoto : await uploadBase64ToSupabase(profilePhoto);

    const commercialRegistrationUrl = commercialRegistration.startsWith('http') ? commercialRegistration : await uploadBase64ToSupabase(commercialRegistration);

    const vatCertificateUrl = vatCertificate.startsWith('http') ? vatCertificate : await uploadBase64ToSupabase(vatCertificate);

    const nationalAddressDocUrl = nationalAddressDoc.startsWith('http') ? nationalAddressDoc : await uploadBase64ToSupabase(nationalAddressDoc);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update user profile
        const updateProfileQuery = `
            UPDATE user_profiles
            SET 
                legal_business_name = $1,
                trade_registration_number = $2,
                national_address = $3,
                full_name = $4,
                position = $5,
                phone_number = $6,
                national_id = $7,
                company_email = $8,
                profile_photo_url = $9,
                commercial_registration_url = $10,
                vat_certificate_url = $11,
                national_address_doc_url = $12,
                updated_at = NOW()
            WHERE user_id = $13
            RETURNING *
        `;

        const updateValues = [
            legalBusinessName || null,
            tradeRegistrationNumber || null,
            nationalAddress || null,
            fullName,
            position || null,
            phoneNumber || null,
            nationalId || null,
            companyEmail || null,
            profilePhotoUrl || null,
            commercialRegistrationUrl || null,
            vatCertificateUrl || null,
            nationalAddressDocUrl || null,
            userId
        ];

        const result = await client.query(updateProfileQuery, updateValues);


        if (result.rows.length === 0) {
            return new NextResponse('Profile not found', { status: 404 });
        }

        await client.query('COMMIT');
        return NextResponse.json(result.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating user profile:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    } finally {
        client.release();
    }
}

export async function GET(request: Request) {

    const userId = request.headers.get('x-user-id');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const profileQuery = `
            SELECT 
                up.*,
                u.id as user_id,
                u.role
            FROM user_profiles up
            INNER JOIN users u ON up.user_id = u.id
            WHERE up.user_id = $1
        `;
        const profileResult = await client.query(profileQuery, [userId]);

        if (profileResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return new NextResponse('User profile not found', { status: 404 });
        }

        // Get user emails
        const emailsQuery = `
            SELECT 
                id,
                email
            FROM user_emails
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const emailsResult = await client.query(emailsQuery, [userId]);

        await client.query('COMMIT');

        return NextResponse.json({
            ...profileResult.rows[0],
            emails: emailsResult.rows.map((row: any) => row.email)
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error fetching user profile:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    } finally {
        client.release();
    }
}