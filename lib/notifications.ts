import { Notification } from "@/types/notification";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function createNotification(notification: Notification) {

    const query = `
        INSERT INTO notifications
        (recipient_id, sender_id, title, message, entity_type, entity_id)
        VALUES ($1, $2, $3, $4, $5, $6)`;
    const values = [notification.recipientId, notification.senderId, notification.title,
    notification.message, notification.entityType, notification.entityId]

    const client = await pool.connect();
    try {
        const result = await client.query(query, values);
        console.log("inserting notifications ")
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            console.log(" notifications not inserted ")
        }
        console.log(" notifications inserted ")
        await client.query('COMMIT');
    } finally {
        client.release();
    }
}
