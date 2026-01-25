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
        legal_business_name,
        trade_registration_number,
        national_address,
        full_name,
        position,
        phone_number,
        national_id,
        company_email,
        profile_photo_url,
        commercial_registration_url,
        vat_certificate_url,
        national_address_doc_url,
        national_id_doc_url
    } = body;

    const profile_photo = profile_photo_url.startsWith('http') ? profile_photo_url : await uploadBase64ToSupabase(profile_photo_url);

    const commercial_registration = commercial_registration_url.startsWith('http') ? commercial_registration_url : await uploadBase64ToSupabase(commercial_registration_url);

    const vat_certificate = vat_certificate_url.startsWith('http') ? vat_certificate_url : await uploadBase64ToSupabase(vat_certificate_url);

    const national_address_doc = national_address_doc_url.startsWith('http') ? national_address_doc_url : await uploadBase64ToSupabase(national_address_doc_url);

    const national_id_doc = national_id_doc_url.startsWith('http') ? national_id_doc_url : await uploadBase64ToSupabase(national_id_doc_url);

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
                national_id_doc_url = $13,
                updated_at = NOW()
            WHERE user_id = $13
            RETURNING *
        `;

        const updateValues = [
            legal_business_name || null,
            trade_registration_number || null,
            national_address || null,
            full_name,
            position || null,
            phone_number || null,
            national_id || null,
            company_email || null,
            profile_photo || null,
            commercial_registration || null,
            vat_certificate || null,
            national_address_doc || null,
            national_id_doc || null,
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