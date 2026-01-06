import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    const client = await pool.connect();
    try {
        let roleCondition = '';
        if (userRole === 'agent') {
            roleCondition = 'p.agent_id = $1';
        } else if (userRole === 'importer') {
            roleCondition = 'p.importer_id = $1';
        } else {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid user role' },
                { status: 403 }
            );
        }

        const query = `
            WITH payment_totals AS (
                SELECT
                    s.type as shipment_type,
                    p.payment_status,
                    p.payment_type,
                    SUM(p.amount) as total_amount
                FROM payments p
                JOIN shipments s ON p.shipment_id = s.id
                WHERE 
                    ${roleCondition}
                    AND p.payment_status IN ('REQUESTED', 'CONFIRMED', 'COMPLETED')
                GROUP BY s.type, p.payment_status, p.payment_type
            ),
            shipment_type_data AS (
                SELECT
                    shipment_type,
                    -- Customs Duty by status
                    SUM(CASE WHEN payment_type = 'Customs Duty' AND payment_status = 'REQUESTED' THEN total_amount ELSE 0 END) as customs_duty_requested,
                    SUM(CASE WHEN payment_type = 'Customs Duty' AND payment_status = 'CONFIRMED' THEN total_amount ELSE 0 END) as customs_duty_confirmed,
                    SUM(CASE WHEN payment_type = 'Customs Duty' AND payment_status = 'COMPLETED' THEN total_amount ELSE 0 END) as customs_duty_completed,
                    
                    -- Other payments by status
                    SUM(CASE WHEN payment_type != 'Customs Duty' AND payment_status = 'REQUESTED' THEN total_amount ELSE 0 END) as other_payments_requested,
                    SUM(CASE WHEN payment_type != 'Customs Duty' AND payment_status = 'CONFIRMED' THEN total_amount ELSE 0 END) as other_payments_confirmed,
                    SUM(CASE WHEN payment_type != 'Customs Duty' AND payment_status = 'COMPLETED' THEN total_amount ELSE 0 END) as other_payments_completed
                FROM payment_totals
                GROUP BY shipment_type
            )
            SELECT
                -- Overall totals (same as before)
                (SELECT COALESCE(SUM(customs_duty_requested), 0) FROM shipment_type_data) as customs_duty_requested,
                (SELECT COALESCE(SUM(customs_duty_confirmed), 0) FROM shipment_type_data) as customs_duty_confirmed,
                (SELECT COALESCE(SUM(customs_duty_completed), 0) FROM shipment_type_data) as customs_duty_completed,
                
                (SELECT COALESCE(SUM(other_payments_requested), 0) FROM shipment_type_data) as other_payments_requested,
                (SELECT COALESCE(SUM(other_payments_confirmed), 0) FROM shipment_type_data) as other_payments_confirmed,
                (SELECT COALESCE(SUM(other_payments_completed), 0) FROM shipment_type_data) as other_payments_completed,
                
                -- Shipment type breakdown
                (SELECT json_agg(json_build_object(
                    'type', shipment_type,
                    'customsDuty', json_build_object(
                        'requested', customs_duty_requested,
                        'confirmed', customs_duty_confirmed,
                        'completed', customs_duty_completed
                    ),
                    'otherPayments', json_build_object(
                        'requested', other_payments_requested,
                        'confirmed', other_payments_confirmed,
                        'completed', other_payments_completed
                    )
                )) FROM shipment_type_data) as by_shipment_type
        `;

        const result = await client.query(query, [userId]);
        const row = result.rows[0];

        const response = {
            customsDuty: {
                requested: parseFloat(row.customs_duty_requested) || 0,
                confirmed: parseFloat(row.customs_duty_confirmed) || 0,
                completed: parseFloat(row.customs_duty_completed) || 0,
            },
            otherPayments: {
                requested: parseFloat(row.other_payments_requested) || 0,
                confirmed: parseFloat(row.other_payments_confirmed) || 0,
                completed: parseFloat(row.other_payments_completed) || 0,
            },
            byShipmentType: row.by_shipment_type.map((item: any) => ({
                type: item.type,
                customsDuty: {
                    requested: parseFloat(item.customsDuty.requested) || 0,
                    confirmed: parseFloat(item.customsDuty.confirmed) || 0,
                    completed: parseFloat(item.customsDuty.completed) || 0
                },
                otherPayments: {
                    requested: parseFloat(item.otherPayments.requested) || 0,
                    confirmed: parseFloat(item.otherPayments.confirmed) || 0,
                    completed: parseFloat(item.otherPayments.completed) || 0
                }
            }))
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error generating payment report:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}