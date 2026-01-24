import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id') as string;
        const role = request.headers.get('x-user-role') as string;

        let query = `
            SELECT 
                p.*,
                s.*,
                p.id as payment_id,
                s.id as shipment_id
            FROM 
                payments p
            JOIN 
                shipments s ON p.shipment_id = s.id
            WHERE p.payment_status = 'COMPLETED' AND
        `;

        const values: any[] = [];

        if (role === 'agent') {
            query += ` p.agent_id = $1`;
        } else {
            query += ` s.importer_id = $1`;
        }
        values.push(userId);

        query += ` ORDER BY p.created_at DESC`;

        const client = await pool.connect();
        try {
            const result = await client.query(query, values);

            const payments = result.rows.map(row => {
                const {
                    payment_id, agent_id, payment_type, bayan_number, bill_number,
                    amount, payment_deadline, description, payment_status, created_at, updated_at,
                    ...shipment
                } = row;

                return {
                    id: payment_id,
                    agent_id,
                    payment_type,
                    bayan_number,
                    bill_number,
                    amount,
                    payment_deadline,
                    description,
                    payment_status,
                    created_at,
                    updated_at,
                    shipment: {
                        ...shipment,
                        id: shipment.id
                    }
                };
            });

            return NextResponse.json(payments);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}