import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { sendEmail } from '@/lib/email';
import { CompanyType, InviteRequest } from '@/types/invite';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        let relationshipStatus = 'INVITED';

        const { id, email, company_type }: InviteRequest = await request.json();
        let userProfile = null;

        if (!id || !email || !company_type || !Object.values(CompanyType).includes(company_type)) {
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
                (company_type === 'IMPORTER' && existingUser.role !== 'agent') ||
                (company_type === 'AGENT' && existingUser.role !== 'importer')
            ) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: `User must be a ${company_type === 'IMPORTER' ? 'AGENT' : 'IMPORTER'}` },
                    { status: 400 }
                );
            } else {
                const profileResult = await client.query(
                    `SELECT up.* 
                     FROM user_profiles up
                     WHERE up.user_id = $1`,
                    [existingUser.id]
                );

                userProfile = profileResult.rows[0] || null;
                relationshipStatus = 'ACTIVE'
            }
        } else {
            const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup`;

            await sendEmail(
                email,
                'You have been invited to join Dnaara',
                `You have been invited to join Dnaara as a ${company_type === 'IMPORTER' ? 'importer' : 'agent'}. 
                Click here to sign up: ${signupUrl}`
            );
        }

        const importerId = company_type === 'IMPORTER' ? id : (existingUser?.id || null);
        const agentId = company_type === 'AGENT' ? id : (existingUser?.id || null);

        const insertQuery = `
            INSERT INTO importer_agent_relationship (
                importer_id, agent_id, invited_email, 
                relationship_status, invited_by
            ) VALUES ($1, $2, $3, '${relationshipStatus}', $4)
            RETURNING *;
        `;

        await client.query(insertQuery, [
            importerId,
            agentId,
            email,
            company_type
        ]);

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