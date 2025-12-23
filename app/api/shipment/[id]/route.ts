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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                s.*,
                json_agg(DISTINCT st.*) FILTER (WHERE st.id IS NOT NULL) as trucks,
                json_agg(DISTINCT u.*) FILTER (WHERE u.id IS NOT NULL) as updates,
                json_build_object('id', imp.id, 'name', imp.username, 'email', imp.email) as importer,
                json_build_object('id', agt.id, 'name', agt.username, 'email', agt.email) as agent
            FROM shipments s
            LEFT JOIN shipment_trucks st ON s.id = st.shipment_id
            LEFT JOIN updates u ON s.id = u.shipment_id
            LEFT JOIN users imp ON s.importer_id = imp.id
            LEFT JOIN users agt ON s.agent_id = agt.id
            WHERE s.id = $1 AND (s.created_by = $2 OR s.importer_id = $2 OR s.agent_id = $2)
            GROUP BY s.id, imp.id, agt.id
        `;

        const result = await client.query(query, [id, userId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
        }

        return NextResponse.json({ shipment: result.rows[0] });
    } catch (error) {
        console.error('Error fetching shipment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
