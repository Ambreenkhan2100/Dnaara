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
            WITH months AS (
                SELECT 
                    to_char(generate_series(
                        date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
                        date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
                        INTERVAL '1 month'
                    ), 'YYYY-MM') as month
            )
            SELECT 
                m.month,
                COALESCE(COUNT(s.id), 0) as count
            FROM 
                months m
            LEFT JOIN 
                shipments s ON to_char(s.created_at, 'YYYY-MM') = m.month
                AND ${roleCondition}
            GROUP BY 
                m.month
            ORDER BY 
                m.month
        `;

        const result = await client.query(query, [userId]);
        
        const data = result.rows.map(row => ({
            month: row.month,
            count: parseInt(row.count, 10)
        }));

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error generating shipments over time report:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}