import { NextResponse } from 'next/server';
import { uploadBase64ToSupabase } from '@/lib/utils/fileupload';
import { Pool } from 'pg';
import { createNotification } from '@/lib/notifications';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function PUT(request: Request) {
    try {
        const userId = request.headers.get('x-user-id') as string;
        const role = request.headers.get('x-user-role') as string;

        const { id, file } = await request.json();

        if (!id || !file) {
            return NextResponse.json(
                { error: 'Payment ID and file are required' },
                { status: 400 }
            );
        }

        let fileUrl: string;
        try {
            fileUrl = await uploadBase64ToSupabase(file);
        } catch (error) {
            console.error('Error uploading file:', error);
            return NextResponse.json(
                { error: 'Failed to upload document' },
                { status: 500 }
            );
        }

        const client = await pool.connect();
        try {
            const query = `
                UPDATE payments 
                SET 
                    payment_status = 'COMPLETED',
                    payment_document_url = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *;
            `;

            const result = await client.query(query, [fileUrl, id]);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Payment not found' },
                    { status: 404 }
                );
            }

            const formattedAmount = new Intl.NumberFormat('en-SA', {
                style: 'currency',
                currency: 'SAR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(result.rows[0].amount);

            const insertUpdateQuery = `
                INSERT INTO updates (shipment_id, update_text, document_url, created_by)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(insertUpdateQuery, [result.rows[0].shipment_id, `Payment completed for amount ${formattedAmount}`,
            result.rows[0].payment_document_url, userId]);

            await client.query('COMMIT');
            const notification = {
                recipientId: role === 'agent' ? result.rows[0].importer_id : result.rows[0].agent_id,
                senderId: userId,
                title: 'Payment Completed',
                message: `Payment for bill number ${result.rows[0].bill_number} has been completed`,
                entityType: 'PAYMENT',
                entityId: result.rows[0].id,
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
        console.error('Error completing payment:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}