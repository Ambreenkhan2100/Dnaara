import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    try {
        const role = request.headers.get('x-user-role')

        if (role !== 'admin') {
            return NextResponse.json(
                { error: 'Insufficient privileges' },
                { status: 400 }
            );
        }

        let query = `
            SELECT 
                p.*,
                s.*,
                p.id as payment_id,
                s.id as s_id
            FROM 
                payments p
            JOIN 
                shipments s ON p.shipment_id = s.id
            ORDER BY p.created_at DESC
        `;

        const client = await pool.connect();
        try {
            const result = await client.query(query);

            const payments = result.rows.map(row => {
                const {
                    payment_id, agent_id, payment_type, bayan_number, bill_number,
                    amount, payment_deadline, description, payment_status, payment_invoice_url, payment_document_url, created_at, updated_at,
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
                    payment_invoice_url,
                    payment_document_url,
                    created_at,
                    updated_at,
                    shipment: {
                        ...shipment,
                        id: shipment.s_id
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