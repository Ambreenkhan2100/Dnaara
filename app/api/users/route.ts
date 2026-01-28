import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    if (!role) {
        return NextResponse.json({ error: 'Role parameter is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT u.*, up.legal_business_name as name, up.full_name, up.phone_number 
       FROM users u 
       JOIN user_profiles up ON u.id = up.user_id 
       WHERE u.role = $1`,
            [role]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
