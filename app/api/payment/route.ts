import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { PaymentData } from '@/types';
import { createNotification } from '@/lib/notifications';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
    try {

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
            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Error Creating payment' },
                    { status: 404 }
                );
            }

            const notification = {
                recipientId: paymentData.importer_id,
                senderId: paymentData.agent_id,
                title: 'Payment Created',
                message: `Payment for shipment bill number ${paymentData.bill_number} has been created`,
                entityType: 'PAYMENT',
                entityId: result.rows[0].id,
                shipmentId: paymentData.shipment_id,
                emailBody: `Payment for shipment bill number ${paymentData.bill_number} has been created`,
                type: 'PAYMENT_CREATED'
            }
            createNotification(notification)
            await client.query('COMMIT');
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
        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agent_id');
        const importerId = searchParams.get('importer_id');

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

export async function PATCH(request: Request) {
    try {

        const userId = request.headers.get('x-user-id') as string;
        const role = request.headers.get('x-user-role') as string;

        const { id, payment_status } = await request.json();

        if (!id || !payment_status) {
            return NextResponse.json(
                { error: 'Payment ID and status are required' },
                { status: 400 }
            );
        }

        const query = `
            UPDATE payments 
            SET payment_status = $1, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `;

        const values = [payment_status, id];

        const client = await pool.connect();
        try {
            const result = await client.query(query, values);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Payment not found' },
                    { status: 404 }
                );
            }

            await client.query('COMMIT');

            const notification = {
                recipientId: role === 'agent' ? result.rows[0].importer_id : result.rows[0].agent_id,
                senderId: userId,
                title: 'Payment Completed',
                message: `Payment for bill number ${result.rows[0].bill_number} has been completed`,
                entityType: 'PAYMENT',
                entityId: result.rows[0].payment_id,
                shipmentId: result.rows[0].shipment_id,
                emailBody: `Payment for bill number ${result.rows[0].bill_number} has been completed`,
                type: 'PAYMENT_COMPLETED'
            }
            await createNotification(notification)
            return NextResponse.json(result.rows[0]);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating payment status:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            id,
            payment_type,
            bayan_number,
            bill_number,
            amount,
            payment_deadline,
            description
        } = await request.json();

        if (!id || !payment_type || !amount || !payment_deadline) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const checkQuery = `
            SELECT payment_status 
            FROM payments 
            WHERE id = $1
        `;
        const checkResult = await client.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        const nonEditableStatuses = ['CONFIRMED', 'COMPLETED', 'REJECTED'];
        if (nonEditableStatuses.includes(checkResult.rows[0].payment_status)) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: `Cannot update a ${checkResult.rows[0].payment_status} payment` },
                { status: 400 }
            );
        }

        const updateQuery = `
            UPDATE payments 
            SET 
                payment_type = $1,
                bayan_number = $2,
                bill_number = $3,
                amount = $4,
                payment_deadline = $5,
                description = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *;
        `;

        const values = [
            payment_type,
            bayan_number,
            bill_number,
            amount,
            new Date(payment_deadline).toISOString(),
            description,
            id
        ];

        const result = await client.query(updateQuery, values);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Failed to update payment' },
                { status: 400 }
            );
        }

        await client.query('COMMIT');
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating payment:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function DELETE(request: Request) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { paymentId } = await request.json();

        if (!paymentId) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Payment ID is required' },
                { status: 400 }
            );
        }

        const checkQuery = `
            SELECT id, payment_status 
            FROM payments 
            WHERE id = $1;
        `;

        const checkResult = await client.query(checkQuery, [paymentId]);

        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        if (checkResult.rows[0].payment_status !== 'REQUESTED') {
            await client.query('ROLLBACK');
            return NextResponse.json(
                {
                    error: `Cannot delete payment with status ${checkResult.rows[0].payment_status}. ` +
                        'Only payments with status REQUESTED can be deleted.'
                },
                { status: 400 }
            );
        }

        const deleteQuery = `
            DELETE FROM payments 
            WHERE id = $1
            RETURNING id;
        `;

        const deleteResult = await client.query(deleteQuery, [paymentId]);

        if (deleteResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Failed to delete payment' },
                { status: 400 }
            );
        }

        await client.query('COMMIT');
        return NextResponse.json(
            { success: true, message: 'Payment deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting payment:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}