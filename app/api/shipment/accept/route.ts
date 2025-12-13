import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { jwtVerify } from 'jose';

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
    const { shipmentId, note } = body;

    if (!shipmentId) {
        return NextResponse.json({ error: 'Shipment ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update shipment status
        const updateQuery = `
            UPDATE shipments 
            SET is_accepted = TRUE, status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id
        `;
        const updateRes = await client.query(updateQuery, [shipmentId]);

        if (updateRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
        }

        // Add update note if provided
        if (note) {
            const insertUpdateQuery = `
                INSERT INTO updates (shipment_id, update_text, created_by)
                VALUES ($1, $2, $3)
            `;
            await client.query(insertUpdateQuery, [shipmentId, note, userId]);
        }

        await client.query('COMMIT');
        return NextResponse.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error accepting shipment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
