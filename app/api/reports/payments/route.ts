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
            WITH payment_aggregates AS (
                SELECT
                    s.type as shipment_type,
                    p.payment_type,
                    COALESCE(SUM(CASE WHEN p.payment_status = 'REQUESTED' THEN p.amount ELSE 0 END), 0) as requested_amount,
                    COALESCE(SUM(CASE WHEN p.payment_status = 'CONFIRMED' THEN p.amount ELSE 0 END), 0) as confirmed_amount,
                    COALESCE(SUM(CASE WHEN p.payment_status = 'COMPLETED' THEN p.amount ELSE 0 END), 0) as completed_amount
                FROM 
                    payments p
                JOIN 
                    shipments s ON p.shipment_id = s.id
                WHERE 
                    ${roleCondition}
                    AND p.payment_status IN ('REQUESTED', 'CONFIRMED', 'COMPLETED')
                GROUP BY 
                    s.type, p.payment_type
            ),
            payment_type_totals AS (
                SELECT 
                    payment_type,
                    SUM(requested_amount) as total_requested,
                    SUM(confirmed_amount) as total_confirmed,
                    SUM(completed_amount) as total_completed
                FROM payment_aggregates
                GROUP BY payment_type
            ),
            overall_totals AS (
                SELECT
                    'all' as group_type,
                    NULL as shipment_type,
                    COALESCE(SUM(requested_amount), 0) as total_requested,
                    COALESCE(SUM(confirmed_amount), 0) as total_confirmed,
                    COALESCE(SUM(completed_amount), 0) as total_completed
                FROM payment_aggregates
            ),
            -- Get totals by shipment type
            shipment_totals AS (
                SELECT
                    'by_shipment' as group_type,
                    shipment_type,
                    COALESCE(SUM(requested_amount), 0) as total_requested,
                    COALESCE(SUM(confirmed_amount), 0) as total_confirmed,
                    COALESCE(SUM(completed_amount), 0) as total_completed
                FROM payment_aggregates
                GROUP BY shipment_type
            ),
            -- Combine both results
            combined_totals AS (
                SELECT * FROM overall_totals
                UNION ALL
                SELECT * FROM shipment_totals
            )
            SELECT 
                -- Overall total payments
                (SELECT 
                    json_build_object(
                        'requested', total_requested,
                        'confirmed', total_confirmed,
                        'completed', total_completed
                    )
                FROM combined_totals 
                WHERE group_type = 'all' AND shipment_type IS NULL
                ) as total_payments,
                
                -- Shipment type totals as an array
                (SELECT 
                    json_agg(
                        json_build_object(
                            'shipmentType', shipment_type,
                            'requested', total_requested,
                            'confirmed', total_confirmed,
                            'completed', total_completed
                        )
                    )
                FROM combined_totals 
                WHERE group_type = 'by_shipment'
                ) as shipment_type_totals,

                -- Payment types
            COALESCE((
                SELECT json_agg(
                    json_build_object(
                        'paymentType', payment_type,
                        'requested', total_requested,
                        'confirmed', total_confirmed,
                        'completed', total_completed
                    )
                ) 
                FROM payment_type_totals
            ), '[]'::json) as payment_types,
            
            -- Shipment types
            COALESCE((
                SELECT json_agg(
                    json_build_object(
                        'shipmentType', shipment_type,
                        'payments', (
                            SELECT json_agg(
                                json_build_object(
                                    'paymentType', payment_type,
                                    'requested', requested_amount,
                                    'confirmed', confirmed_amount,
                                    'completed', completed_amount
                                )
                            )
                            FROM payment_aggregates pa2 
                            WHERE pa2.shipment_type = pa1.shipment_type
                        )
                    )
                )
                FROM (SELECT DISTINCT shipment_type FROM payment_aggregates) pa1
            ), '[]'::json) as by_shipment_type
        `;

        const result = await client.query(query, [userId]);
        const row = result.rows[0];

        const response = {
            totalPayments: {
                all: row.total_payments,  // Overall totals
                byShipment: row.shipment_type_totals || []  // Array of {shipmentType, requested, confirmed, completed}
            },
            ...(row.payment_types || []).reduce((acc: any, item: any) => {
                if (item.paymentType) {
                    acc[item.paymentType] = {
                        requested: parseFloat(item.requested) || 0,
                        confirmed: parseFloat(item.confirmed) || 0,
                        completed: parseFloat(item.completed) || 0,
                    };
                }
                return acc;
            }, {}),
            byShipmentType: (row.by_shipment_type || []).map((shipment: any) => {
                const payments = (shipment.payments || []).reduce((acc: any, payment: any) => {
                    if (payment.paymentType) {
                        acc[payment.paymentType] = {
                            requested: parseFloat(payment.requested) || 0,
                            confirmed: parseFloat(payment.confirmed) || 0,
                            completed: parseFloat(payment.completed) || 0,
                        };
                    }
                    return acc;
                }, {});

                return {
                    type: shipment.shipmentType,
                    ...payments
                };
            })
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