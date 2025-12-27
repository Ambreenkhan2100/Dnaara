import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    const client = await pool.connect();
    try {
        const { searchParams } = new URL(request.url);
        const fetchParam = searchParams.get('fetch');
        const userId = request.headers.get("x-user-id");

        if ((fetchParam !== 'agents' && fetchParam !== 'importers') || !userId) {
            return NextResponse.json(
                { error: 'Invalid query parameters. Expected fetch=agent|importer&id=:id' },
                { status: 400 }
            );
        }

        const isAgentFetch = fetchParam === 'agents';
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
                const profile = profilesResult.rows.find(p => p.user_id === targetId);

                return profile ? {
                    id: relationship.id,
                    relationship_status: relationship.relationship_status,
                    created_at: relationship.created_at,
                    ...profile,
                    importer_id: relationship.importer_id,
                    agent_id: relationship.agent_id
                } : null;
            })
            .filter(Boolean);

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