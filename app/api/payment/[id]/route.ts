import { NextResponse } from "next/server";
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: paymentId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json(
            { error: 'User ID is required' },
            { status: 401 }
        );
    }

    const client = await pool.connect();
    try {
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
            WHERE p.id = $1
        `;

        const result = await client.query(query, [paymentId]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Payment not found or access denied' },
                { status: 404 }
            );
        }

        const payment = result.rows[0];

        const response = {
            id: payment.id,
            agent_id: payment.agent_id,
            payment_type: payment.payment_type,
            bayan_number: payment.bayan_number,
            bill_number: payment.bill_number,
            amount: payment.amount,
            payment_deadline: payment.payment_deadline,
            description: payment.description,
            payment_status: payment.payment_status,
            created_at: payment.created_at,
            updated_at: payment.updated_at,
            shipment: {
                id: payment.shipment_id,
                type: payment.shipment_type,
                port_of_shipment: payment.port_of_shipment,
                port_of_destination: payment.port_of_destination,
                expected_arrival_date: payment.expected_arrival_date,
                bill_number: payment.shipment_bill_number,
                agent_id: payment.agent_id,
                importer_id: payment.importer_id,
                payment_partner: payment.payment_partner,
                company_name: payment.company_name
            }
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching payment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id: paymentId } = await params;

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