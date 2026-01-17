// lib/notifications.ts
import { Notification } from "@/types/notification";
import { notificationEmitter } from "@/lib/notificationEmitter";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


export async function createNotification(notification: Notification) {
    const query = `
    WITH inserted_notification AS (
        INSERT INTO notifications
        (recipient_id, sender_id, title, message, entity_type, entity_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    )
    SELECT 
        inot.sender_id as senderId,
        inot.id as id,
        inot.title,
        inot.message,
        inot.entity_type as entityType,
        inot.entity_id as entityId,
        inot.created_at as createdAt,
        inot.is_read as isRead,
        up.legal_business_name as companyName
    FROM inserted_notification inot
    LEFT JOIN user_profiles up ON up.user_id = inot.sender_id
    WHERE inot.id = (SELECT id FROM inserted_notification);
`;

    const values = [
        notification.recipientId,
        notification.senderId,
        notification.title,
        notification.message,
        notification.entityType,
        notification.entityId,
    ];

    const client = await pool.connect();

    try {
        const result = await client.query(query, values);
        
        const createdNotification = result.rows[0];

        notificationEmitter.emit("notify", {
            userId: notification.recipientId,
            data: {
                type: "NEW_NOTIFICATION",
                ...createdNotification,
            },
        });
        await client.query('COMMIT');
        
        return createdNotification;
    } finally {
        client.release();
    }
}
