import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { jwtVerify } from 'jose';
import { uploadBase64ToSupabase } from '@/lib/utils/fileupload';

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
    const userId = await getUserIdFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shipmentId, status, note, file } = body;

    if (!shipmentId || !status) {
        return NextResponse.json({ error: 'Shipment ID and Status are required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

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
