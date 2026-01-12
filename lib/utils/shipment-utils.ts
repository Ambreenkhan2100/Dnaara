import { Pool } from "pg";


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function generateUniqueShipmentId(
    type: string,
    portOfShipment: string,
    portOfDestination: string
): Promise<string> {
    const maxAttempts = 5;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        const typePrefix = type.charAt(0).toUpperCase();
        const originCode = portOfShipment.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 3).padEnd(3, 'X');
        const destCode = portOfDestination.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 3).padEnd(3, 'X');
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        
        const shipmentId = `${typePrefix}-${originCode}-${destCode}-${randomNum}`;
        const client = await pool.connect();
        
        // Check if ID exists
        const result = await client.query(
            'SELECT 1 FROM shipments WHERE shipment_id = $1',
            [shipmentId]
        );
        
        if (result.rows.length === 0) {
            return shipmentId;
        }
        
        attempts++;
    }
    
    throw new Error('Failed to generate a unique shipment ID after multiple attempts');
}