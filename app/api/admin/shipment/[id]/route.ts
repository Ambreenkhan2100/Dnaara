import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


export async function GET(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const role = request.headers.get('x-user-role');
    const { id } = await params;

    if (role !== 'admin') {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                s.*,
                json_agg(DISTINCT st.*) FILTER (WHERE st.id IS NOT NULL) as trucks,
                COALESCE(
                    json_agg(u.* ORDER BY u.created_at DESC) FILTER (WHERE u.id IS NOT NULL),
                    '[]'::json
                ) as updates,
                json_build_object('id', imp.id, 'name', imp.username, 'email', imp.email) as importer,
                json_build_object('id', agt.id, 'name', agt.username, 'email', agt.email) as agent
            FROM shipments s
            LEFT JOIN shipment_trucks st ON s.id = st.shipment_id
            LEFT JOIN updates u ON s.id = u.shipment_id
            LEFT JOIN users imp ON s.importer_id = imp.id
            LEFT JOIN users agt ON s.agent_id = agt.id
            WHERE s.id = $1
            GROUP BY s.id, imp.id, agt.id
        `;

        const result = await client.query(query, [id]);

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
