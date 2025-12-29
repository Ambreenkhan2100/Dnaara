import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    const client = await pool.connect();
    try {
        const userRole = request.headers.get('x-user-role');
        const userId = request.headers.get("x-user-id");

        const isAgentFetch = userRole !== 'agent';
        const relationshipsQuery = `
            SELECT * FROM importer_agent_relationship 
            WHERE ${isAgentFetch ? 'importer_id' : 'agent_id'} = $1`;

        const relationshipsResult = await client.query(relationshipsQuery, [userId]);

        if (relationshipsResult.rows.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const userIds = relationshipsResult.rows
            .map(rel => isAgentFetch ? rel.agent_id : rel.importer_id)
            .filter((id): id is string => id !== null);

        if (userIds.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const profilesQuery = `
            SELECT up.*
            FROM user_profiles up
            WHERE up.user_id = ANY($1::uuid[])
        `;

        const profilesResult = await client.query(profilesQuery, [userIds]);

        const result = relationshipsResult.rows
            .map(relationship => {
                const targetId = isAgentFetch ? relationship.agent_id : relationship.importer_id;
                const profile = targetId ? profilesResult.rows.find(p => p.user_id === targetId) : null;

                return {
                    id: relationship.id,
                    relationship_status: relationship.relationship_status,
                    created_at: relationship.created_at,
                    ...(profile || {}),
                    importer_id: relationship.importer_id,
                    agent_id: relationship.agent_id,
                    ...(!profile && {
                        user_id: null,
                        legal_business_name: null,
                        trade_registration_number: null,
                        national_address: null,
                        full_name: null,
                        position: null,
                        phone_number: null,
                        company_email: null,
                        national_id: null,
                    })
                };
            });

        return NextResponse.json({ data: result });
    } catch (error) {
        console.error('Error fetching relationships:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}