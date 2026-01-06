import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    const client = await pool.connect();
    try {
        const roleCondition = userRole === 'agent'
            ? 'agent_id = $1'
            : userRole === 'importer'
                ? 'importer_id = $1'
                : null;

        if (!roleCondition) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid user role' },
                { status: 403 }
            );
        }

        const query = `
            SELECT 
                COALESCE(status, 'DRAFT') as status,
                COUNT(*) as count
            FROM 
                shipments
            WHERE 
                ${roleCondition}
            GROUP BY 
                status
        `;

        const result = await client.query(query, [userId]);
        
        const data = result.rows.map(row => ({
            status: row.status,
            count: parseInt(row.count, 10)
        }));

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error generating shipments by status report:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}