// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = request.headers.get('x-user-id');

    const offset = (page - 1) * limit;

    const client = await pool.connect();
    try {
        // Get paginated notifications
        const query = `
            SELECT 
                n.id,
                n.title,
                n.message,
                n.entity_type as "entityType",
                n.entity_id as "entityId",
                n.is_read as "isRead",
                n.sender_id as "senderId",
                n.created_at as "createdAt",
                up.legal_business_name as "companyName"
            FROM notifications n
            JOIN user_profiles up ON n.sender_id = up.user_id
            WHERE n.recipient_id = $1
            ORDER BY n.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const countQuery = `
            SELECT COUNT(*) FROM notifications n
            JOIN user_profiles up on n.sender_id = up.user_id
            WHERE n.recipient_id = $1
        `;

        const [notificationsResult, countResult] = await Promise.all([
            client.query(query, [userId, limit, offset]),
            client.query(countQuery, [userId])
        ]);

        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            data: notificationsResult.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function PATCH(request: Request) {
    const { notificationIds } = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
        );
    }

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return NextResponse.json(
            { error: 'Notification IDs array is required' },
            { status: 400 }
        );
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateQuery = `
            UPDATE notifications
            SET is_read = true
            WHERE id = ANY($1::uuid[])
            AND recipient_id = $2
            RETURNING id
        `;

        const result = await client.query(updateQuery, [notificationIds, userId]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'No notifications updated' },
                { status: 404 }
            );
        }

        await client.query('COMMIT');
        return NextResponse.json({
            success: true,
            message: 'Notifications marked as read',
            updatedCount: result.rowCount
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating notifications:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}