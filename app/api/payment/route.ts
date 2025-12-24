// app/api/payment/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { jwtVerify } from 'jose';
import { PaymentData } from '@/types';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserIdFromToken(request: Request): Promise<string | null> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        return payload.userId as string;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        // Verify authentication
        const userId = await getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const paymentData: PaymentData = await request.json();

        // Validate required fields
        if (!paymentData.shipment_id ||
            !paymentData.payment_type ||
            !paymentData.amount ||
            !paymentData.payment_deadline ||
            !paymentData.payment_status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Insert payment into database
        const query = `
            INSERT INTO payments (
                shipment_id, payment_type, agent_id, importer_id, bayan_number, bill_number, 
                amount, payment_deadline, description, payment_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;

        const values = [
            paymentData.shipment_id,
            paymentData.payment_type,
            paymentData.agent_id,
            paymentData.importer_id,
            paymentData.bayan_number || null,
            paymentData.bill_number || null,
            paymentData.amount,
            new Date(paymentData.payment_deadline).toISOString(),
            paymentData.description || null,
            paymentData.payment_status
        ];

        const client = await pool.connect();
        try {
            const result = await client.query(query, values);
            return NextResponse.json(result.rows[0], { status: 201 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating payment:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        // Verify authentication
        const userId = await getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agent_id');
        const importerId = searchParams.get('importer_id');

        // Validate that at least one parameter is provided
        if (!agentId && !importerId) {
            return NextResponse.json(
                { error: 'Either agent_id or importer_id must be provided' },
                { status: 400 }
            );
        }

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
            WHERE 
        `;

        const values: any[] = [];

        if (agentId) {
            query += ` p.agent_id = $1`;
            values.push(agentId);
        } else if (importerId) {
            query += ` s.importer_id = $1`;
            values.push(importerId);
        }

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