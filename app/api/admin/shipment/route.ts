import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {

    const role = request.headers.get('x-user-role');

    if (role !== 'admin') {
        return NextResponse.json({ error: 'Insufficient Privileges' }, { status: 403 });
    }
    const client = await pool.connect();
    try {
        const query = `
           SELECT 
            s.*,
            json_agg(DISTINCT st.*) FILTER (WHERE st.id IS NOT NULL) as trucks,
            (
                SELECT json_agg(
                    json_build_object(
                        'id', u.id,
                        'shipment_id', u.shipment_id,
                        'update_text', u.update_text,
                        'document_url', u.document_url,
                        'created_by', u.created_by,
                        'created_at', u.created_at,
                        'sender_name', up.legal_business_name
                    )
                    ORDER BY u.created_at DESC
                )
                FROM updates u
                LEFT JOIN user_profiles up ON u.created_by = up.user_id
                WHERE u.shipment_id = s.id
            ) as updates,
            json_build_object('id', imp.id, 'name', imp.legal_business_name, 'email', imp.company_email) as importer,
            json_build_object('id', agt.id, 'name', agt.legal_business_name, 'email', agt.company_email) as agent
        FROM shipments s
        LEFT JOIN shipment_trucks st ON s.id = st.shipment_id
        LEFT JOIN user_profiles imp ON s.importer_id = imp.user_id
        LEFT JOIN user_profiles agt ON s.agent_id = agt.user_id
        GROUP BY s.id, imp.id, agt.id
        ORDER BY s.created_at DESC
        `;

        const result = await client.query(query);
        return NextResponse.json({ shipments: result.rows });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
