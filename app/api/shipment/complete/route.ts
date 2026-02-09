import { createNotification } from '@/lib/notifications';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
    const userId = request.headers.get('x-user-id') as string;

    const body = await request.json();
    const { shipmentId, note } = body;

    if (!shipmentId) {
        return NextResponse.json({ error: 'Shipment ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update shipment status to COMPLETED
        const updateQuery = `
            UPDATE shipments 
            SET is_completed = TRUE, status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const updateRes = await client.query(updateQuery, [shipmentId]);

        if (updateRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
        }

        // Add update note
        const updateText = `Shipment marked as COMPLETED${note?.length ? ' | ' + note : ''}`;
        const insertUpdateQuery = `
            INSERT INTO updates (shipment_id, update_text, created_by)
            VALUES ($1, $2, $3)
        `;
        await client.query(insertUpdateQuery, [shipmentId, updateText, userId]);

        await client.query('COMMIT');

        const notification = {
            recipientId: updateRes.rows[0].agent_id,
            senderId: userId,
            title: 'Shipment Completed',
            message: `Shipment ${updateRes.rows[0].shipment_id} has been marked as Completed`,
            entityType: 'SHIPMENT',
            entityId: shipmentId,
            shipmentId: updateRes.rows[0].id,
            emailBody: `Shipment ${updateRes.rows[0].shipment_id} has been marked as Completed`,
            type: 'SHIPMENT_COMPLETED'
        }
        await createNotification(notification)
        return NextResponse.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error completing shipment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
