import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return new NextResponse('User ID is required', { status: 400 });
    }

    try {
        const emails: string[] = await request.json();

        if (!Array.isArray(emails) || emails.length === 0) {
            return new NextResponse('Emails array is required', { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emails.filter(email => !emailRegex.test(email));

        if (invalidEmails.length > 0) {
            return new NextResponse(
                `Invalid email format: ${invalidEmails.join(', ')}`,
                { status: 400 }
            );
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const checkQuery = `
                SELECT email 
                FROM user_emails 
                WHERE user_id = $1 AND email = ANY($2::text[])
            `;
            const existingEmailsResult = await client.query(checkQuery, [userId, emails]);
            const existingEmails = new Set(existingEmailsResult.rows.map(row => row.email));

            const newEmails = emails.filter(email => !existingEmails.has(email));

            if (newEmails.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({
                    message: 'All emails already exist',
                    addedCount: 0,
                    existingCount: existingEmails.size,
                    emails: []
                }, { status: 200 });
            }

            const insertQuery = `
                INSERT INTO user_emails (user_id, email)
                SELECT $1, unnest($2::text[])
                RETURNING id, user_id, email, created_at, updated_at
            `;

            const result = await client.query(insertQuery, [userId, newEmails]);

            await client.query('COMMIT');

            return NextResponse.json({
                data: result.rows
            }, { status: 200 });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in transaction:', error);
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error adding user emails:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return new NextResponse('User ID is required', { status: 400 });
    }

    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return new NextResponse('Email is required', { status: 400 });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const deleteQuery = `
                DELETE FROM user_emails
                WHERE user_id = $1 AND email = $2
                RETURNING id, email
            `;

            const result = await client.query(deleteQuery, [userId, email]);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return new NextResponse('Email not found or already deleted', { status: 404 });
            }

            await client.query('COMMIT');

            return NextResponse.json({
                data: result.rows[0].email
            }, { status: 200 });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error deleting user email:', error);
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error in delete email endpoint:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}