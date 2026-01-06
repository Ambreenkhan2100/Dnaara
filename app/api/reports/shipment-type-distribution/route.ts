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

        const query = `
            SELECT 
                type,
                COUNT(1) as count
            FROM shipments
            WHERE ${roleCondition}
            GROUP BY type
        `;

        const result = await client.query(query, [userId]);
        
        const data = result.rows.map(row => ({
            type: row.type,
            count: parseInt(row.count, 10)
        }));

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error generating shipment type distribution:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}