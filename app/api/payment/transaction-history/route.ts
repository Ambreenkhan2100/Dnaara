import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agent_id');
        const importerId = searchParams.get('importer_id');
        const userId = request.headers.get('x-user-id') as string;

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM payments p
            JOIN shipments s ON p.shipment_id = s.id
            WHERE p.payment_status = 'COMPLETED' AND
        `;

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
            WHERE p.payment_status = 'COMPLETED' AND
        `;

        const values: any[] = [];
        const countValues: any[] = [];

        if (agentId) {
            const condition = ` p.agent_id = $1 AND p.importer_id = $2`;
            query += condition;
            countQuery += condition;
            values.push(agentId, userId);
            countValues.push(agentId, userId);
        } else if (importerId) {
            const condition = ` p.importer_id = $1 AND p.agent_id = $2`;
            query += condition;
            countQuery += condition;
            values.push(importerId, userId);
            countValues.push(importerId, userId);
        }

        query += ` ORDER BY p.created_at DESC LIMIT $3 OFFSET $4`;
        values.push(limit, offset);

        const client = await pool.connect();
        try {
            const countResult = await client.query(countQuery, countValues);
            const total = parseInt(countResult.rows[0].total);

            const result = await client.query(query, values);

            const payments = result.rows.map(row => {
                const {
                    payment_id, agent_id, payment_type, bayan_number, bill_number,
                    amount, payment_deadline, description, payment_status, payment_document_url,
                    payment_invoice_url, created_at, updated_at,
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
                    payment_document_url,
                    payment_invoice_url,
                    created_at,
                    updated_at,
                    shipment: {
                        ...shipment,
                        id: shipment.s_id,
                        shipment_id: shipment.shipment_id
                    }
                };
            });

            return NextResponse.json({
                data: payments,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total,
                    total_pages: Math.ceil(total / limit),
                    has_next_page: page * limit < total,
                    has_previous_page: page > 1
                }
            });

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