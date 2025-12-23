// app/api/payment/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { jwtVerify } from 'jose';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

interface PaymentData {
    payment_id: string;
    agent_id: string;
    shipment_id: string;
    payment_type: string;
    bayan_number?: string;
    bill_number?: string;
    amount: number;
    payment_deadline: string;
    description?: string;
    status: string;
    created_at: Timestamp;
    updated_at: Timestamp;
}

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
            !paymentData.status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Insert payment into database
        const query = `
            INSERT INTO payments (
                shipment_id, payment_type, agent_id, bayan_number, bill_number, 
                amount, payment_deadline, description, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;

        const values = [
            paymentData.shipment_id,
            paymentData.payment_type,
            paymentData.agent_id,
            paymentData.bayan_number || null,
            paymentData.bill_number || null,
            paymentData.amount,
            new Date(paymentData.payment_deadline).toISOString(),
            paymentData.description || null,
            paymentData.status
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

export async function GET() {
    try {
        const query = 'SELECT * FROM payments ORDER BY created_at DESC';
        const client = await pool.connect();
        try {
            const result = await client.query(query);
            return NextResponse.json(result.rows);
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