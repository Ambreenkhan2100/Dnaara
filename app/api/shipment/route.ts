import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { uploadBase64ToSupabase } from '@/lib/utils/fileupload';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');
    const client = await pool.connect();
    try {
        // Fetch shipments where the user is involved (created_by, importer_id, or agent_id)
        // Also fetch related trucks and updates
        const query = `
            SELECT 
                s.*,
                json_agg(DISTINCT st.*) FILTER (WHERE st.id IS NOT NULL) as trucks,
                json_agg(DISTINCT u.*) FILTER (WHERE u.id IS NOT NULL) as updates,
                json_build_object('id', imp.id, 'name', imp.username, 'email', imp.email) as importer,
                json_build_object('id', agt.id, 'name', agt.username, 'email', agt.email) as agent
            FROM shipments s
            LEFT JOIN shipment_trucks st ON s.id = st.shipment_id
            LEFT JOIN updates u ON s.id = u.shipment_id
            LEFT JOIN users imp ON s.importer_id = imp.id
            LEFT JOIN users agt ON s.agent_id = agt.id
            WHERE s.created_by = $1 OR s.importer_id = $1 OR s.agent_id = $1
            GROUP BY s.id, imp.id, agt.id
            ORDER BY s.created_at DESC
        `;

        const result = await client.query(query, [userId]);
        return NextResponse.json({ shipments: result.rows });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function POST(request: Request) {
    const userId = request.headers.get('x-user-id');

    const body = await request.json();
    const {
        type,
        portOfShipment,
        portOfDestination,
        expectedArrivalDate,
        billNumber,
        bayanNumber,
        bayanFile, // base64
        commercialInvoiceNumber,
        commercialInvoiceFile, // base64
        packingListFile, // base64
        purchaseOrderNumber,
        otherDocuments, // array of base64
        dutyCharges,
        comments,
        partnerId,
        importerId,
        agentId,
        paymentPartner,
        numberOfPallets,
        trucks,
        role // the role of the creator
    } = body;

    // Upload files
    let bayanFileUrl = null;
    if (bayanFile) bayanFileUrl = await uploadBase64ToSupabase(bayanFile);

    let commercialInvoiceFileUrl = null;
    if (commercialInvoiceFile) commercialInvoiceFileUrl = await uploadBase64ToSupabase(commercialInvoiceFile);

    let packingListFileUrl = null;
    if (packingListFile) packingListFileUrl = await uploadBase64ToSupabase(packingListFile);

    const otherDocumentsUrls: string[] = [];
    if (otherDocuments && Array.isArray(otherDocuments)) {
        for (const doc of otherDocuments) {
            const url = await uploadBase64ToSupabase(doc);
            otherDocumentsUrls.push(url);
        }
    }

    // Determine importer_id and agent_id based on creator role
    let finalImporterId = importerId;
    let finalAgentId = agentId;

    if (role === 'agent') {
        finalAgentId = userId;
        finalImporterId = partnerId;
    } else if (role === 'importer') {
        finalImporterId = userId;
        finalAgentId = partnerId;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertShipmentQuery = `
      INSERT INTO shipments (
        type, port_of_shipment, port_of_destination, expected_arrival_date,
        bill_number, bayan_number, bayan_file_url,
        commercial_invoice_number, commercial_invoice_file_url,
        packing_list_file_url, purchase_order_number, other_documents_urls,
        duty_charges, comments, importer_id, agent_id, payment_partner,
        number_of_pallets, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING id
    `;

        const shipmentValues = [
            type, portOfShipment, portOfDestination, expectedArrivalDate,
            billNumber, bayanNumber, bayanFileUrl,
            commercialInvoiceNumber, commercialInvoiceFileUrl,
            packingListFileUrl, purchaseOrderNumber, otherDocumentsUrls,
            dutyCharges || null, comments, finalImporterId, finalAgentId, paymentPartner,
            numberOfPallets || null, userId
        ];

        const res = await client.query(insertShipmentQuery, shipmentValues);
        const shipmentId = res.rows[0].id;

        if (type === 'Land' && trucks && trucks.length > 0) {
            const insertTruckQuery = `
        INSERT INTO shipment_trucks (
          shipment_id, vehicle_number, driver_name, driver_mobile_origin, driver_mobile_destination
        ) VALUES ($1, $2, $3, $4, $5)
      `;

            for (const truck of trucks) {
                await client.query(insertTruckQuery, [
                    shipmentId, truck.vehicleNumber, truck.driverName,
                    truck.driverMobileOrigin, truck.driverMobileDestination
                ]);
            }
        }

        await client.query('COMMIT');
        return NextResponse.json({ success: true, shipmentId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating shipment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
