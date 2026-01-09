import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { uploadBase64ToSupabase } from '@/lib/utils/fileupload';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
    const userId = request.headers.get('x-user-id');

    const body = await request.json();
    const { shipmentId, status, note, file } = body;

    if (!shipmentId) {
        return NextResponse.json({ error: 'Shipment ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (status) {
            // Update shipment status
            const updateQuery = `
            UPDATE shipments 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id
        `;
            const updateRes = await client.query(updateQuery, [status, shipmentId]);

            if (updateRes.rowCount === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
            }
        }


        // Add update entry if note or file is provided
        if (note || file) {
            let fileUrl = null;
            if (file) {
                fileUrl = await uploadBase64ToSupabase(file);
            }

            const insertUpdateQuery = `
                INSERT INTO updates (shipment_id, update_text, document_url, created_by)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(insertUpdateQuery, [shipmentId, note || 'Status update', fileUrl, userId]);
        }

        await client.query('COMMIT');
        return NextResponse.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating shipment status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
