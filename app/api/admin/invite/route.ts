import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { sendEmail } from '@/lib/email';
import { InviteRequest } from '@/types/invite';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { searchParams } = new URL(request.url);
        const invite = searchParams.get('invite');
        const role = request.headers.get('x-user-role')

        const { email }: InviteRequest = await request.json();
        let userProfile = null;

        if (role !== 'admin') {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        if (!email || !invite) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 }
            );
        }

        const userResult = await client.query(
            'SELECT id, role FROM users WHERE email = $1',
            [email]
        );

        const userExists = userResult.rows.length > 0;
        const existingUser = userExists ? userResult.rows[0] : null;

        if (userExists) {
            if (
                (invite === 'importer' && existingUser.role !== 'agent') ||
                (invite === 'agent' && existingUser.role !== 'importer')
            ) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: `User already exists as an ${invite}.` },
                    { status: 400 }
                );
            }
        } else {
            const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup`;

            await sendEmail(
                email,
                'You have been invited to join Dnaara',
                `You have been invited to join Dnaara as a ${invite}. 
                Click here to sign up: https://dnaara-v1.vercel.app/signup?email=${email}`
            );
        }

        await client.query('COMMIT');
        return NextResponse.json({
            data: userExists ? { profile: userProfile } : 'Invitation has been sent'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in invite API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}