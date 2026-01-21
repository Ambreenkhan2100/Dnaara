import { Pool } from "pg";
import { createNotification } from "./notifications";
import { PaymentStatus } from "@/types/enums/PaymentStatus";
import { Notification } from "@/types/notification";
import { notificationEmitter } from "@/lib/notificationEmitter";
import { sendEmail } from "./email";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

interface ReminderInterval {
    hoursBeforeDeadline: number;
    intervalMinutes: number;
}

const REMINDER_INTERVALS: ReminderInterval[] = [
    { hoursBeforeDeadline: 24, intervalMinutes: 360 }, // Every 6 hours when more than 24h left
    { hoursBeforeDeadline: 3, intervalMinutes: 120 },  // Every 2 hours in last 24h
    { hoursBeforeDeadline: 1, intervalMinutes: 60 },   // Every hour in last 3h
    { hoursBeforeDeadline: 0, intervalMinutes: 15 },   // Every 15 mins in last hour
];

// Helper function to create notification with existing client
async function createNotificationWithClient(client: any, notification: Notification) {
    const query = `
    WITH inserted_notification AS (
        INSERT INTO notifications
        (recipient_id, sender_id, title, message, entity_type, entity_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    )
    SELECT 
        inot.sender_id as sender_id,
        inot.id as id,
        inot.title,
        inot.message,
        inot.entity_type as entity_type,
        inot.entity_id as entity_id,
        inot.created_at as created_at,
        inot.is_read as is_read,
        up.legal_business_name as company_name
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

    try {
        const result = await client.query(query, values);

        const createdNotification = result.rows[0];

        if (notification.shipmentId) {
            try {
                const settingsResult = await client.query(
                    'SELECT emails FROM shipment_notification_settings WHERE shipment_id = $1',
                    [notification.shipmentId]
                );

                if (settingsResult.rows.length > 0 && settingsResult.rows[0].emails?.length > 0) {
                    const emails: string[] = settingsResult.rows[0].emails;
                    const emailSubject = notification.title;

                    // Send email to each recipient
                    await Promise.all(emails.map(email =>
                        sendEmail(email, emailSubject, notification.emailBody)
                    ));
                }
            } catch (emailError) {
                console.error('Error sending notification emails:', emailError);
            }
        }

        notificationEmitter.emit("notify", {
            userId: notification.recipientId,
            data: {
                type: notification.type,
                ...createdNotification,
            },
        });

        return createdNotification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

export async function checkPaymentReminders() {
    const client = await pool.connect();

    try {
        // Get all pending payments that are not completed
        const query = `
            SELECT 
                p.id as payment_id,
                p.agent_id,
                p.importer_id,
                p.payment_deadline,
                p.payment_status,
                p.amount,
                p.description,
                p.shipment_id,
                p.bayan_number,
                s.payment_partner
            FROM payments p join shipments s on p.shipment_id = s.id
            WHERE p.payment_status != $1
            AND p.payment_deadline IS NOT NULL
            AND p.payment_deadline > NOW()
            ORDER BY p.payment_deadline ASC
        `;

        const result = await client.query(query, [PaymentStatus.COMPLETED]);
        const payments = result.rows;

        console.log(`Found ${payments.length} pending payments to check for reminders`);

        for (const payment of payments) {
            await processPaymentReminder(client, payment);
        }

    } catch (error) {
        console.error('Error checking payment reminders:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function processPaymentReminder(client: any, payment: any) {
    const now = new Date();
    const deadline = new Date(payment.payment_deadline);
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Find the appropriate reminder interval
    const activeInterval = REMINDER_INTERVALS.find(interval =>
        hoursUntilDeadline > interval.hoursBeforeDeadline
    ) || REMINDER_INTERVALS[REMINDER_INTERVALS.length - 1];

    // Check if we should send a reminder now
    const shouldSendReminder = await shouldSendReminderForPayment(
        client,
        payment.payment_id,
        activeInterval.intervalMinutes
    );

    if (shouldSendReminder) {
        await sendPaymentReminder(client, payment, hoursUntilDeadline);
    }
}

async function shouldSendReminderForPayment(
    client: any,
    paymentId: string,
    intervalMinutes: number
): Promise<boolean> {
    // Check if we've sent a reminder for this payment within the interval
    const query = `
        SELECT COUNT(*) as count
        FROM notifications n
        WHERE n.entity_type = 'PAYMENT'
        AND n.entity_id = $1
        AND n.created_at > NOW() - INTERVAL '${intervalMinutes} minutes'
    `;

    const result = await client.query(query, [paymentId]);
    const count = parseInt(result.rows[0].count);

    return count === 0;
}

async function sendPaymentReminder(client: any, payment: any, hoursUntilDeadline: number) {
    const urgency = getUrgencyLevel(hoursUntilDeadline);
    const timeLeft = formatTimeLeft(hoursUntilDeadline);

    await createNotificationWithClient(client, {
        recipientId: payment.payment_partner === 'agent' ? payment.agent_id : payment.importer_id,
        senderId: payment.payment_partner === 'agent' ? payment.importer_id : payment.agent_id,
        title: `Payment Reminder - ${urgency}`,
        message: `Payment of ${payment.amount} SAR for shipment ${payment.bayan_number || payment.shipment_id} is due in ${timeLeft}. Please complete the payment soon.`,
        entityType: 'PAYMENT',
        entityId: payment.payment_id,
        shipmentId: payment.shipment_id,
        emailBody: `                
                This is a reminder that a payment of ${payment.amount} SAR for shipment ${payment.bayan_number || payment.shipment_id} is due in ${timeLeft}.
                
                ${payment.description ? `Description: ${payment.description}` : ''}
                
                Please complete the payment at your earliest convenience to avoid any delays.
                
                Best regards,
                Dnaara Team
            `,
        type: 'PAYMENT_REMINDER'
    });

    console.log(`Sent payment reminder for payment ${payment.payment_id} (${timeLeft} remaining)`);
}

function getUrgencyLevel(hoursUntilDeadline: number): string {
    if (hoursUntilDeadline <= 1) return 'URGENT';
    if (hoursUntilDeadline <= 3) return 'High Priority';
    if (hoursUntilDeadline <= 24) return 'Reminder';
    return 'Notice';
}

function formatTimeLeft(hoursUntilDeadline: number): string {
    if (hoursUntilDeadline < 1) {
        const minutes = Math.round(hoursUntilDeadline * 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    if (hoursUntilDeadline < 24) {
        const roundedHours = Math.round(hoursUntilDeadline);
        return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''}`;
    }

    const days = Math.floor(hoursUntilDeadline / 24);
    const remainingHours = Math.round(hoursUntilDeadline % 24);

    if (remainingHours === 0) {
        return `${days} day${days !== 1 ? 's' : ''}`;
    }

    return `${days} day${days !== 1 ? 's' : ''} and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
}

// Export for testing
export { REMINDER_INTERVALS, getUrgencyLevel, formatTimeLeft };
