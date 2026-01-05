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
                COUNT(*) FILTER (WHERE status NOT IN ('COMPLETED', 'CANCELLED')) as upcoming_count,
                COALESCE(SUM(CASE WHEN status NOT IN ('COMPLETED', 'CANCELLED') THEN duty_charges END), 0) as upcoming_total,
                COUNT(*) FILTER (WHERE status = 'CONFIRMED') as confirmed_count,
                COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN duty_charges END), 0) as confirmed_total,
                COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_count,
                COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN duty_charges END), 0) as completed_total
            FROM shipments
            WHERE ${roleCondition}
        `;

        const result = await client.query(query, [userId]);
        const row = result.rows[0];

        const response = {
            upcoming: {
                count: parseInt(row.upcoming_count, 10),
                totalDutyCharges: parseFloat(row.upcoming_total) || 0
            },
            confirmed: {
                count: parseInt(row.confirmed_count, 10),
                totalDutyCharges: parseFloat(row.confirmed_total) || 0
            },
            completed: {
                count: parseInt(row.completed_count, 10),
                totalDutyCharges: parseFloat(row.completed_total) || 0
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error generating shipment summary:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}