import { NextResponse } from "next/server";
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

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