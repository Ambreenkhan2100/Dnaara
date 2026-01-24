import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

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